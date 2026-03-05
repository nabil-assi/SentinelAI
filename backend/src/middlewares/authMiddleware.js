"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var protect = function (req, res, next) {
    var authHeader = req.headers.authorization;
    var token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }
    try {
        var decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret_key");
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(403).json({ message: "Invalid Token", error: error.message });
    }
};
exports.protect = protect;
