import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';

import { createProject, getProjectById, getAllProjects } from '../controllers/projectController';
const router = Router();


router.post('/', protect as any, createProject);
router.get('/', protect as any, getAllProjects);

router.get('/:id', protect as any, getProjectById);

export default router;
