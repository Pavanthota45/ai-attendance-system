const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const router = express.Router();

// GET all teachers
router.get("/", async (req, res) => {
    try {
        const [teachers] = await pool.query(`
            SELECT
                t.id,
                u.name,
                u.email,
                u.created_at
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            ORDER BY u.name
        `);

        res.json({
            success: true,
            count: teachers.length,
            data: teachers
        });

    } catch (error) {
        console.error("Error fetching teachers:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching teachers"
        });
    }
});


// CREATE teacher
router.post("/", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            name,
            email,
            password
        } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check whether email already exists
        const [existingUser] = await connection.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        await connection.beginTransaction();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user account
        const [userResult] = await connection.query(
            `INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, 'TEACHER')`,
            [
                name,
                email,
                hashedPassword
            ]
        );

        // Create teacher record
        const [teacherResult] = await connection.query(
            `INSERT INTO teachers
            (user_id)
            VALUES (?)`,
            [userResult.insertId]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            teacherId: teacherResult.insertId,
            userId: userResult.insertId
        });

    } catch (error) {
        await connection.rollback();

        console.error("Error creating teacher:", error);

        res.status(500).json({
            success: false,
            message: "Error creating teacher"
        });

    } finally {
        connection.release();
    }
});


// GET teacher by ID
router.get("/:id", async (req, res) => {
    try {
        const [teachers] = await pool.query(`
            SELECT
                t.id,
                u.name,
                u.email,
                u.created_at
            FROM teachers t
            JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        `, [req.params.id]);

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        res.json({
            success: true,
            data: teachers[0]
        });

    } catch (error) {
        console.error("Error fetching teacher:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching teacher"
        });
    }
});


module.exports = router;