import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/globalErrorHandler.ts';
dotenv.config();

import authRoutes from './routes/authRoute.ts';
import projectRoutes from './routes/projectRoute.ts';
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', 
  credentials: true, 
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
app.use(cookieParser());
// Routes

  console.log("Database URL is:", process.env.DATABASE_URL);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);


app.get('/health', (req: Request, res: Response) => {
    res.send('Server is healthy and runnig perfectly');
});

const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

export default app;