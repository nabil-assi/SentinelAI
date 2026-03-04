import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { queryNVD } from "../services/nvd.service.js";
import { analyzeWithAI } from "../services/ai.service.js";
import { calculateSecurityScore } from "../utils/scoreCalculator.js";
import { extractVersionsFromPackageLock } from "../utils/packageLockParser.js";
import { fetchPackageJson, fetchPackageLockJson } from "../services/github.service.js";
import { Severity } from "@prisma/client";

export const analyzeDependencies = async (req: Request, res: Response): Promise<void> => {
    console.log("=".repeat(50));
    console.log("📥 analyzeDependencies called");
    console.log("📌 projectId:", req.params.projectId);
    console.log("📁 req.files type:", typeof req.files);
    console.log("📁 req.files isArray:", Array.isArray(req.files));
    console.log("📁 req.files length:", (req.files as any)?.length);

    const { projectId } = req.params;
    let packageJson: any;
    let fileName = "package.json";

    try {
        if (!projectId) {
            res.status(400).json({ error: "Critical Failure: Project ID is missing." });
            return;
        }

        // مع upload.any()، الملفات تكون array
        const files = req.files as Express.Multer.File[];

        // دوّر على ملف package.json (أي حقل)
        const packageJsonFile = files?.find(f =>
            f.fieldname === 'packageJson' ||
            f.fieldname === 'package.json' ||
            f.fieldname === 'json' ||
            f.fieldname === 'file' ||
            f.originalname === 'package.json'
        );

        // دوّر على ملف package-lock.json (أي حقل)
        const packageLockFile = files?.find(f =>
            f.fieldname === 'packageLock' ||
            f.fieldname === 'package-lock.json' ||
            f.fieldname === 'lock' ||
            f.originalname === 'package-lock.json'
        );

        if (packageJsonFile) {
            packageJson = JSON.parse(packageJsonFile.buffer.toString("utf-8"));
            fileName = packageJsonFile.originalname;
            console.log("📦 Received package.json:", fileName);
        } else {
            try {
                packageJson = await fetchPackageJson(String(projectId));
                console.log("📦 Fetched package.json from GitHub");
            } catch (error) {
                res.status(404).json({ error: "package.json not found" });
                return;
            }
        }

        const dependencies = {
            ...(packageJson.dependencies || {}),
            ...(packageJson.devDependencies || {})
        };

        console.log(`📊 Found ${Object.keys(dependencies).length} dependencies`);

        const scan = await prisma.scan.create({
            data: {
                projectId: projectId as string,
                fileName,
                fileType: "package.json",
                status: "PROCESSING",
            }
        });

        console.log(`🔍 Scan created: ${scan.id}`);

        // محاولة جلب النسخ الفعلية من package-lock.json
        let actualVersions: Record<string, string> = {};

        if (packageLockFile) {
            try {
                const packageLockJson = JSON.parse(packageLockFile.buffer.toString("utf-8"));
                actualVersions = extractVersionsFromPackageLock(packageLockJson);
                console.log(`🔒 Found package-lock.json with ${Object.keys(actualVersions).length} versions`);
            } catch (error) {
                console.log("Error parsing package-lock.json:", error);
            }
        } else {
            try {
                const packageLockJson = await fetchPackageLockJson(String(projectId));
                if (packageLockJson) {
                    actualVersions = extractVersionsFromPackageLock(packageLockJson);
                    console.log(`🔒 Fetched package-lock.json from GitHub with ${Object.keys(actualVersions).length} versions`);
                }
            } catch (error) {
                console.log("No package-lock.json found, using version ranges");
            }
        }

       // استعلام NVD لكل dependency
const nvdVulnerabilities = [];
const depsToCheck = Object.entries(dependencies);

console.log(`🔍 Scanning ${depsToCheck.length} dependencies against NVD...`);

for (const [name, versionRange] of depsToCheck) {
    const actualVersion = actualVersions[name] || (versionRange as string).replace(/[^0-9.]/g, '');
    
    try {
        const vulns = await queryNVD(name, actualVersion);
        if (vulns.length > 0) {
            nvdVulnerabilities.push(...vulns);
            console.log(`  ⚠️  Found ${vulns.length} vulnerabilities in ${name}@${actualVersion}`);
        } else {
            console.log(`  ✅ ${name}@${actualVersion} is clean`);
        }
    } catch (error) {
        console.error(`Error scanning ${name}:`, error);
    }

    // تأخير بين الطلبات - 1 ثانية
    console.log(`  ⏳ Waiting 1 second before next request...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

        // تحليل النتائج بالذكاء الاصطناعي
        const aiResult = await analyzeWithAI(nvdVulnerabilities);

        // تخزين النتائج
        if (nvdVulnerabilities.length > 0) {
            const vulnerabilitiesData = nvdVulnerabilities.map(v => ({
                scanId: scan.id,
                libraryName: v.libraryName,
                title: `${v.cveId}: ${v.summary.substring(0, 100)}`,
                description: v.summary.substring(0, 500),
                severity: mapCvssToPrismaSeverity(v.cvssScore),
                recommendation: v.fixedVersion
                    ? `Update to version ${v.fixedVersion}`
                    : `Check for updates for ${v.libraryName}`,
                cveId: v.cveId
            }));

            await prisma.vulnerability.createMany({
                data: vulnerabilitiesData
            });

            console.log(`💾 Saved ${vulnerabilitiesData.length} vulnerabilities to database`);
        }

        // تحديث الـ scan
        await prisma.scan.update({
            where: { id: scan.id },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                securityScore: calculateSecurityScore(nvdVulnerabilities),
                summary: aiResult.executiveSummary,
                aiInsights: aiResult as any
            }
        });

        console.log(`✅ Scan completed with score: ${calculateSecurityScore(nvdVulnerabilities)}`);

        // إرسال الرد
        res.status(200).json({
            success: true,
            scanId: scan.id,
            vulnerabilitiesFound: nvdVulnerabilities.length,
            score: calculateSecurityScore(nvdVulnerabilities)
        });

    } catch (error) {
        console.error("💥 ANALYSIS CRITICAL ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Security Analysis Pipeline Failed"
        });
    }
};

function mapCvssToPrismaSeverity(score: number): Severity {
    if (score >= 9.0) return Severity.CRITICAL;
    if (score >= 7.0) return Severity.HIGH;
    if (score >= 4.0) return Severity.MEDIUM;
    return Severity.LOW;
}