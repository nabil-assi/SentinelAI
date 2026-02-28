import { Router } from 'express';
import { register } from '../controllers/authController.ts';

const router = Router();

router.post('/register', register);

export default router;