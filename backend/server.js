const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const authRoutes = require("./routes/auth");
const departmentRoutes = require("./routes/departments");
const classRoutes = require("./routes/classes");
const studentRoutes = require("./routes/students");
const teacherRoutes = require("./routes/teachers");
const subjectRoutes = require("./routes/subjects");
const teacherSubjectRoutes = require("./routes/teacherSubjects");
const attendanceSessionRoutes = require("./routes/attendanceSessions");
const teacherAttendanceHistoryRoutes = require("./routes/teacherAttendanceHistory");
const attendanceRoutes = require("./routes/attendance");
const studentAttendanceRoutes = require("./routes/studentAttendance");
const faceRecognitionRoutes = require("./routes/faceRecognition");

const {
    authenticateToken,
    adminOnly,
    teacherOnly,
    studentOnly
} = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());


// ========================================
// AUTH
// ========================================

app.use("/api/auth", authRoutes);


// ========================================
// DEPARTMENTS
// ADMIN ONLY
// ========================================

app.use(
    "/api/departments",
    authenticateToken,
    adminOnly,
    departmentRoutes
);


// ========================================
// CLASSES
// ADMIN ONLY
// ========================================

app.use(
    "/api/classes",
    authenticateToken,
    adminOnly,
    classRoutes
);


// ========================================
// CURRENT STUDENT
// STUDENT ONLY
// ========================================

app.get(
    "/api/students/me",
    authenticateToken,
    studentOnly,
    async (req, res) => {
        try {
            const userId = req.user.id;

            const [students] = await pool.query(
                `
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
                `,
                [userId]
            );

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
    }
);


// ========================================
// STUDENTS
// ADMIN ONLY
// ========================================

app.use(
    "/api/students",
    authenticateToken,
    adminOnly,
    studentRoutes
);


// ========================================
// TEACHERS
// ADMIN ONLY
// ========================================

app.use(
    "/api/teachers",
    authenticateToken,
    adminOnly,
    teacherRoutes
);


// ========================================
// SUBJECTS
// ADMIN ONLY
// ========================================

app.use(
    "/api/subjects",
    authenticateToken,
    adminOnly,
    subjectRoutes
);


// ========================================
// TEACHER SUBJECT ASSIGNMENTS
// ADMIN + TEACHER
// ========================================

app.use(
    "/api/teacher-subjects",
    authenticateToken,
    teacherSubjectRoutes
);


// ========================================
// ATTENDANCE SESSIONS
// ADMIN + TEACHER
// ========================================

app.use(
    "/api/attendance-sessions",
    authenticateToken,
    attendanceSessionRoutes
);


// ========================================
// TEACHER ATTENDANCE HISTORY
// TEACHER ONLY
// ========================================

app.use(
    "/api/teacher-attendance-history",
    authenticateToken,
    teacherAttendanceHistoryRoutes
);


// ========================================
// ATTENDANCE
// ADMIN + TEACHER
// ========================================

app.use(
    "/api/attendance",
    authenticateToken,
    attendanceRoutes
);


// ========================================
// STUDENT ATTENDANCE
// STUDENT ONLY
// ========================================

app.use(
    "/api/student-attendance",
    authenticateToken,
    studentAttendanceRoutes
);


// ========================================
// FACE RECOGNITION
// AUTHENTICATED USERS
// ========================================

app.use(
    "/api/face-recognition",
    authenticateToken,
    faceRecognitionRoutes
);


// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Attendance System Backend is running!"
    });
});


// ========================================
// DATABASE TEST
// ========================================

app.get("/api/test-db", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            message: "MySQL connection successful!",
            data: rows
        });

    } catch (error) {
        console.error(
            "Database error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "MySQL connection failed"
        });
    }
});


// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});