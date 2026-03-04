import type { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';
import { Groq } from "groq-sdk";
import { ScanStatus } from '@prisma/client';
import "multer"
// إعداد Groq باستخدام المفتاح من البيئة
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

export const analyzeDependencies = asyncHandler(async (req: RequestWithFile, res: Response) => {
    const { projectId } = req.params;
    let packageJson: any;
    let fileName = "package.json";

    if (!projectId) {
        res.status(400);
        throw new Error("Critical Failure: Project ID is missing.");
    }

    if (req.file) {
        packageJson = JSON.parse(req.file.buffer.toString("utf-8"));
        fileName = req.file.originalname;
    } else {
        const project = await prisma.project.findUnique({ where: { id: String(projectId) } });
        if (!project || !project.repoUrl) throw new Error("Target Repository not found.");

        const rawUrl = project.repoUrl.replace("github.com", "raw.githubusercontent.com").replace(/\/$/, "") + "/main/package.json";
        const githubResponse = await axios.get(rawUrl);
        packageJson = githubResponse.data;
    }

    const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

    // 2. إنشاء سجل Scan (حالة البداية)
    const scan = await prisma.scan.create({
        data: {
            projectId: projectId as string,
            fileName,
            fileType: "package.json",
            status: "PROCESSING",
        }
    });

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a Senior Cyber Security Researcher specializing in Node.js ecosystem (NPM). 
                    Your task is to perform a deep-dive security audit on a list of dependencies.
                    
                    RULES:
                    1. Use CVSS 3.1 standards to determine severity.
                    2. Provide the EXACT current version from the input and the MINIMUM fixed version.
                    3. If a vulnerability is found, explain the exploit mechanism (e.g., RCE, XSS, Prototype Pollution).
                    4. If no real CVE is found for a library, DO NOT hallucinate.
                    
                    JSON STRUCTURE:
                    {
                      "vulnerabilities": [
                        {
                          "libraryName": "string",
                          "currentVersion": "string",
                          "fixedVersion": "string",
                          "title": "string",
                          "severity": "CRITICAL | HIGH | MEDIUM | LOW",
                          "description": "Deep technical explanation of the vulnerability",
                          "recommendation": "The specific npm/yarn command to fix it",
                          "cveId": "CVE-YYYY-NNNNN",
                          "exploitabilityScore": 0.0
                        }
                      ],
                      "summary": "Short executive summary of the overall risk"
                    }`
                },
                {
                    role: "user",
                    content: `Audit these dependencies for production-level risks. If you see a version like "^2.0.0", assume the highest risk in that range: ${JSON.stringify(dependencies, null, 2)}`
                }
            ],
            model: "llama-3.3-70b-versatile", // الموديل الأقوى حالياً في Groq
            response_format: { type: "json_object" },
            temperature: 0.2 // تقليل الـ Temperature لضمان الدقة وعدم "التأليف"
        });

        const aiContent = chatCompletion.choices[0]?.message?.content;
        if (!aiContent) throw new Error("Internal AI Engine Error: Empty Response");

        const aiResult = JSON.parse(aiContent);

        // 4. التخزين الذكي (Transaction)
        await prisma.$transaction([
            prisma.vulnerability.createMany({
                data: aiResult.vulnerabilities.map((v: any) => ({
                    scanId: scan.id,
                    libraryName: v.libraryName,
                    title: `${v.title} (${v.currentVersion} -> ${v.fixedVersion})`, // دمج النسخ في العنوان ليكون واضحاً
                    description: v.description,
                    severity: v.severity.toUpperCase(),
                    recommendation: v.recommendation,
                    cveId: v.cveId || "N/A"
                }))
            }),
            prisma.scan.update({
                where: { id: scan.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    aiInsights: aiResult.summary // تخزين الملخص التنفيذي هنا
                }
            })
        ]);

        res.status(200).json({ success: true, scanId: scan.id });

    } catch (error) {
        console.error("ANALYSIS CRITICAL ERROR:", error);
        await prisma.scan.update({
            where: { id: scan.id },
            data: { status: "FAILED" }
        });
        res.status(500).json({ error: "Security Analysis Pipeline Failed" });
    }
});
export const getScanResultsById = asyncHandler(async (req: Request, res: Response) => {
    const { scanId } = req.params;
    const scan = await prisma.scan.findUnique({
        where: {
            id: String(scanId)
        },
        include: {
            vulnerabilities: true
        }
    });
    if (!scan) {
        res.status(404);
        throw new Error("Scan not found");
    }
    res.status(200).json({
        success: true,
        data: scan
    });
});

export const getProjectScans = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    if (!projectId) {
        res.status(400);
        throw new Error("Project ID is required");
    }

    const scans = await prisma.scan.findMany({
        where: { projectId: String(projectId) },
        orderBy: { createdAt: 'desc' }, // الأحدث يظهر أولاً
        select: {
            id: true,
            fileName: true,
            status: true,
            createdAt: true,
            // نأخذ عدد الثغرات فقط للسرعة في عرض الجدول
            _count: {
                select: { vulnerabilities: true }
            }
        }
    });

    res.status(200).json({ success: true, scans });
});



export const getLatestProjectScan = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;

    const latestScan = await prisma.scan.findFirst({
        where: { projectId: String(projectId) },
        orderBy: { createdAt: 'desc' },
        include: { vulnerabilities: true }
    });

    if (!latestScan) {
        return res.status(404).json({ success: false, message: "No scans found for this project" });
    }

    res.status(200).json({ success: true, scan: latestScan });
});