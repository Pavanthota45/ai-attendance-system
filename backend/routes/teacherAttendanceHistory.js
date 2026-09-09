const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    if (!req.user || req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }

    try {
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

        const [sessions] = await pool.query(
            `
            SELECT
                ats.id AS session_id,
                ats.session_date,
                ats.start_time,
                ats.end_time,

                ts.id AS assignment_id,

                s.name AS subject_name,
                s.code AS subject_code,

                d.name AS department_name,
                d.code AS department_code,

                c.id AS class_id,
                c.year,
                c.section,
                c.academic_year,

                COUNT(a.id) AS total_marked,

                COALESCE(
                    SUM(
                        CASE
                            WHEN a.status = 'PRESENT'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS present_count,

                COALESCE(
                    SUM(
                        CASE
                            WHEN a.status = 'ABSENT'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS absent_count,

                COALESCE(
                    SUM(
                        CASE
                            WHEN a.status = 'LATE'
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS late_count

            FROM attendance_sessions ats

            JOIN teacher_subjects ts
                ON ats.teacher_subject_id = ts.id

            JOIN subjects s
                ON ts.subject_id = s.id

            JOIN classes c
                ON ts.class_id = c.id

            JOIN departments d
                ON c.department_id = d.id

            LEFT JOIN attendance a
                ON ats.id = a.session_id

            WHERE ts.teacher_id = ?

            GROUP BY
                ats.id,
                ats.session_date,
                ats.start_time,
                ats.end_time,
                ts.id,
                s.name,
                s.code,
                d.name,
                d.code,
                c.id,
                c.year,
                c.section,
                c.academic_year

            ORDER BY
                ats.session_date DESC,
                ats.start_time DESC
            `,
            [teacherId]
        );

        const history = sessions.map((session) => {
            const totalMarked = Number(session.total_marked);
            const presentCount = Number(session.present_count);
            const absentCount = Number(session.absent_count);
            const lateCount = Number(session.late_count);

            const attendedCount = presentCount + lateCount;

            const attendancePercentage =
                totalMarked > 0
                    ? Number(
                        (
                            (attendedCount / totalMarked) *
                            100
                        ).toFixed(2)
                    )
                    : 0;

            return {
                session_id: session.session_id,
                session_date: session.session_date,
                start_time: session.start_time,
                end_time: session.end_time,

                assignment_id: session.assignment_id,

                subject_name: session.subject_name,
                subject_code: session.subject_code,

                department_name: session.department_name,
                department_code: session.department_code,

                class_id: session.class_id,
                year: session.year,
                section: session.section,
                academic_year: session.academic_year,

                total_marked: totalMarked,
                present_count: presentCount,
                absent_count: absentCount,
                late_count: lateCount,

                attendance_percentage: attendancePercentage
            };
        });

        res.json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {
        console.error(
            "Error fetching teacher attendance history:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching teacher attendance history"
        });
    }
});

module.exports = router;