import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import asyncHandler from '../utils/asyncHandler';



export const getHome = asyncHandler(async (req: Request, res: Response) => {
    const scans = prisma.scan.count();
    const vulnerabilities = prisma.vulnerability.count();

    const result = await prisma.scan.aggregate({
        where: {
            securityScore: {
                gt: 0, 
            },
        },
        _avg: {
            securityScore: true,
        },
    });

    const averageScore = result._avg.securityScore || 0;

    res.status(200).json({success: true, scans, vulnerabilities, averageScore});
 
});