import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import asyncHandler from '../utils/asyncHandler';


export const getHome = asyncHandler(async (req: Request, res: Response) => {
    const [scansCount, vulnerabilitiesCount, aggregateResult] = await Promise.all([
        prisma.scan.count(),
        prisma.vulnerability.count(),
        prisma.scan.aggregate({
            where: {
                securityScore: { gt: 0 },
            },
            _avg: {
                securityScore: true,
            },
        })
    ]);

    const averageScore = aggregateResult._avg.securityScore || 0;

    res.status(200).json({
        success: true, 
        scans: scansCount, 
        vulnerabilities: vulnerabilitiesCount, 
        averageScore: Math.round(averageScore)
    });
});