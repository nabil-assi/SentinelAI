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
exports.analyzeWithAI = analyzeWithAI;
var groq_sdk_1 = require("groq-sdk");
var groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
function analyzeWithAI(vulnerabilities) {
    return __awaiter(this, void 0, void 0, function () {
        var completion, content, parsed, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    if (vulnerabilities.length === 0) {
                        return [2 /*return*/, {
                                prioritizedVulnerabilities: [],
                                executiveSummary: "No vulnerabilities detected in your dependencies.",
                                technicalSummary: "All dependencies are up to date with no known CVEs.",
                                remediationPlan: "Continue regular updates and monitoring."
                            }];
                    }
                    console.log("\uD83E\uDD16 Analyzing ".concat(vulnerabilities.length, " vulnerabilities with AI..."));
                    return [4 /*yield*/, groq.chat.completions.create({
                            model: "llama-3.3-70b-versatile",
                            temperature: 0.2,
                            response_format: { type: "json_object" },
                            messages: [
                                {
                                    role: "system",
                                    content: "You are a Senior Cyber Security Researcher. \n                    You will be given REAL vulnerabilities from NVD database.\n                    \n                    You MUST return a VALID JSON object with the following structure.\n                    \n                    RULES:\n                    1. Prioritize CRITICAL and HIGH severity first\n                    2. Write clear recommendations for developers\n                    3. Explain business impact in simple terms\n                    4. DO NOT add new CVEs, only analyze the ones provided\n                    5. Be specific about fixed versions when available\n                    \n                    The JSON structure must be exactly:\n                    {\n                        \"prioritizedVulnerabilities\": [\n                            {\n                                \"libraryName\": \"string\",\n                                \"cveId\": \"string\",\n                                \"severity\": \"CRITICAL | HIGH | MEDIUM | LOW\",\n                                \"title\": \"string\",\n                                \"description\": \"string\",\n                                \"recommendation\": \"string\"\n                            }\n                        ],\n                        \"executiveSummary\": \"string\",\n                        \"technicalSummary\": \"string\",\n                        \"remediationPlan\": \"string\"\n                    }"
                                },
                                {
                                    role: "user",
                                    content: "Here is the JSON data containing vulnerabilities found in our Node.js API dependencies. Please analyze them and return a JSON response:\n\n".concat(JSON.stringify(vulnerabilities, null, 2), "\n\nRemember: Your response must be valid JSON format.")
                                }
                            ]
                        })];
                case 1:
                    completion = _c.sent();
                    content = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                    if (!content)
                        throw new Error("AI returned empty response");
                    // محاولة parse الـ JSON
                    try {
                        parsed = JSON.parse(content);
                        return [2 /*return*/, parsed];
                    }
                    catch (parseError) {
                        console.error("Failed to parse AI response as JSON:", content.substring(0, 200));
                        throw new Error("AI returned invalid JSON");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _c.sent();
                    console.error("🤖 AI analysis error:", error_1);
                    // Return fallback analysis
                    console.log("⚠️ Using fallback analysis due to AI error");
                    return [2 /*return*/, {
                            prioritizedVulnerabilities: vulnerabilities.map(function (v) { return ({
                                libraryName: v.libraryName,
                                cveId: v.cveId,
                                severity: mapCvssToSeverity(v.cvssScore),
                                title: "".concat(v.cveId, " in ").concat(v.libraryName),
                                description: v.summary.substring(0, 200),
                                recommendation: v.fixedVersion
                                    ? "Update to version ".concat(v.fixedVersion, " or later")
                                    : "Check for updates for ".concat(v.libraryName)
                            }); }),
                            executiveSummary: "Found ".concat(vulnerabilities.length, " vulnerabilities in dependencies."),
                            technicalSummary: "Vulnerabilities found: ".concat(vulnerabilities.length),
                            remediationPlan: "Update affected packages to latest versions."
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function mapCvssToSeverity(score) {
    if (score >= 9.0)
        return "CRITICAL";
    if (score >= 7.0)
        return "HIGH";
    if (score >= 4.0)
        return "MEDIUM";
    return "LOW";
}
