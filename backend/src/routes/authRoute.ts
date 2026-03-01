import { Router } from 'express';
import { register, allUsers, login, googleAuthCallback } from '../controllers/authController.ts';
import passport from 'passport';

const router = Router();

router.post('/register', register);
router.get('/users', allUsers);
router.post('/login', login);

// مسار البداية: يوجه المستخدم لجوجل
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// مسار العودة: جوجل بيرجع المستخدم لهون
// بنستخدم passport كميدل وير أولاً، وبعدين بننادي الكونترولر تبعنا
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/login' }),
    googleAuthCallback
);
export default router;