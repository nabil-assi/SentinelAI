import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { queryOSV } from "../services/osv.service.ts"; // غيرنا من nvd.service إلى osv.service
import { analyzeWithAI } from "../services/ai.service.js";
import { calculateSecurityScore } from "../utils/scoreCalculator.js";
import { extractDependencies, extractVersionsFromPackageLock } from "../utils/packageLockParser.js";
import { fetchPackageJson, fetchPackageLockJson } from "../services/github.service.js";
import { Severity } from "@prisma/client";
import fs from 'fs';

export const analyzeDependencies = async (req: Request, res: Response): Promise<void> => {
    console.log("=".repeat(60));
    console.log("📥 analyzeDependencies called");

    const { projectId } = req.params;
    let packageJson: any = null;
    let fileName = "uploaded-file";
    let packageLockJson: any = null;
    let isCancelled = false;

    // معالجة Ctrl+C
    process.once('SIGINT', () => {
        console.log('\n⚠️ Scan cancelled by user');
        isCancelled = true;
    });

    try {
        if (!projectId) {
            res.status(400).json({ error: "Critical Failure: Project ID is missing." });
            return;
        }

        const file = req.file;

        // قراءة الملف المرفوع
        if (file) {
            console.log(`📁 Received file: ${file.originalname} (${file.size} bytes)`);
            fileName = file.originalname;

            const isPackageLock = file.originalname.includes('package-lock') ||
                file.originalname === 'package-lock.json';

            if (isPackageLock) {
                try {
                    packageLockJson = JSON.parse(file.buffer.toString("utf-8"));
                    console.log("🔒 Parsed as package-lock.json");

                    const depsFromLock = extractDependencies(packageLockJson);
                    console.log(`📊 Extracted ${depsFromLock.length} dependencies from lock file`);

                    packageJson = {
                        dependencies: depsFromLock.reduce((acc, dep) => {
                            acc[dep.name] = dep.version;
                            return acc;
                        }, {} as Record<string, string>)
                    };
                } catch (e) {
                    console.error("❌ Error parsing package-lock.json:", e);
                    res.status(400).json({ error: "Invalid package-lock.json file" });
                    return;
                }
            } else {
                try {
                    packageJson = JSON.parse(file.buffer.toString("utf-8"));
                    console.log("📦 Parsed as package.json");
                } catch (e) {
                    console.error("❌ Error parsing package.json:", e);
                    res.status(400).json({ error: "Invalid package.json file" });
                    return;
                }
            }
        } else {
            console.log("📁 No file uploaded, fetching from GitHub");

            try {
                packageJson = await fetchPackageJson(String(projectId));
                console.log("📦 Fetched package.json from GitHub");
                fileName = "github-package.json";
            } catch (error) {
                console.log("⚠️ No package.json on GitHub");
            }

            try {
                packageLockJson = await fetchPackageLockJson(String(projectId));
                if (packageLockJson) {
                    console.log("🔒 Fetched package-lock.json from GitHub");

                    if (!packageJson) {
                        const depsFromLock = extractDependencies(packageLockJson);
                        packageJson = {
                            dependencies: depsFromLock.reduce((acc, dep) => {
                                acc[dep.name] = dep.version;
                                return acc;
                            }, {} as Record<string, string>)
                        };
                        fileName = "github-package-lock.json";
                        console.log(`📊 Built dependencies from lock file: ${Object.keys(packageJson.dependencies).length} deps`);
                    }
                }
            } catch (error) {
                console.log("⚠️ No package-lock.json on GitHub");
            }
        }

        // التأكد من وجود dependencies
        if (!packageJson || Object.keys(packageJson.dependencies || {}).length === 0) {
            res.status(400).json({
                error: "No dependencies found",
                message: "Could not extract any dependencies from the provided source"
            });
            return;
        }

        // ✅ فحص production dependencies فقط (الأهم)
        const productionDeps = { ...(packageJson.dependencies || {}) };
        const devDeps = { ...(packageJson.devDependencies || {}) };

        console.log(`📦 Production: ${Object.keys(productionDeps).length} dependencies`);
        console.log(`🛠️  Dev: ${Object.keys(devDeps).length} dependencies`);

        // اختيار المجموعة المراد فحصها
        const depsToScan = productionDeps; // افحص production فقط

        const dependencies = depsToScan;
        console.log(`🔍 Will scan ${Object.keys(dependencies).length} dependencies`);

        // إنشاء سجل الفحص
        const scan = await prisma.scan.create({
            data: {
                projectId: projectId as string,
                fileName,
                fileType: fileName.includes('lock') ? 'package-lock.json' : 'package.json',
                status: "PROCESSING",
            }
        });

        console.log(`🔍 Scan created: ${scan.id}`);

        // استخراج النسخ الفعلية من package-lock.json
        let actualVersions: Record<string, string> = {};
        if (packageLockJson) {
            actualVersions = extractVersionsFromPackageLock(packageLockJson);
            console.log(`🔒 Found ${Object.keys(actualVersions).length} actual versions`);
        }

        // Checkpoint file للاستئناف
        const checkpointFile = `./scan-checkpoint-${scan.id}.json`;
        let processedDeps = new Set<string>();
        let osvVulnerabilities: any[] = []; // غيرنا الاسم من nvdVulnerabilities

        if (fs.existsSync(checkpointFile)) {
            try {
                const checkpoint = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8'));
                processedDeps = new Set(checkpoint.processed);
                osvVulnerabilities = checkpoint.vulnerabilities || [];
                console.log(`🔄 Resuming from checkpoint: ${processedDeps.size} already scanned`);
            } catch (e) {
                console.log("⚠️ Could not load checkpoint, starting fresh");
            }
        }

        // فحص dependencies باستخدام OSV (بدون limits!)
        const depsToCheck = Object.entries(dependencies);
        const totalDeps = depsToCheck.length;
        const startTime = Date.now();

        console.log(`🔍 Scanning ${totalDeps} dependencies with OSV...`);
        console.log(`⏱️  Estimated time: ~${Math.ceil(totalDeps * 0.5 / 60)} minutes`); // OSV أسرع بكثير

        // OSV يسمح بالـ batch requests (أسرع)
        const BATCH_SIZE = 50; // نرسل 50 مكتبة بطلب واحد

        for (let i = 0; i < depsToCheck.length; i += BATCH_SIZE) {
            if (isCancelled) {
                console.log('🛑 Scan cancelled, saving partial results...');
                break;
            }

            const batch = depsToCheck.slice(i, i + BATCH_SIZE);
            const batchPackages = batch.map(([name, versionRange]) => ({
                name,
                version: actualVersions[name] || (versionRange as string).replace(/[^0-9.]/g, '')
            }));

            const scanned = Math.min(i + BATCH_SIZE, totalDeps);
            const percent = Math.round((scanned / totalDeps) * 100);

            const elapsed = (Date.now() - startTime) / 1000;
            const avgTimePerDep = elapsed / scanned;
            const remaining = Math.ceil((totalDeps - scanned) * avgTimePerDep / 60);

            console.log(`\n[${percent}%] ${scanned}/${totalDeps} - Est. remaining: ${remaining} min`);

            try {
                // OSV يدخل batch request (أسرع من NVD بكثير)
                const vulns = await queryOSV(batchPackages, 'npm');
                if (vulns.length > 0) {
                    osvVulnerabilities.push(...vulns);
                    console.log(`  ⚠️  Found ${vulns.length} vulns in batch`);

                    // عرض تفاصيل الثغرات
                    vulns.forEach((v: any) => {
                        console.log(`    - ${v.packageName}@${v.version}: ${v.cveId || 'No CVE'} (${v.severity})`);
                    });
                } else {
                    console.log(`  ✅ Batch clean: ${batch.length} packages`);
                }
            } catch (error) {
                console.error(`  ❌ Error scanning batch:`, error);
            }

            // حفظ checkpoint
            batch.forEach(([name, versionRange]) => {
                processedDeps.add(`${name}@${versionRange}`);
            });

            fs.writeFileSync(checkpointFile, JSON.stringify({
                processed: Array.from(processedDeps),
                vulnerabilities: osvVulnerabilities,
                timestamp: new Date().toISOString()
            }));
        }

        console.log(`\n📋 Total vulnerabilities found: ${osvVulnerabilities.length}`);

        // تحليل بالذكاء الاصطناعي
        const aiResult = await analyzeWithAI(osvVulnerabilities);

        // تخزين النتائج
        if (osvVulnerabilities.length > 0) {
            const vulnerabilitiesData = osvVulnerabilities.map(v => ({
                scanId: scan.id,
                libraryName: v.packageName,
                title: v.title || `${v.cveId || 'Vulnerability'} in ${v.packageName}`,
                description: v.description || v.summary || 'No description available',
                severity: v.severity as Severity || Severity.MEDIUM,
                recommendation: v.recommendation || `Update ${v.packageName} to version ${v.fixedVersion || 'latest'}`,
                cveId: v.cveId || 'OSV-DB'
            }));

            await prisma.vulnerability.createMany({
                data: vulnerabilitiesData
            });

            console.log(`💾 Saved ${vulnerabilitiesData.length} vulnerabilities to database`);
        }

        // تحديث الفحص
        const securityScore = calculateSecurityScore(osvVulnerabilities);
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

        // حذف ملف checkpoint
        if (fs.existsSync(checkpointFile)) {
            fs.unlinkSync(checkpointFile);
        }

        console.log(`✅ Scan completed with score: ${securityScore}`);

        res.status(200).json({
            success: true,
            scanId: scan.id,
            vulnerabilitiesFound: osvVulnerabilities.length,
            score: securityScore
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