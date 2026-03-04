import type { Request } from "express";
import "multer";
export interface RequestWithFile extends Request {
    file?: Express.Multer.File;
    files?: {
        [fieldname: string]: Express.Multer.File[];
    };
}

export type MulterRequest = Request & {
    file?: Express.Multer.File;
    files?: {
        [fieldname: string]: Express.Multer.File[];
    };
};

export interface DependencyInfo {
    name: string;
    version: string;
    dev?: boolean;
}

export interface NVDVulnerability {
    libraryName: string;
    currentVersion: string;
    cveId: string;
    cvssScore: number;
    cvssVector: string;
    summary: string;
    fixedVersion: string | null;
}

export interface AIVulnerabilityAnalysis {
    libraryName: string;
    cveId: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    description: string;
    recommendation: string;
}

// export interface AIAnalysisResult {
//     prioritizedVulnerabilities: AIVulnerabilityAnalysis[];
//     executiveSummary: string;
//     technicalSummary: string;
//     remediationPlan: string;
// }

export interface ScanResult {
    success: boolean;
    scanId: string;
    vulnerabilitiesFound: number;
}