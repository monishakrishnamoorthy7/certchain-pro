/**
 * Error Handler Utility
 * Centralized error handling for the application
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Handles errors and returns appropriate API response
 * @param {Error} error - Error object
 * @returns {Object} Error response object
 */
function handleError(error) {
    let response = {
        success: false,
        message: "An error occurred",
        timestamp: new Date().toISOString(),
    };

    if (error instanceof ApiError) {
        response.statusCode = error.statusCode;
        response.message = error.message;
        if (error.details) {
            response.details = error.details;
        }
    } else if (error.code === "ENOENT") {
        response.statusCode = 404;
        response.message = "File not found";
    } else if (error.code === "EACCES") {
        response.statusCode = 403;
        response.message = "Permission denied";
    } else if (error.message.includes("Contract")) {
        response.statusCode = 500;
        response.message = "Blockchain contract error";
        response.details = error.message;
    } else if (error.message.includes("Connection")) {
        response.statusCode = 503;
        response.message = "Blockchain connection error";
        response.details = error.message;
    } else {
        response.statusCode = 500;
        response.message = error.message || "Internal server error";
    }

    return response;
}

/**
 * Express middleware for error handling
 */
function errorHandler(err, req, res, next) {
    const errorResponse = handleError(err);
    const statusCode = errorResponse.statusCode || 500;

    console.error(`[ERROR] ${new Date().toISOString()}`, {
        path: req.path,
        method: req.method,
        message: err.message,
        stack: err.stack,
    });

    res.status(statusCode).json(errorResponse);
}

module.exports = {
    ApiError,
    handleError,
    errorHandler,
};
