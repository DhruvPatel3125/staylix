const jwt = require("jsonwebtoken");
const User = require("../models/user")

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-passwordHash");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Token failed or expired"
        });
    }
}
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Admin access only"
        });
    }
}

exports.owner = (req, res, next) => {
    if (req.user && req.user.role === "owner") {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: "Owner access only"
        });
    }
}