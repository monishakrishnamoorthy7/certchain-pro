/**
 * JWT Authentication Utility
 * Handles token generation, verification, and user authentication
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

/**
 * Generate JWT token for user
 * @param {string} userId - User ID or email
 * @param {Object} userData - User data to encode in token
 * @returns {string} JWT token
 */
function generateToken(userId, userData = {}) {
    const payload = {
        userId,
        ...userData,
        iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
}

/**
 * Hash password using crypto (simple implementation)
 * In production, use bcrypt or argon2
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
function hashPassword(password) {
    // Simple PBKDF2 implementation
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");
    return `${salt}:${hash}`;
}

/**
 * Compare plain text password with hashed password
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} hashedPassword - Stored hashed password
 * @returns {boolean} Whether passwords match
 */
function comparePassword(plainPassword, hashedPassword) {
    try {
        const [salt, hash] = hashedPassword.split(":");
        const verifyHash = crypto
            .pbkdf2Sync(plainPassword, salt, 100000, 64, "sha512")
            .toString("hex");
        return hash === verifyHash;
    } catch (error) {
        return false;
    }
}

/**
 * Express middleware for authenticating JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token required",
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message,
        });
    }
}

/**
 * Middleware to check if user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required",
        });
    }
    next();
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authenticateToken,
    requireAdmin,
};
