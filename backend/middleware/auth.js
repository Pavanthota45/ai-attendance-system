const jwt = require("jsonwebtoken");

// Verify JWT token
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (error, user) => {
                if (error) {
                    return res.status(403).json({
                        success: false,
                        message: "Invalid or expired token"
                    });
                }

                req.user = user;
                next();
            }
        );

    } catch (error) {
        console.error("Authentication error:", error);

        res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
};


// Allow only ADMIN users
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};


// Allow only TEACHER users
const teacherOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Teacher access required"
        });
    }

    next();
};


// Allow only STUDENT users
const studentOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "STUDENT") {
        return res.status(403).json({
            success: false,
            message: "Student access required"
        });
    }

    next();
};


module.exports = {
    authenticateToken,
    adminOnly,
    teacherOnly,
    studentOnly
};