const express = require("express");
const pool = require("../config/db");

const router = express.Router();


// =========================
// GET ALL SUBJECTS
// =========================

router.get("/", async (req, res) => {
    try {
        const [subjects] = await pool.query(`
            SELECT
                id,
                name,
                code
            FROM subjects
            ORDER BY name
        `);

        res.json({
            success: true,
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        console.error(
            "Error fetching subjects:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching subjects"
        });
    }
});


// =========================
// CREATE SUBJECT
// =========================

router.post("/", async (req, res) => {
    try {
        const {
            name,
            code
        } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({
                success: false,
                message: "Subject name and code are required"
            });
        }

        // Check duplicate subject code
        const [existingCode] = await pool.query(
            "SELECT id FROM subjects WHERE code = ?",
            [code]
        );

        if (existingCode.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Subject code already exists"
            });
        }

        // Check duplicate subject name
        const [existingName] = await pool.query(
            "SELECT id FROM subjects WHERE name = ?",
            [name]
        );

        if (existingName.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Subject name already exists"
            });
        }

        // Create subject
        const [result] = await pool.query(
            `INSERT INTO subjects
            (name, code)
            VALUES (?, ?)`,
            [
                name,
                code
            ]
        );

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subjectId: result.insertId
        });

    } catch (error) {
        console.error(
            "Error creating subject:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error creating subject"
        });
    }
});


// =========================
// GET SUBJECT BY ID
// =========================

router.get("/:id", async (req, res) => {
    try {
        const [subjects] = await pool.query(
            `SELECT
                id,
                name,
                code
             FROM subjects
             WHERE id = ?`,
            [req.params.id]
        );

        if (subjects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        res.json({
            success: true,
            data: subjects[0]
        });

    } catch (error) {
        console.error(
            "Error fetching subject:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Error fetching subject"
        });
    }
});


module.exports = router;