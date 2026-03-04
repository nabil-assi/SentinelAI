import { Router } from 'express';
import { register, allUsers, login, googleAuthCallback } from '../controllers/authController.ts';
import passport from 'passport';

const router = Router();

router.post('/register', register);
router.get('/users', allUsers);
router.post('/login', login);

 router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

 
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
    googleAuthCallback
);
export default router;