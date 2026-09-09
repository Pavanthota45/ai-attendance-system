const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// ========================================
// GET LOGGED-IN STUDENT ATTENDANCE
// STUDENT ONLY
// ========================================

router.get("/student/:studentId", async (req, res) => {

    if (req.user.role !== "STUDENT") {
        return res.status(403).json({
            success: false,
            message: "Student access required"
        });
    }

    try {

        // Find student profile using JWT user ID
        const [student] = await pool.query(
            `SELECT id
             FROM students
             WHERE user_id = ?`,
            [req.user.id]
        );

        if (student.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        const studentId = student[0].id;

        // Prevent student from accessing another student's data
        if (Number(req.params.studentId) !== Number(studentId)) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own attendance"
            });
        }


        // Overall attendance
        const [overall] = await pool.query(`
            SELECT
                COUNT(*) AS total_sessions,

                SUM(
                    CASE
                        WHEN a.status IN ('PRESENT', 'LATE')
                        THEN 1
                        ELSE 0
                    END
                ) AS attended_sessions,

                ROUND(
                    (
                        SUM(
                            CASE
                                WHEN a.status IN ('PRESENT', 'LATE')
                                THEN 1
                                ELSE 0
                            END
                        ) / NULLIF(COUNT(*), 0)
                    ) * 100,
                    2
                ) AS attendance_percentage

            FROM attendance a

            WHERE a.student_id = ?
        `, [studentId]);


        res.json({
            success: true,
            data: {
                student_id: studentId,
                total_sessions: overall[0].total_sessions || 0,
                attended_sessions: overall[0].attended_sessions || 0,
                attendance_percentage:
                    overall[0].attendance_percentage || 0
            }
        });


    } catch (error) {

        console.error(
            "Error fetching student attendance:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching student attendance"
        });
    }
});


// ========================================
// GET STUDENT SUBJECT-WISE ATTENDANCE
// STUDENT ONLY
// ========================================

router.get(
    "/student/:studentId/subjects",
    async (req, res) => {

        if (req.user.role !== "STUDENT") {
            return res.status(403).json({
                success: false,
                message: "Student access required"
            });
        }

        try {

            // Find logged-in student
            const [student] = await pool.query(
                `SELECT id
                 FROM students
                 WHERE user_id = ?`,
                [req.user.id]
            );

            if (student.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found"
                });
            }

            const studentId = student[0].id;


            // Prevent access to another student
            if (
                Number(req.params.studentId) !==
                Number(studentId)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only view your own attendance"
                });
            }


            // Subject-wise attendance
            const [subjects] = await pool.query(`
                SELECT
                    s.id AS subject_id,
                    s.name AS subject_name,
                    s.code AS subject_code,

                    COUNT(a.id) AS total_sessions,

                    SUM(
                        CASE
                            WHEN a.status IN ('PRESENT', 'LATE')
                            THEN 1
                            ELSE 0
                        END
                    ) AS attended_sessions,

                    ROUND(
                        (
                            SUM(
                                CASE
                                    WHEN a.status IN ('PRESENT', 'LATE')
                                    THEN 1
                                    ELSE 0
                                END
                            ) / NULLIF(COUNT(a.id), 0)
                        ) * 100,
                        2
                    ) AS attendance_percentage

                FROM attendance a

                JOIN attendance_sessions ats
                    ON a.session_id = ats.id

                JOIN teacher_subjects ts
                    ON ats.teacher_subject_id = ts.id

                JOIN subjects s
                    ON ts.subject_id = s.id

                WHERE a.student_id = ?

                GROUP BY
                    s.id,
                    s.name,
                    s.code

                ORDER BY s.name
            `, [studentId]);


            res.json({
                success: true,
                count: subjects.length,
                data: subjects
            });


        } catch (error) {

            console.error(
                "Error fetching subject attendance:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error fetching subject attendance"
            });
        }
    }
);


// ========================================
// GET STUDENT ATTENDANCE HISTORY
// STUDENT ONLY
// ========================================

router.get(
    "/student/:studentId/history",
    async (req, res) => {

        if (req.user.role !== "STUDENT") {
            return res.status(403).json({
                success: false,
                message: "Student access required"
            });
        }

        try {

            // Find logged-in student
            const [student] = await pool.query(
                `SELECT id
                 FROM students
                 WHERE user_id = ?`,
                [req.user.id]
            );

            if (student.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student profile not found"
                });
            }

            const studentId = student[0].id;


            // Prevent access to another student
            if (
                Number(req.params.studentId) !==
                Number(studentId)
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only view your own attendance"
                });
            }


            // Attendance history
            const [history] = await pool.query(`
                SELECT

                    ats.id AS session_id,

                    ats.session_date,
                    ats.start_time,
                    ats.end_time,

                    s.name AS subject_name,
                    s.code AS subject_code,

                    tu.name AS teacher_name,

                    d.name AS department_name,
                    c.year,
                    c.section,
                    c.academic_year,

                    a.status,
                    a.marked_at

                FROM attendance a

                JOIN attendance_sessions ats
                    ON a.session_id = ats.id

                JOIN teacher_subjects ts
                    ON ats.teacher_subject_id = ts.id

                JOIN subjects s
                    ON ts.subject_id = s.id

                JOIN teachers t
                    ON ts.teacher_id = t.id

                JOIN users tu
                    ON t.user_id = tu.id

                JOIN classes c
                    ON ts.class_id = c.id

                JOIN departments d
                    ON c.department_id = d.id

                WHERE a.student_id = ?

                ORDER BY
                    ats.session_date DESC,
                    ats.start_time DESC
            `, [studentId]);


            res.json({
                success: true,
                count: history.length,
                data: history
            });


        } catch (error) {

            console.error(
                "Error fetching attendance history:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error fetching attendance history"
            });
        }
    }
);


module.exports = router;