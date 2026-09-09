const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET all classes
router.get("/", async (req, res) => {
    try {
        const [classes] = await pool.query(`
            SELECT 
                c.id,
                c.department_id,
                d.name AS department_name,
                d.code AS department_code,
                c.year,
                c.section,
                c.academic_year
            FROM classes c
            JOIN departments d ON c.department_id = d.id
            ORDER BY d.name, c.year, c.section
        `);

        res.json({
            success: true,
            count: classes.length,
            data: classes
        });

    } catch (error) {
        console.error("Error fetching classes:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching classes"
        });
    }
});

// CREATE a class
router.post("/", async (req, res) => {
    try {
        const {
            department_id,
            year,
            section,
            academic_year
        } = req.body;

        // Validate required fields
        if (
            !department_id ||
            !year ||
            !section ||
            !academic_year
        ) {
            return res.status(400).json({
                success: false,
                message: "Department, year, section and academic year are required"
            });
        }

        // Check department exists
        const [department] = await pool.query(
            "SELECT id FROM departments WHERE id = ?",
            [department_id]
        );

        if (department.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        // Check duplicate class
        const [existing] = await pool.query(
            `SELECT id FROM classes
             WHERE department_id = ?
             AND year = ?
             AND section = ?
             AND academic_year = ?`,
            [
                department_id,
                year,
                section,
                academic_year
            ]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This class already exists"
            });
        }

        // Insert class
        const [result] = await pool.query(
            `INSERT INTO classes
            (department_id, year, section, academic_year)
            VALUES (?, ?, ?, ?)`,
            [
                department_id,
                year,
                section,
                academic_year
            ]
        );

        res.status(201).json({
            success: true,
            message: "Class created successfully",
            classId: result.insertId
        });

    } catch (error) {
        console.error("Error creating class:", error);

        res.status(500).json({
            success: false,
            message: "Error creating class"
        });
    }
});

// GET class by ID
router.get("/:id", async (req, res) => {
    try {
        const [classes] = await pool.query(
            `SELECT 
                c.id,
                c.department_id,
                d.name AS department_name,
                d.code AS department_code,
                c.year,
                c.section,
                c.academic_year
             FROM classes c
             JOIN departments d ON c.department_id = d.id
             WHERE c.id = ?`,
            [req.params.id]
        );

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        res.json({
            success: true,
            data: classes[0]
        });

    } catch (error) {
        console.error("Error fetching class:", error);

        res.status(500).json({
            success: false,
            message: "Error fetching class"
        });
    }
});

module.exports = router;