import express, { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';

import { getDashboard } from '../controllers/dashboardController';
const router = Router();


router.get('/', protect as any, getDashboard);
// router.get('/settings', protect, getSettingsData)

export default router;
