// services/security.service.ts
import { prisma } from '../lib/prisma.js';
import { queryNVD } from './nvd.service.js';
import { analyzeWithAI } from './ai.service.js';
import { extractDependencies, extractVersionsFromPackageLock } from '../utils/packageLockParser.js';
import { calculateSecurityScore } from '../utils/scoreCalculator.js';
import { Severity } from '@prisma/client';

export async function runSecurityScan(projectId: string, file?: Express.Multer.File) {
    console.log(`🔐 Running security scan for project: ${projectId}`);
    
    let packageJson: any = { dependencies: {} };
    let packageLockJson: any = null;
    let fileName = "auto-detected";

    // إذا في ملف مرفوع
    if (file) {
        fileName = file.originalname;
        const isPackageLock = file.originalname.includes('package-lock');
        
        if (isPackageLock) {
            packageLockJson = JSON.parse(file.buffer.toString("utf-8"));
            const depsFromLock = extractDependencies(packageLockJson);
            packageJson.dependencies = depsFromLock.reduce((acc, dep) => {
                acc[dep.name] = dep.version;
                return acc;
            }, {} as Record<string, string>);
        } else {
            packageJson = JSON.parse(file.buffer.toString("utf-8"));
        }
    }

    const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
    };

    // إنشاء سجل الفحص
    const scan = await prisma.scan.create({
        data: {
            projectId,
            fileName,
            fileType: file ? (file.originalname.includes('lock') ? 'package-lock.json' : 'package.json') : 'auto',
            status: "PROCESSING",
        }
    });

    try {
        // استخراج النسخ الفعلية
        let actualVersions: Record<string, string> = {};
        if (packageLockJson) {
            actualVersions = extractVersionsFromPackageLock(packageLockJson);
        }

        // فحص الثغرات
        const nvdVulnerabilities = [];
        const depsToCheck = Object.entries(dependencies);

        for (const [name, versionRange] of depsToCheck) {
            const actualVersion = actualVersions[name] || (versionRange as string).replace(/[^0-9.]/g, '');
            const vulns = await queryNVD(name, actualVersion);
            if (vulns.length > 0) {
                nvdVulnerabilities.push(...vulns);
            }
        }

        // تحليل بالذكاء الاصطناعي
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

            await prisma.vulnerability.createMany({ data: vulnerabilitiesData });
        }

        // تحديث الفحص
        const securityScore = calculateSecurityScore(nvdVulnerabilities);
        await prisma.scan.update({
            where: { id: scan.id },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                securityScore,
                summary: aiResult.executiveSummary,
                aiInsights: aiResult as any
            }
        });

        return { scanId: scan.id, vulnerabilities: nvdVulnerabilities, score: securityScore };

    } catch (error) {
        await prisma.scan.update({
            where: { id: scan.id },
            data: { status: "FAILED" }
        });
        throw error;
    }
}

function mapCvssToPrismaSeverity(score: number): Severity {
    if (score >= 9.0) return Severity.CRITICAL;
    if (score >= 7.0) return Severity.HIGH;
    if (score >= 4.0) return Severity.MEDIUM;
    return Severity.LOW;
}