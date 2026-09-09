const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// ========================================
// GET STUDENTS OF A CLASS
// ADMIN OR ASSIGNED TEACHER
// ========================================

router.get("/class/:classId/students", async (req, res) => {

    try {

        const classId = req.params.classId;


        // ADMIN can access any class

        if (req.user.role === "ADMIN") {

            const [students] = await pool.query(`
                SELECT
                    st.id AS student_id,
                    u.id AS user_id,
                    u.name,
                    u.email,
                    st.roll_number

                FROM students st

                JOIN users u
                    ON st.user_id = u.id

                JOIN student_classes sc
                    ON st.id = sc.student_id

                WHERE sc.class_id = ?

                ORDER BY st.roll_number
            `, [classId]);


            return res.json({
                success: true,
                count: students.length,
                data: students
            });
        }


        // Only TEACHER can continue

        if (req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }


        // Find logged-in teacher

        const [teacher] = await pool.query(
            `SELECT id
             FROM teachers
             WHERE user_id = ?`,
            [req.user.id]
        );


        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }


        const teacherId = teacher[0].id;


        // Check teacher is assigned to this class

        const [assignment] = await pool.query(
            `SELECT id
             FROM teacher_subjects
             WHERE teacher_id = ?
             AND class_id = ?
             LIMIT 1`,
            [
                teacherId,
                classId
            ]
        );


        if (assignment.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not assigned to this class"
            });
        }


        // Get students

        const [students] = await pool.query(`
            SELECT
                st.id AS student_id,
                u.id AS user_id,
                u.name,
                u.email,
                st.roll_number

            FROM students st

            JOIN users u
                ON st.user_id = u.id

            JOIN student_classes sc
                ON st.id = sc.student_id

            WHERE sc.class_id = ?

            ORDER BY st.roll_number
        `, [classId]);


        res.json({
            success: true,
            count: students.length,
            data: students
        });


    } catch (error) {

        console.error(
            "Error fetching class students:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching class students"
        });
    }
});


// ========================================
// MARK SINGLE ATTENDANCE
// TEACHER ONLY
// ========================================

router.post("/", async (req, res) => {

    if (req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }


    try {

        const {
            session_id,
            student_id,
            status
        } = req.body;


        // Validate input

        if (
            !session_id ||
            !student_id ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Session, student and status are required"
            });
        }


        // Validate status

        const validStatuses = [
            "PRESENT",
            "ABSENT",
            "LATE"
        ];


        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Status must be PRESENT, ABSENT or LATE"
            });
        }


        // Find logged-in teacher

        const [teacher] = await pool.query(
            `SELECT id
             FROM teachers
             WHERE user_id = ?`,
            [req.user.id]
        );


        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }


        const teacherId = teacher[0].id;


        // Get session and verify ownership

        const [session] = await pool.query(
            `SELECT
                a.id AS session_id,
                ts.id AS assignment_id,
                ts.class_id,
                ts.teacher_id

             FROM attendance_sessions a

             JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

             WHERE a.id = ?
             AND ts.teacher_id = ?`,
            [
                session_id,
                teacherId
            ]
        );


        if (session.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to mark attendance for this session"
            });
        }


        const classId = session[0].class_id;


        // Check student belongs to session class

        const [student] = await pool.query(
            `SELECT id
             FROM student_classes
             WHERE student_id = ?
             AND class_id = ?`,
            [
                student_id,
                classId
            ]
        );


        if (student.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "Student does not belong to this class"
            });
        }


        // Check existing attendance

        const [existing] = await pool.query(
            `SELECT id
             FROM attendance
             WHERE session_id = ?
             AND student_id = ?`,
            [
                session_id,
                student_id
            ]
        );


        if (existing.length > 0) {

            await pool.query(
                `UPDATE attendance
                 SET status = ?,
                     marked_at = NOW()
                 WHERE session_id = ?
                 AND student_id = ?`,
                [
                    status,
                    session_id,
                    student_id
                ]
            );


            return res.json({
                success: true,
                message:
                    "Attendance updated successfully"
            });
        }


        // Insert attendance

        const [result] = await pool.query(
            `INSERT INTO attendance
            (
                session_id,
                student_id,
                status,
                marked_at
            )
            VALUES (?, ?, ?, NOW())`,
            [
                session_id,
                student_id,
                status
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Attendance marked successfully",
            attendanceId: result.insertId
        });


    } catch (error) {

        console.error(
            "Error marking attendance:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error marking attendance"
        });
    }
});


// ========================================
// MARK BULK ATTENDANCE
// TEACHER ONLY
// ========================================

router.post("/bulk", async (req, res) => {

    if (req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }


    try {

        const {
            session_id,
            attendance
        } = req.body;


        if (
            !session_id ||
            !Array.isArray(attendance) ||
            attendance.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Session ID and attendance list are required"
            });
        }


        // Find logged-in teacher

        const [teacher] = await pool.query(
            `SELECT id
             FROM teachers
             WHERE user_id = ?`,
            [req.user.id]
        );


        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }


        const teacherId = teacher[0].id;


        // Verify session belongs to teacher

        const [session] = await pool.query(
            `SELECT
                a.id AS session_id,
                ts.class_id

             FROM attendance_sessions a

             JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

             WHERE a.id = ?
             AND ts.teacher_id = ?`,
            [
                session_id,
                teacherId
            ]
        );


        if (session.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to mark attendance for this session"
            });
        }


        const classId = session[0].class_id;


        // Validate all students first

        for (const record of attendance) {

            if (
                !record.student_id ||
                !record.status
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Each attendance record requires student_id and status"
                });
            }


            const validStatuses = [
                "PRESENT",
                "ABSENT",
                "LATE"
            ];


            if (!validStatuses.includes(record.status)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid attendance status"
                });
            }


            const [student] = await pool.query(
                `SELECT id
                 FROM student_classes
                 WHERE student_id = ?
                 AND class_id = ?`,
                [
                    record.student_id,
                    classId
                ]
            );


            if (student.length === 0) {
                return res.status(403).json({
                    success: false,
                    message:
                        `Student ${record.student_id} does not belong to this class`
                });
            }
        }


        // Insert or update attendance

        for (const record of attendance) {

            const [existing] = await pool.query(
                `SELECT id
                 FROM attendance
                 WHERE session_id = ?
                 AND student_id = ?`,
                [
                    session_id,
                    record.student_id
                ]
            );


            if (existing.length > 0) {

                await pool.query(
                    `UPDATE attendance
                     SET status = ?,
                         marked_at = NOW()
                     WHERE session_id = ?
                     AND student_id = ?`,
                    [
                        record.status,
                        session_id,
                        record.student_id
                    ]
                );

            } else {

                await pool.query(
                    `INSERT INTO attendance
                    (
                        session_id,
                        student_id,
                        status,
                        marked_at
                    )
                    VALUES (?, ?, ?, NOW())`,
                    [
                        session_id,
                        record.student_id,
                        record.status
                    ]
                );
            }
        }


        res.json({
            success: true,
            message:
                "Bulk attendance marked successfully",
            count: attendance.length
        });


    } catch (error) {

        console.error(
            "Error marking bulk attendance:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error marking bulk attendance"
        });
    }
});


// ========================================
// GET ATTENDANCE FOR A SESSION
// ADMIN OR ASSIGNED TEACHER
// ========================================

router.get("/session/:sessionId", async (req, res) => {

    try {

        const sessionId = req.params.sessionId;


        // ADMIN can view any session

        if (req.user.role === "ADMIN") {

            const [records] = await pool.query(`
                SELECT
                    a.id AS attendance_id,
                    a.session_id,
                    a.student_id,
                    st.roll_number,
                    u.name AS student_name,
                    a.status,
                    a.marked_at

                FROM attendance a

                JOIN students st
                    ON a.student_id = st.id

                JOIN users u
                    ON st.user_id = u.id

                WHERE a.session_id = ?

                ORDER BY st.roll_number
            `, [sessionId]);


            return res.json({
                success: true,
                count: records.length,
                data: records
            });
        }


        // Only teacher can continue

        if (req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }


        // Find teacher

        const [teacher] = await pool.query(
            `SELECT id
             FROM teachers
             WHERE user_id = ?`,
            [req.user.id]
        );


        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found"
            });
        }


        const teacherId = teacher[0].id;


        // Verify session belongs to teacher

        const [session] = await pool.query(
            `SELECT a.id
             FROM attendance_sessions a

             JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

             WHERE a.id = ?
             AND ts.teacher_id = ?`,
            [
                sessionId,
                teacherId
            ]
        );


        if (session.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to view this session"
            });
        }


        // Get attendance

        const [records] = await pool.query(`
            SELECT
                a.id AS attendance_id,
                a.session_id,
                a.student_id,
                st.roll_number,
                u.name AS student_name,
                a.status,
                a.marked_at

            FROM attendance a

            JOIN students st
                ON a.student_id = st.id

            JOIN users u
                ON st.user_id = u.id

            WHERE a.session_id = ?

            ORDER BY st.roll_number
        `, [sessionId]);


        res.json({
            success: true,
            count: records.length,
            data: records
        });


    } catch (error) {

        console.error(
            "Error fetching attendance:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error fetching attendance"
        });
    }
});


module.exports = router;