const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// =========================================================
// CALCULATE FACE DISTANCE
// =========================================================

function calculateFaceDistance(
    encoding1,
    encoding2
) {
    if (
        !Array.isArray(encoding1) ||
        !Array.isArray(encoding2)
    ) {
        return Infinity;
    }

    if (
        encoding1.length !== 128 ||
        encoding2.length !== 128
    ) {
        return Infinity;
    }

    let sum = 0;

    for (let i = 0; i < 128; i++) {
        const difference =
            encoding1[i] - encoding2[i];

        sum += difference * difference;
    }

    return Math.sqrt(sum);
}


// =========================================================
// REGISTER STUDENT FACE
// ADMIN ONLY
// =========================================================

router.post(
    "/register/:studentId",
    async (req, res) => {
        try {

            if (
                !req.user ||
                req.user.role !== "ADMIN"
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required"
                });
            }

            const { studentId } = req.params;
            const { encoding } = req.body;

            if (
                !encoding ||
                !Array.isArray(encoding)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Face encoding is required"
                });
            }

            if (encoding.length !== 128) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid face encoding"
                });
            }

            const [students] =
                await pool.query(
                    "SELECT id FROM students WHERE id = ?",
                    [studentId]
                );

            if (students.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const encodingJson =
                JSON.stringify(encoding);

            await pool.query(
                `UPDATE students
                 SET face_encoding = ?
                 WHERE id = ?`,
                [
                    encodingJson,
                    studentId
                ]
            );

            res.json({
                success: true,
                message:
                    "Student face registered successfully",
                studentId:
                    Number(studentId)
            });

        } catch (error) {

            console.error(
                "Face registration error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error registering student face"
            });
        }
    }
);


// =========================================================
// RECOGNIZE FACE FOR ATTENDANCE SESSION
// TEACHER / ADMIN
// =========================================================

router.post(
    "/recognize",
    async (req, res) => {
        try {

            // -------------------------------------------------
            // CHECK USER ROLE
            // -------------------------------------------------

            if (
                !req.user ||
                (
                    req.user.role !== "TEACHER" &&
                    req.user.role !== "ADMIN"
                )
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Teacher or admin access required"
                });
            }


            // -------------------------------------------------
            // GET REQUEST DATA
            // -------------------------------------------------

            const {
                encoding,
                session_id
            } = req.body;


            // -------------------------------------------------
            // VALIDATE ENCODING
            // -------------------------------------------------

            if (
                !encoding ||
                !Array.isArray(encoding)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Face encoding is required"
                });
            }

            if (encoding.length !== 128) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid face encoding"
                });
            }


            // -------------------------------------------------
            // VALIDATE SESSION ID
            // -------------------------------------------------

            if (!session_id) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Attendance session is required"
                });
            }


            // -------------------------------------------------
            // GET SESSION + CLASS
            // -------------------------------------------------

            const [sessions] =
                await pool.query(`
                    SELECT
                        ats.id AS session_id,
                        ats.end_time,
                        ts.teacher_id,
                        ts.class_id,
                        c.year,
                        c.section,
                        c.academic_year
                    FROM attendance_sessions ats
                    JOIN teacher_subjects ts
                        ON ats.teacher_subject_id = ts.id
                    JOIN classes c
                        ON ts.class_id = c.id
                    WHERE ats.id = ?
                `, [session_id]);


            if (sessions.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Attendance session not found"
                });
            }


            const session =
                sessions[0];


            // -------------------------------------------------
            // SESSION MUST BE ACTIVE
            // -------------------------------------------------

            if (session.end_time) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Attendance session has already ended"
                });
            }


            // -------------------------------------------------
            // TEACHER CAN ONLY USE THEIR OWN SESSION
            // -------------------------------------------------

            if (
                req.user.role === "TEACHER"
            ) {

                const [teachers] =
                    await pool.query(
                        `SELECT id
                         FROM teachers
                         WHERE user_id = ?`,
                        [req.user.id]
                    );

                if (teachers.length === 0) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "Teacher profile not found"
                    });
                }

                const teacherId =
                    teachers[0].id;

                if (
                    Number(session.teacher_id) !==
                    Number(teacherId)
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "You are not allowed to use this attendance session"
                    });
                }
            }


            // -------------------------------------------------
            // GET ONLY STUDENTS FROM THIS CLASS
            // -------------------------------------------------

            const [students] =
                await pool.query(`
                    SELECT
                        s.id,
                        s.user_id,
                        s.roll_number,
                        u.name,
                        u.email,
                        s.face_encoding
                    FROM students s
                    JOIN users u
                        ON s.user_id = u.id
                    JOIN student_classes sc
                        ON s.id = sc.student_id
                    WHERE sc.class_id = ?
                      AND s.face_encoding IS NOT NULL
                `, [session.class_id]);


            if (students.length === 0) {
                return res.json({
                    success: true,
                    recognized: false,
                    message:
                        "No registered student faces found in this class"
                });
            }


            // -------------------------------------------------
            // FIND BEST MATCH
            // -------------------------------------------------

            let bestMatch = null;
            let bestDistance = Infinity;


            for (
                const student of students
            ) {

                try {

                    const registeredEncoding =
                        JSON.parse(
                            student.face_encoding
                        );

                    const distance =
                        calculateFaceDistance(
                            encoding,
                            registeredEncoding
                        );


                    if (
                        distance <
                        bestDistance
                    ) {

                        bestDistance =
                            distance;

                        bestMatch =
                            student;
                    }

                } catch (parseError) {

                    console.error(
                        `Invalid face encoding for student ${student.id}`
                    );
                }
            }


            // -------------------------------------------------
            // FACE MATCH THRESHOLD
            // -------------------------------------------------

            const FACE_THRESHOLD = 0.55;


            if (
                !bestMatch ||
                bestDistance >
                FACE_THRESHOLD
            ) {

                return res.json({
                    success: true,
                    recognized: false,
                    message:
                        "Face not recognized",
                    distance:
                        bestDistance === Infinity
                            ? null
                            : Number(
                                bestDistance.toFixed(4)
                            )
                });
            }


            // -------------------------------------------------
            // SUCCESSFUL MATCH
            // -------------------------------------------------

            res.json({

                success: true,

                recognized: true,

                message:
                    "Face recognized successfully",

                student: {

                    id:
                        bestMatch.id,

                    user_id:
                        bestMatch.user_id,

                    name:
                        bestMatch.name,

                    email:
                        bestMatch.email,

                    roll_number:
                        bestMatch.roll_number
                },

                distance:
                    Number(
                        bestDistance.toFixed(4)
                    )
            });


        } catch (error) {

            console.error(
                "Face recognition error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error recognizing face"
            });
        }
    }
);


module.exports = router;