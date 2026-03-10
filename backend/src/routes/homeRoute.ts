import express, { Router } from 'express';
import { getHome } from '../controllers/homeController';
const router = Router();


router.get('/', getHome);
// router.get('/settings', protect, getSettingsData)

export default router;
