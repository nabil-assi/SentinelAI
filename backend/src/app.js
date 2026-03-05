"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var helmet_1 = require("helmet");
var cookie_parser_1 = require("cookie-parser");
var globalErrorHandler_ts_1 = require("./middlewares/globalErrorHandler.ts");
dotenv_1.default.config();
var authRoute_ts_1 = require("./routes/authRoute.ts");
var projectRoute_ts_1 = require("./routes/projectRoute.ts");
var scanRoute_ts_1 = require("./routes/scanRoute.ts");
var app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:8080',
    credentials: true,
    //     methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //   allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(globalErrorHandler_ts_1.errorHandler);
app.use((0, cookie_parser_1.default)());
// Routes
console.log("Database URL is:", process.env.DATABASE_URL);
app.use('/api/auth', authRoute_ts_1.default);
app.use('/api/projects', projectRoute_ts_1.default);
app.use('/api/scan', scanRoute_ts_1.default);
app.get('/health', function (req, res) {
    res.send('Server is healthy and runnig perfectly');
});
var PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 5000, function () {
    console.log("Server is running on port ".concat(process.env.PORT || 5000));
});
exports.default = app;
