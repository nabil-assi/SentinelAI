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
exports.analyzeDependencies = void 0;
var prisma_js_1 = require("../lib/prisma.js");
var nvd_service_js_1 = require("../services/nvd.service.js");
var ai_service_js_1 = require("../services/ai.service.js");
var scoreCalculator_js_1 = require("../utils/scoreCalculator.js");
var packageLockParser_js_1 = require("../utils/packageLockParser.js");
var github_service_js_1 = require("../services/github.service.js");
var client_1 = require("@prisma/client");
var analyzeDependencies = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, packageJson, fileName, files, packageJsonFile, packageLockFile, error_1, dependencies, scan_1, actualVersions, packageLockJson, packageLockJson, error_2, nvdVulnerabilities, depsToCheck, _i, depsToCheck_1, _a, name_1, versionRange, actualVersion, vulns, error_3, aiResult, vulnerabilitiesData, error_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("=".repeat(50));
                console.log("📥 analyzeDependencies called");
                console.log("📌 projectId:", req.params.projectId);
                console.log("📁 req.files type:", typeof req.files);
                console.log("📁 req.files isArray:", Array.isArray(req.files));
                console.log("📁 req.files length:", (_b = req.files) === null || _b === void 0 ? void 0 : _b.length);
                projectId = req.params.projectId;
                fileName = "package.json";
                _c.label = 1;
            case 1:
                _c.trys.push([1, 23, , 24]);
                if (!projectId) {
                    res.status(400).json({ error: "Critical Failure: Project ID is missing." });
                    return [2 /*return*/];
                }
                files = req.files;
                packageJsonFile = files === null || files === void 0 ? void 0 : files.find(function (f) {
                    return f.fieldname === 'packageJson' ||
                        f.fieldname === 'package.json' ||
                        f.fieldname === 'json' ||
                        f.fieldname === 'file' ||
                        f.originalname === 'package.json';
                });
                packageLockFile = files === null || files === void 0 ? void 0 : files.find(function (f) {
                    return f.fieldname === 'packageLock' ||
                        f.fieldname === 'package-lock.json' ||
                        f.fieldname === 'lock' ||
                        f.originalname === 'package-lock.json';
                });
                if (!packageJsonFile) return [3 /*break*/, 2];
                packageJson = JSON.parse(packageJsonFile.buffer.toString("utf-8"));
                fileName = packageJsonFile.originalname;
                console.log("📦 Received package.json:", fileName);
                return [3 /*break*/, 5];
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, github_service_js_1.fetchPackageJson)(String(projectId))];
            case 3:
                packageJson = _c.sent();
                console.log("📦 Fetched package.json from GitHub");
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                res.status(404).json({ error: "package.json not found" });
                return [2 /*return*/];
            case 5:
                dependencies = __assign(__assign({}, (packageJson.dependencies || {})), (packageJson.devDependencies || {}));
                console.log("\uD83D\uDCCA Found ".concat(Object.keys(dependencies).length, " dependencies"));
                return [4 /*yield*/, prisma_js_1.prisma.scan.create({
                        data: {
                            projectId: projectId,
                            fileName: fileName,
                            fileType: "package.json",
                            status: "PROCESSING",
                        }
                    })];
            case 6:
                scan_1 = _c.sent();
                console.log("\uD83D\uDD0D Scan created: ".concat(scan_1.id));
                actualVersions = {};
                if (!packageLockFile) return [3 /*break*/, 7];
                try {
                    packageLockJson = JSON.parse(packageLockFile.buffer.toString("utf-8"));
                    actualVersions = (0, packageLockParser_js_1.extractVersionsFromPackageLock)(packageLockJson);
                    console.log("\uD83D\uDD12 Found package-lock.json with ".concat(Object.keys(actualVersions).length, " versions"));
                }
                catch (error) {
                    console.log("Error parsing package-lock.json:", error);
                }
                return [3 /*break*/, 10];
            case 7:
                _c.trys.push([7, 9, , 10]);
                return [4 /*yield*/, (0, github_service_js_1.fetchPackageLockJson)(String(projectId))];
            case 8:
                packageLockJson = _c.sent();
                if (packageLockJson) {
                    actualVersions = (0, packageLockParser_js_1.extractVersionsFromPackageLock)(packageLockJson);
                    console.log("\uD83D\uDD12 Fetched package-lock.json from GitHub with ".concat(Object.keys(actualVersions).length, " versions"));
                }
                return [3 /*break*/, 10];
            case 9:
                error_2 = _c.sent();
                console.log("No package-lock.json found, using version ranges");
                return [3 /*break*/, 10];
            case 10:
                nvdVulnerabilities = [];
                depsToCheck = Object.entries(dependencies);
                console.log("\uD83D\uDD0D Scanning ".concat(depsToCheck.length, " dependencies against NVD..."));
                _i = 0, depsToCheck_1 = depsToCheck;
                _c.label = 11;
            case 11:
                if (!(_i < depsToCheck_1.length)) return [3 /*break*/, 18];
                _a = depsToCheck_1[_i], name_1 = _a[0], versionRange = _a[1];
                actualVersion = actualVersions[name_1] || versionRange.replace(/[^0-9.]/g, '');
                _c.label = 12;
            case 12:
                _c.trys.push([12, 14, , 15]);
                return [4 /*yield*/, (0, nvd_service_js_1.queryNVD)(name_1, actualVersion)];
            case 13:
                vulns = _c.sent();
                if (vulns.length > 0) {
                    nvdVulnerabilities.push.apply(nvdVulnerabilities, vulns);
                    console.log("  \u26A0\uFE0F  Found ".concat(vulns.length, " vulnerabilities in ").concat(name_1, "@").concat(actualVersion));
                }
                else {
                    console.log("  \u2705 ".concat(name_1, "@").concat(actualVersion, " is clean"));
                }
                return [3 /*break*/, 15];
            case 14:
                error_3 = _c.sent();
                console.error("Error scanning ".concat(name_1, ":"), error_3);
                return [3 /*break*/, 15];
            case 15:
                // تأخير بين الطلبات - 1 ثانية
                console.log("  \u23F3 Waiting 1 second before next request...");
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
            case 16:
                _c.sent();
                _c.label = 17;
            case 17:
                _i++;
                return [3 /*break*/, 11];
            case 18: return [4 /*yield*/, (0, ai_service_js_1.analyzeWithAI)(nvdVulnerabilities)];
            case 19:
                aiResult = _c.sent();
                if (!(nvdVulnerabilities.length > 0)) return [3 /*break*/, 21];
                vulnerabilitiesData = nvdVulnerabilities.map(function (v) { return ({
                    scanId: scan_1.id,
                    libraryName: v.libraryName,
                    title: "".concat(v.cveId, ": ").concat(v.summary.substring(0, 100)),
                    description: v.summary.substring(0, 500),
                    severity: mapCvssToPrismaSeverity(v.cvssScore),
                    recommendation: v.fixedVersion
                        ? "Update to version ".concat(v.fixedVersion)
                        : "Check for updates for ".concat(v.libraryName),
                    cveId: v.cveId
                }); });
                return [4 /*yield*/, prisma_js_1.prisma.vulnerability.createMany({
                        data: vulnerabilitiesData
                    })];
            case 20:
                _c.sent();
                console.log("\uD83D\uDCBE Saved ".concat(vulnerabilitiesData.length, " vulnerabilities to database"));
                _c.label = 21;
            case 21: 
            // تحديث الـ scan
            return [4 /*yield*/, prisma_js_1.prisma.scan.update({
                    where: { id: scan_1.id },
                    data: {
                        status: "COMPLETED",
                        completedAt: new Date(),
                        securityScore: (0, scoreCalculator_js_1.calculateSecurityScore)(nvdVulnerabilities),
                        summary: aiResult.executiveSummary,
                        aiInsights: aiResult
                    }
                })];
            case 22:
                // تحديث الـ scan
                _c.sent();
                console.log("\u2705 Scan completed with score: ".concat((0, scoreCalculator_js_1.calculateSecurityScore)(nvdVulnerabilities)));
                // إرسال الرد
                res.status(200).json({
                    success: true,
                    scanId: scan_1.id,
                    vulnerabilitiesFound: nvdVulnerabilities.length,
                    score: (0, scoreCalculator_js_1.calculateSecurityScore)(nvdVulnerabilities)
                });
                return [3 /*break*/, 24];
            case 23:
                error_4 = _c.sent();
                console.error("💥 ANALYSIS CRITICAL ERROR:", error_4);
                res.status(500).json({
                    success: false,
                    error: "Security Analysis Pipeline Failed"
                });
                return [3 /*break*/, 24];
            case 24: return [2 /*return*/];
        }
    });
}); };
exports.analyzeDependencies = analyzeDependencies;
function mapCvssToPrismaSeverity(score) {
    if (score >= 9.0)
        return client_1.Severity.CRITICAL;
    if (score >= 7.0)
        return client_1.Severity.HIGH;
    if (score >= 4.0)
        return client_1.Severity.MEDIUM;
    return client_1.Severity.LOW;
}
