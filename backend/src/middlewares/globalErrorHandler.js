"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var errorHandler = function (err, req, res, next) {
    console.error("[Error]: ".concat(err.stack));
    var statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: {
            message: err.message || "Internal Server Error",
        },
    });
};
exports.errorHandler = errorHandler;
