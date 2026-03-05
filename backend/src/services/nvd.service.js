"use strict";
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
exports.queryNVD = queryNVD;
exports.clearCache = clearCache;
var axios_1 = require("axios");
var NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0";
var CACHE = new Map();
var CACHE_TTL = 1000 * 60 * 60; // ساعة واحدة
// تأخير بين الطلبات (500ms)
var DELAY_BETWEEN_REQUESTS = 500;
function queryNVD(packageName_1, version_1) {
    return __awaiter(this, arguments, void 0, function (packageName, version, retryCount) {
        var cacheKey, cached, res, vulnerabilities, results, err_1, waitTime_1;
        var _a;
        if (retryCount === void 0) { retryCount = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cacheKey = "".concat(packageName, "@").concat(version);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 9]);
                    cached = CACHE.get(cacheKey);
                    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                        console.log("\u2705 Cache hit for ".concat(packageName, "@").concat(version));
                        return [2 /*return*/, cached.data];
                    }
                    console.log("\uD83D\uDD0D Querying NVD for ".concat(packageName, "@").concat(version, " (attempt ").concat(retryCount + 1, ")"));
                    return [4 /*yield*/, axios_1.default.get(NVD_API, {
                            params: {
                                keywordSearch: "".concat(packageName, " ").concat(version),
                                resultsPerPage: 50
                            },
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'SentinelAI-Security-Scanner/1.0'
                            }
                        })];
                case 2:
                    res = _b.sent();
                    vulnerabilities = res.data.vulnerabilities || [];
                    results = vulnerabilities
                        .map(function (v) {
                        var _a, _b, _c, _d, _e, _f, _g;
                        var cve = v.cve;
                        var metrics = ((_b = (_a = cve.metrics) === null || _a === void 0 ? void 0 : _a.cvssMetricV31) === null || _b === void 0 ? void 0 : _b[0]) ||
                            ((_d = (_c = cve.metrics) === null || _c === void 0 ? void 0 : _c.cvssMetricV30) === null || _d === void 0 ? void 0 : _d[0]) ||
                            ((_f = (_e = cve.metrics) === null || _e === void 0 ? void 0 : _e.cvssMetricV2) === null || _f === void 0 ? void 0 : _f[0]);
                        if (!metrics)
                            return null;
                        var fixedVersion = null;
                        var descriptions = cve.descriptions || [];
                        var description = ((_g = descriptions[0]) === null || _g === void 0 ? void 0 : _g.value) || "";
                        var fixedMatch = description.match(/fixed in (?:version )?(\d+\.\d+\.\d+)/i) ||
                            description.match(/patched in (?:version )?(\d+\.\d+\.\d+)/i) ||
                            description.match(/upgrade to (\d+\.\d+\.\d+)/i);
                        if (fixedMatch) {
                            fixedVersion = fixedMatch[1];
                        }
                        return {
                            libraryName: packageName,
                            currentVersion: version,
                            cveId: cve.id,
                            cvssScore: metrics.cvssData.baseScore,
                            cvssVector: metrics.cvssData.vectorString,
                            summary: description.substring(0, 500),
                            fixedVersion: fixedVersion
                        };
                    })
                        .filter(Boolean);
                    // تخزين في الكاش
                    CACHE.set(cacheKey, { data: results, timestamp: Date.now() });
                    return [2 /*return*/, results];
                case 3:
                    err_1 = _b.sent();
                    if (!axios_1.default.isAxiosError(err_1)) return [3 /*break*/, 7];
                    if (!(((_a = err_1.response) === null || _a === void 0 ? void 0 : _a.status) === 429)) return [3 /*break*/, 6];
                    console.log("\u26A0\uFE0F Rate limited for ".concat(packageName, "@").concat(version));
                    if (!(retryCount < 3)) return [3 /*break*/, 5];
                    waitTime_1 = Math.pow(2, retryCount) * 2000;
                    console.log("\u23F3 Waiting ".concat(waitTime_1 / 1000, " seconds before retry ").concat(retryCount + 1, "/3..."));
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_1); })];
                case 4:
                    _b.sent();
                    return [2 /*return*/, queryNVD(packageName, version, retryCount + 1)];
                case 5:
                    console.log("\u274C Skipping ".concat(packageName, "@").concat(version, " after 3 retries"));
                    return [2 /*return*/, []];
                case 6:
                    // أخطاء أخرى
                    console.error("NVD error for ".concat(packageName, ":"), err_1.message);
                    return [3 /*break*/, 8];
                case 7:
                    console.error("Unknown error for ".concat(packageName, ":"), err_1);
                    _b.label = 8;
                case 8: return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// دالة لمسح الكاش
function clearCache() {
    CACHE.clear();
    console.log("🧹 NVD cache cleared");
}
