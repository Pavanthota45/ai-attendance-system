const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();


// =========================================================
// GET CURRENT LOGGED-IN STUDENT
// =========================================================

router.get("/me", async (req, res) => {
    try {
        const userId = req.user.id;

        const [students] = await pool.query(`
            SELECT
                s.id,
                s.user_id,
                u.name,
                u.email,
                s.roll_number,
                c.id AS class_id,
                d.name AS department_name,
                d.code AS department_code,
                c.year,
                c.section,
                c.academic_year
            FROM students s
            JOIN users u
                ON s.user_id = u.id
            LEFT JOIN student_classes sc
                ON s.id = sc.student_id
            LEFT JOIN classes c
                ON sc.class_id = c.id
            LEFT JOIN departments d
                ON c.department_id = d.id
            WHERE s.user_id = ?
        `, [userId]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student record not found"
            });
        }

        res.json({
            success: true,
            data: students[0]
        });

    } catch (error) {
        console.error(
            "Error fetching current student:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching current student"
        });
    }
});


// =========================================================
// GET ALL STUDENTS
// =========================================================

router.get("/", async (req, res) => {
    try {
        const [students] = await pool.query(`
            SELECT
                s.id,
                s.user_id,
                u.name,
                u.email,
                s.roll_number,
                c.id AS class_id,
                d.name AS department_name,
                d.code AS department_code,
                c.year,
                c.section,
                c.academic_year
            FROM students s
            JOIN users u
                ON s.user_id = u.id
            LEFT JOIN student_classes sc
                ON s.id = sc.student_id
            LEFT JOIN classes c
                ON sc.class_id = c.id
            LEFT JOIN departments d
                ON c.department_id = d.id
            ORDER BY
                d.name,
                c.year,
                c.section,
                s.roll_number
        `);

        res.json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error(
            "Error fetching students:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching students"
        });
    }
});


// =========================================================
// GET STUDENTS BY CLASS
// =========================================================

router.get("/class/:classId", async (req, res) => {
    try {
        const [students] = await pool.query(`
            SELECT
                s.id,
                s.user_id,
                u.name,
                u.email,
                s.roll_number,
                c.id AS class_id,
                d.name AS department_name,
                d.code AS department_code,
                c.year,
                c.section,
                c.academic_year
            FROM students s
            JOIN users u
                ON s.user_id = u.id
            JOIN student_classes sc
                ON s.id = sc.student_id
            JOIN classes c
                ON sc.class_id = c.id
            JOIN departments d
                ON c.department_id = d.id
            WHERE c.id = ?
            ORDER BY s.roll_number
        `, [req.params.classId]);

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
            message:
                "Error fetching students for this class"
        });
    }
});


// =========================================================
// CREATE STUDENT
// Initial password = roll number
// =========================================================

router.post("/", async (req, res) => {
    let connection;

    try {
        const {
            name,
            email,
            roll_number,
            class_id
        } = req.body;

        if (
            !name ||
            !email ||
            !roll_number ||
            !class_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email, roll number and class are required"
            });
        }

        // Check email
        const [existingEmail] =
            await pool.query(
                "SELECT id FROM users WHERE email = ?",
                [email]
            );

        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Email already exists"
            });
        }

        // Check roll number
        const [existingRoll] =
            await pool.query(
                "SELECT id FROM students WHERE roll_number = ?",
                [roll_number]
            );

        if (existingRoll.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Roll number already exists"
            });
        }

        // Check class
        const [classExists] =
            await pool.query(
                "SELECT id FROM classes WHERE id = ?",
                [class_id]
            );

        if (classExists.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Class not found"
            });
        }

        const initialPassword =
            String(roll_number);

        connection =
            await pool.getConnection();

        await connection.beginTransaction();

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                initialPassword,
                10
            );

        // Create user
        const [userResult] =
            await connection.query(
                `INSERT INTO users
                (name, email, password, role)
                VALUES (?, ?, ?, 'STUDENT')`,
                [
                    name,
                    email,
                    hashedPassword
                ]
            );

        const userId =
            userResult.insertId;

        // Create student
        const [studentResult] =
            await connection.query(
                `INSERT INTO students
                (user_id, roll_number)
                VALUES (?, ?)`,
                [
                    userId,
                    roll_number
                ]
            );

        const studentId =
            studentResult.insertId;

        // Assign student to class
        await connection.query(
            `INSERT INTO student_classes
            (student_id, class_id)
            VALUES (?, ?)`,
            [
                studentId,
                class_id
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message:
                "Student created successfully",
            studentId: studentId,
            userId: userId,
            credentials: {
                email: email,
                initialPassword:
                    initialPassword
            }
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            "Error creating student:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error creating student"
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
});


// =========================================================
// GET STUDENT BY ID
// =========================================================

router.get("/:id", async (req, res) => {
    try {
        const [students] =
            await pool.query(`
                SELECT
                    s.id,
                    s.user_id,
                    u.name,
                    u.email,
                    s.roll_number,
                    c.id AS class_id,
                    d.name AS department_name,
                    d.code AS department_code,
                    c.year,
                    c.section,
                    c.academic_year
                FROM students s
                JOIN users u
                    ON s.user_id = u.id
                LEFT JOIN student_classes sc
                    ON s.id = sc.student_id
                LEFT JOIN classes c
                    ON sc.class_id = c.id
                LEFT JOIN departments d
                    ON c.department_id = d.id
                WHERE s.id = ?
            `, [req.params.id]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found"
            });
        }

        res.json({
            success: true,
            data: students[0]
        });

    } catch (error) {
        console.error(
            "Error fetching student:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Error fetching student"
        });
    }
});


module.exports = router;