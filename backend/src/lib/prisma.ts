import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// إعداد الاتصال بـ PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// إنشاء نسخة الـ Client مع الـ Adapter
export const prisma = new PrismaClient({ adapter });

// اختبار بسيط للاتصال (اختياري)
prisma.$connect()
  .then(() => console.log("✅ Prisma connected successfully to PostgreSQL (v7)"))
  .catch((err) => console.error("❌ Prisma connection error:", err));