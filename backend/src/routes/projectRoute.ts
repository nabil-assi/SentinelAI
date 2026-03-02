import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.ts'; 
 
import {createProject} from '../controllers/projectController.ts';
const router = Router();


router.post('/', protect, createProject);

export default router;
