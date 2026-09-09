const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// ========================================
// GET ALL ATTENDANCE SESSIONS
// ADMIN ONLY
// ========================================

router.get("/", async (req, res) => {

    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    try {

        const [sessions] = await pool.query(`
            SELECT
                a.id AS session_id,
                a.session_date,
                a.start_time,
                a.end_time,

                ts.id AS assignment_id,

                tu.name AS teacher_name,

                s.name AS subject_name,
                s.code AS subject_code,

                d.name AS department_name,
                d.code AS department_code,

                c.year,
                c.section,
                c.academic_year

            FROM attendance_sessions a

            JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

            JOIN teachers t
                ON ts.teacher_id = t.id

            JOIN users tu
                ON t.user_id = tu.id

            JOIN subjects s
                ON ts.subject_id = s.id

            JOIN classes c
                ON ts.class_id = c.id

            JOIN departments d
                ON c.department_id = d.id

            ORDER BY
                a.session_date DESC,
                a.start_time DESC
        `);

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });

    } catch (error) {

        console.error(
            "Error fetching attendance sessions:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching attendance sessions"
        });
    }
});


// ========================================
// CREATE ATTENDANCE SESSION
// TEACHER ONLY
// ========================================

router.post("/", async (req, res) => {

    if (!req.user || req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }

    try {

        const {
            teacher_subject_id,
            session_date,
            start_time
        } = req.body;


        // ========================================
        // VALIDATE INPUT
        // ========================================

        if (
            !teacher_subject_id ||
            !session_date ||
            !start_time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Teacher subject, session date and start time are required"
            });
        }


        // ========================================
        // GET LOGGED-IN TEACHER
        // ========================================

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


        // ========================================
        // VERIFY ASSIGNMENT
        // ========================================

        const [assignment] = await pool.query(
            `SELECT id
             FROM teacher_subjects
             WHERE id = ?
             AND teacher_id = ?`,
            [
                teacher_subject_id,
                teacherId
            ]
        );


        if (assignment.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not assigned to this subject and class"
            });
        }


        // ========================================
        // CHECK FOR ACTIVE SESSION
        //
        // IMPORTANT:
        // Only sessions with end_time IS NULL
        // are considered active.
        //
        // Ended sessions can exist for the same
        // subject and date without blocking a
        // new attendance session.
        // ========================================

        const [existing] = await pool.query(
            `SELECT
                a.id AS session_id,
                a.teacher_subject_id,
                a.session_date,
                a.start_time,
                a.end_time,

                ts.id AS assignment_id,

                s.name AS subject_name,
                s.code AS subject_code,

                c.id AS class_id,
                c.year,
                c.section,
                c.academic_year

             FROM attendance_sessions a

             JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

             JOIN subjects s
                ON ts.subject_id = s.id

             JOIN classes c
                ON ts.class_id = c.id

             WHERE a.teacher_subject_id = ?
             AND a.session_date = ?
             AND a.end_time IS NULL`,
            [
                teacher_subject_id,
                session_date
            ]
        );


        // ========================================
        // ACTIVE SESSION FOUND
        // ========================================

        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message:
                    "Attendance session already exists for this subject on this date",

                existingSession: existing[0]
            });
        }


        // ========================================
        // CREATE NEW SESSION
        // ========================================

        const [result] = await pool.query(
            `INSERT INTO attendance_sessions
            (
                teacher_subject_id,
                session_date,
                start_time
            )
            VALUES (?, ?, ?)`,
            [
                teacher_subject_id,
                session_date,
                start_time
            ]
        );


        // ========================================
        // RETURN CREATED SESSION
        // ========================================

        res.status(201).json({
            success: true,
            message:
                "Attendance session created successfully",

            sessionId: result.insertId,

            data: {
                id: result.insertId,
                session_id: result.insertId,
                teacher_subject_id:
                    Number(teacher_subject_id),
                session_date,
                start_time,
                end_time: null
            }
        });


    } catch (error) {

        console.error(
            "Error creating attendance session:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error creating attendance session"
        });
    }
});


// ========================================
// GET SESSION BY ID
// AUTHENTICATED USERS
// ========================================

router.get("/:id", async (req, res) => {

    try {

        const [sessions] = await pool.query(`
            SELECT
                a.id AS session_id,
                a.teacher_subject_id,
                a.session_date,
                a.start_time,
                a.end_time,

                ts.id AS assignment_id,

                tu.name AS teacher_name,

                s.name AS subject_name,
                s.code AS subject_code,

                d.name AS department_name,
                d.code AS department_code,

                c.id AS class_id,
                c.year,
                c.section,
                c.academic_year

            FROM attendance_sessions a

            JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

            JOIN teachers t
                ON ts.teacher_id = t.id

            JOIN users tu
                ON t.user_id = tu.id

            JOIN subjects s
                ON ts.subject_id = s.id

            JOIN classes c
                ON ts.class_id = c.id

            JOIN departments d
                ON c.department_id = d.id

            WHERE a.id = ?
        `, [req.params.id]);


        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }


        res.json({
            success: true,
            data: sessions[0]
        });


    } catch (error) {

        console.error(
            "Error fetching attendance session:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error fetching attendance session"
        });
    }
});


// ========================================
// END ATTENDANCE SESSION
// TEACHER ONLY
// ========================================

router.put("/:id/end", async (req, res) => {

    if (!req.user || req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }

    try {

        // ========================================
        // GET LOGGED-IN TEACHER
        // ========================================

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


        // ========================================
        // CHECK SESSION BELONGS TO TEACHER
        // ========================================

        const [session] = await pool.query(
            `SELECT
                a.id,
                a.end_time
             FROM attendance_sessions a

             JOIN teacher_subjects ts
                ON a.teacher_subject_id = ts.id

             WHERE a.id = ?
             AND ts.teacher_id = ?`,
            [
                req.params.id,
                teacherId
            ]
        );


        if (session.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "You do not have permission to end this session"
            });
        }


        // ========================================
        // ALREADY ENDED
        // ========================================

        if (session[0].end_time) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance session is already ended"
            });
        }


        // ========================================
        // END SESSION
        // ========================================

        await pool.query(
            `UPDATE attendance_sessions
             SET end_time = CURTIME()
             WHERE id = ?`,
            [req.params.id]
        );


        res.json({
            success: true,
            message:
                "Attendance session ended successfully"
        });


    } catch (error) {

        console.error(
            "Error ending attendance session:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error ending attendance session"
        });
    }
});


module.exports = router;