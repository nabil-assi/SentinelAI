import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// تحميل ملف الـ .env يدوياً قبل تعريف الإعدادات
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});