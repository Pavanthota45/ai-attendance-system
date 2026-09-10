const express = require("express");
const pool = require("../config/db");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL ATTENDANCE SESSIONS
|--------------------------------------------------------------------------
| Admin only
*/
router.get("/", async (req, res) => {
    try {
        if (!req.user || req.user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        const [sessions] = await pool.query(`
            SELECT
                ats.id,
                ats.teacher_subject_id,
                ats.session_date,
                ats.start_time,
                ats.end_time,

                ts.teacher_id,
                t.user_id AS teacher_user_id,
                tu.name AS teacher_name,

                ts.subject_id,
                s.name AS subject_name,
                s.code AS subject_code,

                ts.class_id,
                c.year,
                c.section,
                c.academic_year,

                d.id AS department_id,
                d.name AS department_name,
                d.code AS department_code

            FROM attendance_sessions ats

            JOIN teacher_subjects ts
                ON ats.teacher_subject_id = ts.id

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

            ORDER BY ats.session_date DESC, ats.start_time DESC
        `);

        res.json({
            success: true,
            count: sessions.length,
            data: sessions
        });

    } catch (error) {
        console.error("Error fetching attendance sessions:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching attendance sessions"
        });
    }
});


/*
|--------------------------------------------------------------------------
| CREATE TODAY'S ATTENDANCE SESSION
|--------------------------------------------------------------------------
| Teacher only
|
| Rules:
| 1. If an ACTIVE session already exists today:
|       Do not create another one.
|
| 2. If an ENDED session already exists today:
|       Do not create another one.
|       Tell frontend that it can be reopened.
|
| 3. If no session exists today:
|       Create a new session.
|--------------------------------------------------------------------------
*/
router.post("/", async (req, res) => {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }

        const { teacher_subject_id } = req.body;

        if (!teacher_subject_id) {
            return res.status(400).json({
                success: false,
                message: "teacher_subject_id is required"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Get logged-in teacher
        |--------------------------------------------------------------------------
        */
        const [teachers] = await pool.query(
            `
            SELECT id
            FROM teachers
            WHERE user_id = ?
            `,
            [req.user.id]
        );

        if (teachers.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const teacherId = teachers[0].id;


        /*
        |--------------------------------------------------------------------------
        | Verify that this assignment belongs to logged-in teacher
        |--------------------------------------------------------------------------
        */
        const [assignments] = await pool.query(
            `
            SELECT
                id,
                teacher_id,
                subject_id,
                class_id
            FROM teacher_subjects
            WHERE id = ?
            AND teacher_id = ?
            `,
            [teacher_subject_id, teacherId]
        );

        if (assignments.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to create an attendance session for this assignment"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Check for an ACTIVE session today
        |--------------------------------------------------------------------------
        */
        const [activeSessions] = await pool.query(
            `
            SELECT
                id,
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            FROM attendance_sessions
            WHERE teacher_subject_id = ?
            AND session_date = CURDATE()
            AND end_time IS NULL
            ORDER BY id DESC
            LIMIT 1
            `,
            [teacher_subject_id]
        );

        if (activeSessions.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Today's attendance session is already active",
                sessionType: "ACTIVE",
                canReopen: false,
                existingSession: activeSessions[0]
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Check for an ENDED session today
        |--------------------------------------------------------------------------
        | IMPORTANT:
        | We do NOT create another session.
        |
        | The teacher must reopen the existing session.
        |--------------------------------------------------------------------------
        */
        const [endedSessions] = await pool.query(
            `
            SELECT
                id,
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            FROM attendance_sessions
            WHERE teacher_subject_id = ?
            AND session_date = CURDATE()
            AND end_time IS NOT NULL
            ORDER BY id DESC
            LIMIT 1
            `,
            [teacher_subject_id]
        );

        if (endedSessions.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Today's attendance session has ended. Reopen the existing session to continue attendance.",
                sessionType: "ENDED",
                canReopen: true,
                existingSession: endedSessions[0]
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Create a completely NEW session
        |--------------------------------------------------------------------------
        | This happens only when there is no session today.
        |
        | The frontend will initialize every student as ABSENT.
        |--------------------------------------------------------------------------
        */
        const [result] = await pool.query(
            `
            INSERT INTO attendance_sessions
            (
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            )
            VALUES
            (
                ?,
                CURDATE(),
                CURTIME(),
                NULL
            )
            `,
            [teacher_subject_id]
        );


        /*
        |--------------------------------------------------------------------------
        | Get newly created session
        |--------------------------------------------------------------------------
        */
        const [newSessions] = await pool.query(
            `
            SELECT
                id,
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            FROM attendance_sessions
            WHERE id = ?
            `,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Attendance session created successfully",
            sessionType: "NEW",
            canReopen: false,
            data: newSessions[0]
        });

    } catch (error) {
        console.error("Error creating attendance session:", error);

        res.status(500).json({
            success: false,
            message: "Error creating attendance session"
        });
    }
});


/*
|--------------------------------------------------------------------------
| GET SINGLE ATTENDANCE SESSION
|--------------------------------------------------------------------------
| Admin and authenticated users
|--------------------------------------------------------------------------
*/
router.get("/:id", async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const sessionId = req.params.id;

        const [sessions] = await pool.query(
            `
            SELECT
                ats.id,
                ats.id AS session_id,
                ats.teacher_subject_id,
                ats.session_date,
                ats.start_time,
                ats.end_time,

                ts.id AS assignment_id,
                ts.teacher_id,
                ts.subject_id,
                ts.class_id,

                t.user_id AS teacher_user_id,
                tu.name AS teacher_name,

                s.name AS subject_name,
                s.code AS subject_code,

                c.year,
                c.section,
                c.academic_year,

                d.id AS department_id,
                d.name AS department_name,
                d.code AS department_code

            FROM attendance_sessions ats

            JOIN teacher_subjects ts
                ON ats.teacher_subject_id = ts.id

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

            WHERE ats.id = ?
            `,
            [sessionId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }

        const session = sessions[0];


        /*
        |--------------------------------------------------------------------------
        | Teacher can only view their own session
        |--------------------------------------------------------------------------
        */
        if (req.user.role === "TEACHER") {
            const [teachers] = await pool.query(
                `
                SELECT id
                FROM teachers
                WHERE user_id = ?
                `,
                [req.user.id]
            );

            if (teachers.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Teacher profile not found"
                });
            }

            const teacherId = teachers[0].id;

            if (Number(session.teacher_id) !== Number(teacherId)) {
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to view this attendance session"
                });
            }
        }


        res.json({
            success: true,
            data: session
        });

    } catch (error) {
        console.error("Error fetching attendance session:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching attendance session"
        });
    }
});


/*
|--------------------------------------------------------------------------
| END ATTENDANCE SESSION
|--------------------------------------------------------------------------
| Teacher only
|--------------------------------------------------------------------------
*/
router.put("/:id/end", async (req, res) => {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }

        const sessionId = req.params.id;


        /*
        |--------------------------------------------------------------------------
        | Get logged-in teacher
        |--------------------------------------------------------------------------
        */
        const [teachers] = await pool.query(
            `
            SELECT id
            FROM teachers
            WHERE user_id = ?
            `,
            [req.user.id]
        );

        if (teachers.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const teacherId = teachers[0].id;


        /*
        |--------------------------------------------------------------------------
        | Verify session belongs to teacher
        |--------------------------------------------------------------------------
        */
        const [sessions] = await pool.query(
            `
            SELECT
                ats.id,
                ats.teacher_subject_id,
                ats.session_date,
                ats.start_time,
                ats.end_time,
                ts.teacher_id
            FROM attendance_sessions ats

            JOIN teacher_subjects ts
                ON ats.teacher_subject_id = ts.id

            WHERE ats.id = ?
            `,
            [sessionId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }

        const session = sessions[0];

        if (Number(session.teacher_id) !== Number(teacherId)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to end this attendance session"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Check if already ended
        |--------------------------------------------------------------------------
        */
        if (session.end_time !== null) {
            return res.status(400).json({
                success: false,
                message: "Attendance session has already ended"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | End the session
        |--------------------------------------------------------------------------
        */
        await pool.query(
            `
            UPDATE attendance_sessions
            SET end_time = CURTIME()
            WHERE id = ?
            `,
            [sessionId]
        );


        /*
        |--------------------------------------------------------------------------
        | Get updated session
        |--------------------------------------------------------------------------
        */
        const [updatedSessions] = await pool.query(
            `
            SELECT
                id,
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            FROM attendance_sessions
            WHERE id = ?
            `,
            [sessionId]
        );

        res.json({
            success: true,
            message: "Attendance session ended successfully",
            data: updatedSessions[0]
        });

    } catch (error) {
        console.error("Error ending attendance session:", error);

        res.status(500).json({
            success: false,
            message: "Error ending attendance session"
        });
    }
});


/*
|--------------------------------------------------------------------------
| REOPEN TODAY'S ATTENDANCE SESSION
|--------------------------------------------------------------------------
| Teacher only
|
| IMPORTANT RULE:
| A session can ONLY be reopened on the SAME DAY.
|
| Example:
| Session created today
|        ↓
| Teacher marks Rahul PRESENT
|        ↓
| Teacher ends session
|        ↓
| Rahul remains PRESENT
|        ↓
| Teacher reopens session today
|        ↓
| Rahul is still PRESENT
|        ↓
| Other students remain ABSENT
|--------------------------------------------------------------------------
*/
router.put("/:id/reopen", async (req, res) => {
    try {
        if (!req.user || req.user.role !== "TEACHER") {
            return res.status(403).json({
                success: false,
                message: "Teacher access required"
            });
        }

        const sessionId = req.params.id;


        /*
        |--------------------------------------------------------------------------
        | Get logged-in teacher
        |--------------------------------------------------------------------------
        */
        const [teachers] = await pool.query(
            `
            SELECT id
            FROM teachers
            WHERE user_id = ?
            `,
            [req.user.id]
        );

        if (teachers.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Teacher profile not found"
            });
        }

        const teacherId = teachers[0].id;


        /*
        |--------------------------------------------------------------------------
        | Get session and verify ownership
        |--------------------------------------------------------------------------
        */
        const [sessions] = await pool.query(
            `
            SELECT
                ats.id,
                ats.teacher_subject_id,
                ats.session_date,
                ats.start_time,
                ats.end_time,
                ts.teacher_id,
                ts.subject_id,
                ts.class_id
            FROM attendance_sessions ats

            JOIN teacher_subjects ts
                ON ats.teacher_subject_id = ts.id

            WHERE ats.id = ?
            `,
            [sessionId]
        );

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance session not found"
            });
        }

        const session = sessions[0];


        /*
        |--------------------------------------------------------------------------
        | Verify logged-in teacher owns this session
        |--------------------------------------------------------------------------
        */
        if (Number(session.teacher_id) !== Number(teacherId)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to reopen this attendance session"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | If already active, no need to reopen
        |--------------------------------------------------------------------------
        */
        if (session.end_time === null) {
            return res.status(400).json({
                success: false,
                message: "Attendance session is already active"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | SAME DAY CHECK
        |--------------------------------------------------------------------------
        | The session date must be today's date.
        |--------------------------------------------------------------------------
        */
        const [todayCheck] = await pool.query(
            `
            SELECT
                session_date = CURDATE() AS is_today
            FROM attendance_sessions
            WHERE id = ?
            `,
            [sessionId]
        );

        if (
            todayCheck.length === 0 ||
            Number(todayCheck[0].is_today) !== 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Only today's attendance session can be reopened"
            });
        }


        /*
        |--------------------------------------------------------------------------
        | Reopen session
        |--------------------------------------------------------------------------
        | end_time becomes NULL again.
        |
        | Existing attendance records are NOT deleted.
        | Therefore:
        |
        | PRESENT stays PRESENT
        | LATE stays LATE
        | ABSENT stays ABSENT
        | Unmarked students can still be marked later.
        |--------------------------------------------------------------------------
        */
        await pool.query(
            `
            UPDATE attendance_sessions
            SET end_time = NULL
            WHERE id = ?
            `,
            [sessionId]
        );


        /*
        |--------------------------------------------------------------------------
        | Get reopened session
        |--------------------------------------------------------------------------
        */
        const [reopenedSessions] = await pool.query(
            `
            SELECT
                id,
                id AS session_id,
                teacher_subject_id,
                session_date,
                start_time,
                end_time
            FROM attendance_sessions
            WHERE id = ?
            `,
            [sessionId]
        );

        res.json({
            success: true,
            message: "Today's attendance session reopened successfully",
            data: reopenedSessions[0]
        });

    } catch (error) {
        console.error("Error reopening attendance session:", error);

        res.status(500).json({
            success: false,
            message: "Error reopening attendance session"
        });
    }
});


module.exports = router;