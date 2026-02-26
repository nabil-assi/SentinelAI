import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { errorHandler } from './middlewares/globalErrorHandler.ts';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
// Routes
app.get('/health', (req: Request, res: Response) => {
    res.send('Server is healthy');
});

const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

export default app;