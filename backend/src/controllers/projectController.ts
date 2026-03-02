import express from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, github } = req.body;
    const userId = (req as any).user?.id;
    console.log(`UserID::::::::::::: ${userId}`);
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