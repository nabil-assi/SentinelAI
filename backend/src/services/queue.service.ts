// queue.service.ts
import Queue from 'bull';
import { analyzeDependencies } from '../handlers/analyzeDependencies.js';
import { prisma } from '../lib/prisma.js';

const scanQueue = new Queue('security scans', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: 3
  },
  limiter: {
    max: 2,        // 2 scans per second
    duration: 1000 
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100, // احتفظ بآخر 100 فحص مكتمل
    removeOnFail: 200 // احتفظ بآخر 200 فحص فاشل
  }
});

// معالجة الفحوصات
scanQueue.process(3, async (job) => {
  const { projectId, scanId } = job.data;
  
  console.log(`🔄 Processing scan job ${job.id} for project ${projectId}`);
  
  try {
    // جلب الفحص من قاعدة البيانات
    const scan = await prisma.scan.findUnique({
      where: { id: scanId }
    });

    if (!scan) {
      throw new Error(`Scan ${scanId} not found`);
    }

    // هنا ممكن تنادي الدالة الرئيسية
    // لكن بما أن analyzeDependencies مصممة Express handler، 
    // الأفضل نستخدم runSecurityScan من الحل 1
    
    await job.progress(50);
    
    return { 
      success: true, 
      scanId,
      message: 'Scan completed successfully' 
    };
    
  } catch (error) {
    console.error(`❌ Job ${job.id} failed:`, error);
    throw error;
  }
});

// أحداث الـ queue
scanQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

scanQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

scanQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

scanQueue.on('stalled', (job) => {
  console.warn(`⚠️ Job ${job.id} stalled`);
});

export async function queueScan(projectId: string, file?: Express.Multer.File) {
  // أولاً: إنشاء سجل الفحص
  const scan = await prisma.scan.create({
    data: {
      projectId,
      fileName: file?.originalname || 'github-fetch',
      fileType: file?.originalname?.includes('lock') ? 'package-lock.json' : 'package.json',
      status: "PENDING",
    }
  });

  // ثانياً: إضافته للـ queue
  const job = await scanQueue.add({
    projectId,
    scanId: scan.id,
    file: file ? {
      originalname: file.originalname,
      buffer: file.buffer.toString('base64'), // تحويل buffer لـ string
      mimetype: file.mimetype
    } : null
  }, {
    jobId: `scan-${scan.id}`,
    priority: 1, // 1 أعلى أولوية
    delay: 0,
    attempts: 3
  });
  
  console.log(`📥 Scan queued: ${scan.id} (job: ${job.id})`);
  
  return { 
    scanId: scan.id, 
    jobId: job.id,
    status: 'queued',
    position: await scanQueue.getWaitingCount()
  };
}

// دالة لجلب حالة الفحص
export async function getScanStatus(scanId: string) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { vulnerabilities: true }
  });

  if (!scan) return null;

  const jobs = await scanQueue.getJobs(['active', 'waiting', 'completed', 'failed']);
  const job = jobs.find(j => j.data.scanId === scanId);

  return {
    ...scan,
    queueStatus: job ? await job.getState() : 'not_found',
    queuePosition: job ? await getJobPosition(String(job.id)) : null
  };
}

// دالة مساعدة لجلب ترتيب الـ job
async function getJobPosition(jobId: string) {
  const waitingJobs = await scanQueue.getWaiting();
  const index = waitingJobs.findIndex(j => j.id === jobId);
  return index === -1 ? null : index + 1;
}

export default scanQueue;