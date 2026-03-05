"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var scanController_ts_1 = require("../controllers/scanController.ts");
var analyzeDependencies_ts_1 = require("../handlers/analyzeDependencies.ts");
var router = (0, express_1.Router)();
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/analyze/:projectId", upload.any(), function (req, res, next) {
    // تأكد من وجود files قبل استخدام Object.keys
    var files = req.files;
    if (files && files.length > 0) {
        console.log("📁 Files received:", files.map(function (f) { return ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            size: f.size
        }); }));
    }
    else {
        console.log("📁 No files received in request");
    }
    next();
}, analyzeDependencies_ts_1.analyzeDependencies);
router.get("/results/:scanId", scanController_ts_1.getScanResultsById);
router.get("/project/:projectId/latest", scanController_ts_1.getLatestProjectScan);
router.get("/project/:projectId/history", scanController_ts_1.getProjectScans);
exports.default = router;
