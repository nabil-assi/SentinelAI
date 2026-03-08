import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';





export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    const SevenDaysAgo = new Date();
    SevenDaysAgo.setDate(SevenDaysAgo.getDate() - 7);


    const [
        projects,
        totalProjects,
        thisWeekProjects,
        totalScans,
        thisWeekTotalScans,
        stats,
        activeVulnerabilities
    ] = await Promise.all([
        prisma.project.findMany({
            where: {
                userId: String(userId),
                scans: {
                    some: {}
                }
            },
            select: {
                name: true,
                scans: {
                    select: {
                        status: true,
                        _count: {
                            select: { vulnerabilities: true }
                        },
                        securityScore: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
            }
        }),
        prisma.project.count({
            where: {
                userId: String(userId),

            }
        }),
        prisma.project.count({
            where: {
                userId: String(userId),
                createdAt: {
                    gte: SevenDaysAgo,
                }

            }
        }),

        prisma.scan.count({
            where: {
                project: {
                    userId: String(userId)
                }
            }
        }),
        prisma.scan.count({
            where: {
                project: {
                    userId: String(userId)
                },
                createdAt: {
                    gte: SevenDaysAgo,
                }
            }
        }),
        prisma.scan.aggregate({
            where: {
                project: {
                    userId: String(userId),

                },
                securityScore: {
                    not: null
                }
            },
            _avg: {
                securityScore: true,
            },
            _max: {
                securityScore: true,
            },
            _min: {
                securityScore: true,
            },
            _count: {
                id: true,
            }

        }),
        prisma.vulnerability.count({
            where: {
                scan: {
                    project: {
                        userId: String(userId)
                    }
                },
                severity: 'CRITICAL',

            }
        })
    ])


    res.status(200).json({
        success: true,
        totalProjects,
        totalScans,
        stats: {
            ...stats,
            _avg: {
                securityScore: stats._avg.securityScore ? Math.round(stats._avg.securityScore) : 0

            }
        },
        activeVulnerabilities, thisWeekProjects,
        thisWeekTotalScans,
        projects
    })


});
