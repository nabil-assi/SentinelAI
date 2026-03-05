// utils/scoreCalculator.ts
import { Severity } from "@prisma/client";

// واجهة موحدة للثغرات
interface Vulnerability {
    cvssScore?: number;
    severity?: string;
}

const severityWeights = {
    CRITICAL: 15,  // بدل 30
    HIGH: 8,       // بدل 20
    MEDIUM: 3,     // بدل 10
    LOW: 1         // بدل 5
};

export function calculateSecurityScore(vulnerabilities: any[]): number {
    if (!vulnerabilities || vulnerabilities.length === 0) return 100;

    let totalDeduction = 0;

    vulnerabilities.forEach(v => {
        let severity: string;

        if (v.cvssScore) {
            severity = mapScoreToSeverity(v.cvssScore);
        } else if (v.severity) {
            severity = v.severity.toUpperCase();
        } else {
            severity = 'LOW';
        }

        totalDeduction += severityWeights[severity as keyof typeof severityWeights] || 1;
    });

    // حد أقصى للخصم 70% عشان النتيجة ما توصل 0 بسهولة
    const finalScore = Math.max(30, Math.min(100, 100 - totalDeduction));
    return finalScore;
}

export function mapScoreToSeverity(score: number): string {
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