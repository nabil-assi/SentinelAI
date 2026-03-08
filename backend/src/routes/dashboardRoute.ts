import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware.ts';

import { getDashboard } from '../controllers/dashboardController.ts';
const router = Router();


router.get('/', protect, getDashboard);
// router.get('/settings', protect, getSettingsData)

export default router;
