"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestProjectScan = exports.getProjectScans = exports.getScanResultsById = exports.analyzeDependencies = void 0;
var axios_1 = require("axios");
var prisma_ts_1 = require("../lib/prisma.ts");
var asyncHandler_ts_1 = require("../utils/asyncHandler.ts");
var groq_sdk_1 = require("groq-sdk");
require("multer");
// إعداد Groq باستخدام المفتاح من البيئة
var groq = new groq_sdk_1.Groq({ apiKey: process.env.GROQ_API_KEY });
exports.analyzeDependencies = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, packageJson, fileName, project, rawUrl, githubResponse, dependencies, scan, chatCompletion, aiContent, aiResult, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                projectId = req.params.projectId;
                fileName = "package.json";
                if (!projectId) {
                    res.status(400);
                    throw new Error("Critical Failure: Project ID is missing.");
                }
                if (!req.file) return [3 /*break*/, 1];
                packageJson = JSON.parse(req.file.buffer.toString("utf-8"));
                fileName = req.file.originalname;
                return [3 /*break*/, 4];
            case 1: return [4 /*yield*/, prisma_ts_1.prisma.project.findUnique({ where: { id: String(projectId) } })];
            case 2:
                project = _c.sent();
                if (!project || !project.repoUrl)
                    throw new Error("Target Repository not found.");
                rawUrl = project.repoUrl.replace("github.com", "raw.githubusercontent.com").replace(/\/$/, "") + "/main/package.json";
                return [4 /*yield*/, axios_1.default.get(rawUrl)];
            case 3:
                githubResponse = _c.sent();
                packageJson = githubResponse.data;
                _c.label = 4;
            case 4:
                dependencies = __assign(__assign({}, (packageJson.dependencies || {})), (packageJson.devDependencies || {}));
                return [4 /*yield*/, prisma_ts_1.prisma.scan.create({
                        data: {
                            projectId: projectId,
                            fileName: fileName,
                            fileType: "package.json",
                            status: "PROCESSING",
                        }
                    })];
            case 5:
                scan = _c.sent();
                _c.label = 6;
            case 6:
                _c.trys.push([6, 9, , 11]);
                return [4 /*yield*/, groq.chat.completions.create({
                        messages: [
                            {
                                role: "system",
                                content: "You are a Senior Cyber Security Researcher specializing in Node.js ecosystem (NPM). \n                    Your task is to perform a deep-dive security audit on a list of dependencies.\n                    \n                    RULES:\n                    1. Use CVSS 3.1 standards to determine severity.\n                    2. Provide the EXACT current version from the input and the MINIMUM fixed version.\n                    3. If a vulnerability is found, explain the exploit mechanism (e.g., RCE, XSS, Prototype Pollution).\n                    4. If no real CVE is found for a library, DO NOT hallucinate.\n                    \n                    JSON STRUCTURE:\n                    {\n                      \"vulnerabilities\": [\n                        {\n                          \"libraryName\": \"string\",\n                          \"currentVersion\": \"string\",\n                          \"fixedVersion\": \"string\",\n                          \"title\": \"string\",\n                          \"severity\": \"CRITICAL | HIGH | MEDIUM | LOW\",\n                          \"description\": \"Deep technical explanation of the vulnerability\",\n                          \"recommendation\": \"The specific npm/yarn command to fix it\",\n                          \"cveId\": \"CVE-YYYY-NNNNN\",\n                          \"exploitabilityScore\": 0.0\n                        }\n                      ],\n                      \"summary\": \"Short executive summary of the overall risk\"\n                    }"
                            },
                            {
                                role: "user",
                                content: "Audit these dependencies for production-level risks. If you see a version like \"^2.0.0\", assume the highest risk in that range: ".concat(JSON.stringify(dependencies, null, 2))
                            }
                        ],
                        model: "llama-3.3-70b-versatile", // الموديل الأقوى حالياً في Groq
                        response_format: { type: "json_object" },
                        temperature: 0.2 // تقليل الـ Temperature لضمان الدقة وعدم "التأليف"
                    })];
            case 7:
                chatCompletion = _c.sent();
                aiContent = (_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                if (!aiContent)
                    throw new Error("Internal AI Engine Error: Empty Response");
                aiResult = JSON.parse(aiContent);
                // 4. التخزين الذكي (Transaction)
                return [4 /*yield*/, prisma_ts_1.prisma.$transaction([
                        prisma_ts_1.prisma.vulnerability.createMany({
                            data: aiResult.vulnerabilities.map(function (v) { return ({
                                scanId: scan.id,
                                libraryName: v.libraryName,
                                title: "".concat(v.title, " (").concat(v.currentVersion, " -> ").concat(v.fixedVersion, ")"), // دمج النسخ في العنوان ليكون واضحاً
                                description: v.description,
                                severity: v.severity.toUpperCase(),
                                recommendation: v.recommendation,
                                cveId: v.cveId || "N/A"
                            }); })
                        }),
                        prisma_ts_1.prisma.scan.update({
                            where: { id: scan.id },
                            data: {
                                status: "COMPLETED",
                                completedAt: new Date(),
                                aiInsights: aiResult.summary // تخزين الملخص التنفيذي هنا
                            }
                        })
                    ])];
            case 8:
                // 4. التخزين الذكي (Transaction)
                _c.sent();
                res.status(200).json({ success: true, scanId: scan.id });
                return [3 /*break*/, 11];
            case 9:
                error_1 = _c.sent();
                console.error("ANALYSIS CRITICAL ERROR:", error_1);
                return [4 /*yield*/, prisma_ts_1.prisma.scan.update({
                        where: { id: scan.id },
                        data: { status: "FAILED" }
                    })];
            case 10:
                _c.sent();
                res.status(500).json({ error: "Security Analysis Pipeline Failed" });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
exports.getScanResultsById = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var scanId, scan;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scanId = req.params.scanId;
                return [4 /*yield*/, prisma_ts_1.prisma.scan.findUnique({
                        where: {
                            id: String(scanId)
                        },
                        include: {
                            vulnerabilities: true
                        }
                    })];
            case 1:
                scan = _a.sent();
                if (!scan) {
                    res.status(404);
                    throw new Error("Scan not found");
                }
                res.status(200).json({
                    success: true,
                    data: scan
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getProjectScans = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, scans;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                projectId = req.params.projectId;
                if (!projectId) {
                    res.status(400);
                    throw new Error("Project ID is required");
                }
                return [4 /*yield*/, prisma_ts_1.prisma.scan.findMany({
                        where: { projectId: String(projectId) },
                        orderBy: { createdAt: 'desc' }, // الأحدث يظهر أولاً
                        select: {
                            id: true,
                            fileName: true,
                            status: true,
                            createdAt: true,
                            // نأخذ عدد الثغرات فقط للسرعة في عرض الجدول
                            _count: {
                                select: { vulnerabilities: true }
                            }
                        }
                    })];
            case 1:
                scans = _a.sent();
                res.status(200).json({ success: true, scans: scans });
                return [2 /*return*/];
        }
    });
}); });
exports.getLatestProjectScan = (0, asyncHandler_ts_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, latestScan;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                projectId = req.params.projectId;
                return [4 /*yield*/, prisma_ts_1.prisma.scan.findFirst({
                        where: { projectId: String(projectId) },
                        orderBy: { createdAt: 'desc' },
                        include: { vulnerabilities: true }
                    })];
            case 1:
                latestScan = _a.sent();
                if (!latestScan) {
                    return [2 /*return*/, res.status(404).json({ success: false, message: "No scans found for this project" })];
                }
                res.status(200).json({ success: true, scan: latestScan });
                return [2 /*return*/];
        }
    });
}); });
