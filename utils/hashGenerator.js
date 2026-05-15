/**
 * Hash Generator Utility
 * Provides SHA-256 hashing for certificate files
 */

const fs = require("fs");
const crypto = require("crypto");

/**
 * Generates SHA-256 hash from a file
 * @param {string} filePath - Path to the file
 * @returns {string} Hexadecimal SHA-256 hash
 * @throws {Error} If file cannot be read
 */
function generateFileHash(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");
        return hash;
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

/**
 * Generates SHA-256 hash from buffer data
 * @param {Buffer} buffer - Buffer data
 * @returns {string} Hexadecimal SHA-256 hash
 */
function generateBufferHash(buffer) {
    return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Generates SHA-256 hash from string
 * @param {string} str - String to hash
 * @returns {string} Hexadecimal SHA-256 hash
 */
function generateStringHash(str) {
    return crypto.createHash("sha256").update(str).digest("hex");
}

/**
 * Validates if a string is a valid SHA-256 hash
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid SHA-256 hash format
 */
function isValidHash(hash) {
    return /^[a-f0-9]{64}$/i.test(hash);
}

module.exports = {
    generateFileHash,
    generateBufferHash,
    generateStringHash,
    isValidHash,
};
