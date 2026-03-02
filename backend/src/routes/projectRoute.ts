import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.ts'; 
 
import {createProject, getProjectById, getAllProjects} from '../controllers/projectController.ts';
const router = Router();


router.post('/', protect, createProject);
router.get('/', protect, getAllProjects);

router.get('/:id',getProjectById );

export default router;
