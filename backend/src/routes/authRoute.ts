import { Router, Request, Response } from 'express';
import { register, login, googleAuthCallback, logout, getAllUser,getUser } from '../controllers/authController';
import passport from 'passport';
import { AuthRequest, protect } from '../middlewares/authMiddleware';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

const router = Router();


import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.get('/allUsers', getAllUser);
router.get('/user/:email', getUser);

router.post('/register', register);
// router.get('/users', allUsers);
router.post('/login', login);
router.post('/logout', protect as any, logout);

router.get('/me', protect as any, userData);
 

router.post('/google', async (req: Request, res: Response) => {
    const {token} = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token not found" });
    }

    try {
        const payload = await verifyGoogleToken(token);
        const user = await findOrCreateUser(payload);
        const appToken = await generateToken(user);

        res.json({
            message: "Login Successfully",
            token: appToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                // image: user.image
            }
        })

    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }

});

const verifyGoogleToken = async (token: string) => {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;
    } catch (error) {
        throw new Error('Invalid Google token');
    }
};
const findOrCreateUser = async (profile: any) => {
    const { email, name, sub } = profile;

    let user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                email,
                name: name || '',
                provider: 'GOOGLE',
                googleId: sub,
            }
        })
    } else if (!user.googleId) {
        user = await prisma.user.update({
            where: { email },
            data: { googleId: sub, provider: 'GOOGLE' }
        })
    }
    return user;

};
const generateToken = (user: any) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,             // المفتاح السري (من .env)
        { expiresIn: '7d' }                  // مدة الصلاحية
    );
}

export default router;


