const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// ========================================
// ADMIN CHECK
// ========================================

const checkAdmin = (req, res) => {
    if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({
            success: false,
            message: "Admin access required"
        });

        return false;
    }

    return true;
};


// ========================================
// TEACHER CHECK
// ========================================

const checkTeacher = (req, res) => {
    if (!req.user || req.user.role !== "TEACHER") {
        res.status(403).json({
            success: false,
            message: "Teacher access required"
        });

        return false;
    }

    return true;
};


// ========================================
// GET ALL ASSIGNMENTS
// ADMIN ONLY
// ========================================

router.get("/", async (req, res) => {

    if (!checkAdmin(req, res)) {
        return;
    }

    try {

        const [assignments] = await pool.query(`
            SELECT
                ts.id,

                t.id AS teacher_id,
                tu.name AS teacher_name,
                tu.email AS teacher_email,

                s.id AS subject_id,
                s.name AS subject_name,
                s.code AS subject_code,

                c.id AS class_id,

                d.name AS department_name,
                d.code AS department_code,

                c.year,
                c.section,
                c.academic_year

            FROM teacher_subjects ts

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
                tu.name,
                s.name,
                d.name,
                c.year,
                c.section
        `);


        res.json({
            success: true,
            count: assignments.length,
            data: assignments
        });

    } catch (error) {

        console.error(
            "Error fetching teacher assignments:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching teacher assignments"
        });
    }
});


// ========================================
// CREATE ASSIGNMENT
// ADMIN ONLY
// ========================================

router.post("/", async (req, res) => {

    if (!checkAdmin(req, res)) {
        return;
    }

    try {

        const {
            teacher_id,
            subject_id,
            class_id
        } = req.body;


        // Validate input

        if (
            !teacher_id ||
            !subject_id ||
            !class_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Teacher, subject and class are required"
            });
        }


        // Check teacher

        const [teacher] = await pool.query(
            `SELECT id
             FROM teachers
             WHERE id = ?`,
            [teacher_id]
        );


        if (teacher.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }


        // Check subject

        const [subject] = await pool.query(
            `SELECT id
             FROM subjects
             WHERE id = ?`,
            [subject_id]
        );


        if (subject.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }


        // Check class

        const [classExists] = await pool.query(
            `SELECT id
             FROM classes
             WHERE id = ?`,
            [class_id]
        );


        if (classExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }


        // Check duplicate assignment

        const [existing] = await pool.query(
            `SELECT id
             FROM teacher_subjects
             WHERE teacher_id = ?
             AND subject_id = ?
             AND class_id = ?`,
            [
                teacher_id,
                subject_id,
                class_id
            ]
        );


        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "This teacher is already assigned to this subject and class"
            });
        }


        // Create assignment

        const [result] = await pool.query(
            `INSERT INTO teacher_subjects
            (
                teacher_id,
                subject_id,
                class_id
            )
            VALUES (?, ?, ?)`,
            [
                teacher_id,
                subject_id,
                class_id
            ]
        );


        res.status(201).json({
            success: true,
            message:
                "Teacher assigned to subject and class successfully",
            assignmentId: result.insertId
        });


    } catch (error) {

        console.error(
            "Error creating teacher assignment:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error creating teacher assignment"
        });
    }
});


// ========================================
// GET LOGGED-IN TEACHER ASSIGNMENTS
// TEACHER ONLY
// ========================================

router.get(
    "/my-assignments",
    async (req, res) => {

        if (!checkTeacher(req, res)) {
            return;
        }

        try {

            // Get user ID from JWT

            const userId = req.user.id;


            // Find teacher profile

            const [teacher] = await pool.query(
                `SELECT id
                 FROM teachers
                 WHERE user_id = ?`,
                [userId]
            );


            if (teacher.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Teacher profile not found"
                });
            }


            const teacherId = teacher[0].id;


            // Get only this teacher's assignments

            const [assignments] = await pool.query(`
                SELECT
                    ts.id AS assignment_id,

                    s.id AS subject_id,
                    s.name AS subject_name,
                    s.code AS subject_code,

                    c.id AS class_id,

                    d.name AS department_name,
                    d.code AS department_code,

                    c.year,
                    c.section,
                    c.academic_year

                FROM teacher_subjects ts

                JOIN subjects s
                    ON ts.subject_id = s.id

                JOIN classes c
                    ON ts.class_id = c.id

                JOIN departments d
                    ON c.department_id = d.id

                WHERE ts.teacher_id = ?

                ORDER BY
                    s.name,
                    d.name,
                    c.year,
                    c.section
            `, [teacherId]);


            res.json({
                success: true,
                teacher_id: teacherId,
                count: assignments.length,
                data: assignments
            });


        } catch (error) {

            console.error(
                "Error fetching logged-in teacher assignments:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error fetching teacher assignments"
            });
        }
    }
);


// ========================================
// GET SPECIFIC TEACHER ASSIGNMENTS
// ADMIN ONLY
// ========================================

router.get(
    "/teacher/:teacherId",
    async (req, res) => {

        if (!checkAdmin(req, res)) {
            return;
        }

        try {

            const [assignments] = await pool.query(`
                SELECT
                    ts.id AS assignment_id,

                    s.id AS subject_id,
                    s.name AS subject_name,
                    s.code AS subject_code,

                    c.id AS class_id,

                    d.name AS department_name,
                    d.code AS department_code,

                    c.year,
                    c.section,
                    c.academic_year

                FROM teacher_subjects ts

                JOIN subjects s
                    ON ts.subject_id = s.id

                JOIN classes c
                    ON ts.class_id = c.id

                JOIN departments d
                    ON c.department_id = d.id

                WHERE ts.teacher_id = ?

                ORDER BY
                    s.name,
                    d.name,
                    c.year,
                    c.section
            `, [req.params.teacherId]);


            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });


        } catch (error) {

            console.error(
                "Error fetching teacher assignments:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error fetching teacher assignments"
            });
        }
    }
);


// ========================================
// GET CLASS ASSIGNMENTS
// ADMIN ONLY
// ========================================

router.get(
    "/class/:classId",
    async (req, res) => {

        if (!checkAdmin(req, res)) {
            return;
        }

        try {

            const [assignments] = await pool.query(`
                SELECT
                    ts.id AS assignment_id,

                    t.id AS teacher_id,
                    tu.name AS teacher_name,

                    s.id AS subject_id,
                    s.name AS subject_name,
                    s.code AS subject_code,

                    c.id AS class_id,

                    d.name AS department_name,
                    d.code AS department_code,

                    c.year,
                    c.section,
                    c.academic_year

                FROM teacher_subjects ts

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

                WHERE ts.class_id = ?

                ORDER BY
                    s.name,
                    tu.name
            `, [req.params.classId]);


            res.json({
                success: true,
                count: assignments.length,
                data: assignments
            });


        } catch (error) {

            console.error(
                "Error fetching class assignments:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Error fetching class assignments"
            });
        }
    }
);


module.exports = router;