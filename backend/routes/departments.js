const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET all departments
router.get("/", async (req, res) => {
    try {
        const [departments] = await pool.query(
            "SELECT * FROM departments ORDER BY name"
        );

        res.json({
            success: true,
            count: departments.length,
            data: departments
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching departments"
        });
    }
});

// CREATE department
router.post("/", async (req, res) => {
    try {
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Name and code are required"
            });
        }

        // Check duplicate code
        const [existing] = await pool.query(
            "SELECT * FROM departments WHERE code = ?",
            [code]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Department code already exists"
            });
        }

        const [result] = await pool.query(
            "INSERT INTO departments (name, code) VALUES (?, ?)",
            [name, code]
        );

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            departmentId: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error creating department"
        });
    }
});

// GET department by ID
router.get("/:id", async (req, res) => {
    try {
        const [department] = await pool.query(
            "SELECT * FROM departments WHERE id = ?",
            [req.params.id]
        );

        if (department.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.json({
            success: true,
            data: department[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error fetching department"
        });
    }
});

module.exports = router;