import { Router } from 'express';
import { register, allUsers, login, googleAuthCallback, userData } from '../controllers/authController.ts';
import passport from 'passport';
import { protect } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/register', register);
router.get('/users', allUsers);
router.post('/login', login);
router.get('/me', protect, userData);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
    googleAuthCallback
);
export default router;