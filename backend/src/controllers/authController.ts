import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) return res.status(400).json({ message: "User already exists", success: false });

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name }
  });

  res.status(201).json({ message: "User created successfully", userId: user.id, success: true });

});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("Body received:", req.body);
  if (!user) return res.status(400).json({ message: "User not found", success: false });

  const isPasswordValid = await bcrypt.compare(password, String(user.password));
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid Credentials", success: false });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: "1d" }
  )

  res.status(200).json({ message: "Login successful", token, success: true });

});

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  //req.user بيوصلنا من Passport بعد نجاح تسجيل الدخuserول
  const user = req.user as any;

  if (!user) {
    return res.redirect('http://localhost:3000/login?error=auth_failed');
  }

  // توليد التوكن (JWT)
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  // إرسال التوكن في Cookie أمانها عالي
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  // توجيه المستخدم للفرونت إيند
  res.redirect('http://localhost:3000/dashboard?login=success');
});
export const allUsers = asyncHandler(async (req: Request, res: Response) => {

  const users = await prisma.user.findMany();
  res.status(200).json(users);

});