import { NVDVulnerability } from "../types/index.ts";  // أضف .ts

const severityWeights = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 5,
    LOW: 1
};

export function calculateSecurityScore(vulnerabilities: NVDVulnerability[]): number {
    if (vulnerabilities.length === 0) return 100;
    
    let totalDeduction = 0;
    
    vulnerabilities.forEach(v => {
        const severity = mapScoreToSeverity(v.cvssScore);
        totalDeduction += severityWeights[severity];
    });
    
    return Math.max(0, Math.min(100, 100 - totalDeduction));
}

export function mapScoreToSeverity(score: number): keyof typeof severityWeights {
    if (score >= 9.0) return "CRITICAL";
    if (score >= 7.0) return "HIGH";
    if (score >= 4.0) return "MEDIUM";
    return "LOW";
}

export function getRiskLevel(score: number): string {
    if (score >= 90) return "A+";
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
}