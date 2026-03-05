"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSecurityScore = calculateSecurityScore;
exports.mapScoreToSeverity = mapScoreToSeverity;
exports.getRiskLevel = getRiskLevel;
var severityWeights = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 5,
    LOW: 1
};
function calculateSecurityScore(vulnerabilities) {
    if (vulnerabilities.length === 0)
        return 100;
    var totalDeduction = 0;
    vulnerabilities.forEach(function (v) {
        var severity = mapScoreToSeverity(v.cvssScore);
        totalDeduction += severityWeights[severity];
    });
    return Math.max(0, Math.min(100, 100 - totalDeduction));
}
function mapScoreToSeverity(score) {
    if (score >= 9.0)
        return "CRITICAL";
    if (score >= 7.0)
        return "HIGH";
    if (score >= 4.0)
        return "MEDIUM";
    return "LOW";
}
function getRiskLevel(score) {
    if (score >= 90)
        return "A+";
    if (score >= 80)
        return "A";
    if (score >= 70)
        return "B";
    if (score >= 60)
        return "C";
    if (score >= 50)
        return "D";
    return "F";
}
