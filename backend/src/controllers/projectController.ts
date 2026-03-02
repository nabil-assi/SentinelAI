import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, github } = req.body;
    const userId = (req as any).user?.id;
    // console.log(`UserID::::::::::::: ${userId}`);
    if (!name || !description || !github) {
        return res.status(400).json({ message: 'Please provide all required fields', success: false });
    }
    const project = await prisma.project.create({
        data: {
            name: name,
            description: description,
            repoUrl: github,
            user: {
                connect: {
                    id: userId
                }
            }
        },
    });

    res.status(201).json({ project, success: true });
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
        where: { id: String(projectId) },
        include: {
            scans: true,
        },
    });

    if (!project) {
        return res.status(404).json({ message: 'Project not found', success: false });
    }

    res.status(200).json({ project, success: true });
});
export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const projects = await prisma.project.findMany({
        where: { userId: userId },
        include: {
            scans: true,
        }
    })
    res.status(200).json({ projects, success: true });
});