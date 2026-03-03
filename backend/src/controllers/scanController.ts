import type { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';
import { Groq } from "groq-sdk";
import { ScanStatus } from '@prisma/client';

// إعداد Groq باستخدام المفتاح من البيئة
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface RequestWithFile extends Request {
    file?: Express.Multer.File;
}

export const analyzeDependencies = asyncHandler(async (req: RequestWithFile, res: Response) => {
    const { projectId } = req.params; // تأكد أن الـ Route يستخدم :projectId وليس :id
    let packageJson: any;
    let fileName = "package.json";

    if (!projectId) {
        res.status(400);
        throw new Error("Project ID is missing from request");
    }

    // 1. جلب محتوى الملف
    if (req.file) {
        console.log("Mode: Manual File Upload Detected - Filename:", req.file.originalname);
        packageJson = JSON.parse(req.file.buffer.toString("utf-8"));
        fileName = req.file.originalname;
    } else {
        console.log("Mode: GitHub Repository Scan Detected - Project ID:", projectId);
        const project = await prisma.project.findUnique({ where: { id: String(projectId) } });
        if (!project || !project.repoUrl) throw new Error("Project or Repo URL not found");

        const rawUrl = project.repoUrl
            .replace("github.com", "raw.githubusercontent.com")
            .replace(/\/$/, "") + "/main/package.json";

        const githubResponse = await axios.get(rawUrl);
        packageJson = githubResponse.data;
    }

    const dependencies = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

    // 2. إنشاء سجل Scan
    const scan = await prisma.scan.create({
        data: {
            projectId: projectId as string,
            fileName,
            fileType: "package.json",
            status: "PROCESSING",
        }
    });

    try {
        // 3. الاتصال بـ Groq (استخدام موديل Llama 3 السريع)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a security expert. Return ONLY a JSON object with a 'vulnerabilities' array. Each object should have: libraryName, title, description, severity (MUST BE ONE OF: LOW, MEDIUM, HIGH, CRITICAL), recommendation, and cveId."
                },
                {
                    role: "user",
                    content: `Analyze these dependencies for vulnerabilities: ${JSON.stringify(dependencies)}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const aiContent = chatCompletion.choices[0]?.message?.content;
        if (!aiContent) throw new Error("AI failed to return content");

        const aiResult = JSON.parse(aiContent);

        // 4. التخزين في قاعدة البيانات (Transaction)
        await prisma.$transaction([
            prisma.vulnerability.createMany({
                data: aiResult.vulnerabilities.map((v: any) => ({
                    scanId: scan.id,
                    libraryName: v.libraryName,
                    title: v.title,
                    description: v.description,
                    severity: v.severity.toUpperCase(), // ضمان التوافق مع Enum
                    recommendation: v.recommendation,
                    cveId: v.cveId || "N/A"
                }))
            }),
            prisma.scan.update({
                where: { id: scan.id },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    aiInsights: aiResult
                }
            })
        ]);

        res.status(200).json({ success: true, scanId: scan.id });

    } catch (error) {
        console.error("Analysis Error:", error);
        await prisma.scan.update({
            where: { id: scan.id },
            data: { status: "FAILED" }
        });
        res.status(500).json({ error: "AI Analysis failed" });
    }
});
export const getScanResults = asyncHandler(async (req: Request, res: Response) => {
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