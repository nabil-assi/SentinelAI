// cache.service.ts
import Redis from 'ioredis';
import { queryNVD } from './nvd.service.js'; // استورد الدالة الأصلية

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('❌ Redis connection failed after 3 retries');
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000);
  }
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

export async function getCachedNVDResult(packageName: string, version: string) {
  try {
    const key = `nvd:${packageName}:${version}`;
    console.log(`🔍 Checking cache for ${key}`);
    
    // حاول تجيب من الكاش
    const cached = await redis.get(key);
    
    if (cached) {
      console.log(`✅ Cache HIT for ${packageName}@${version}`);
      return JSON.parse(cached);
    }
    
    console.log(`❌ Cache MISS for ${packageName}@${version}, querying NVD...`);
    
    // استخدم الدالة الأصلية مباشرة
    const result = await queryNVD(packageName, version);
    
    // خزن في الكاش لمدة 24 ساعة
    await redis.setex(key, 86400, JSON.stringify(result));
    console.log(`💾 Cached ${packageName}@${version} for 24 hours`);
    
    return result;
  } catch (error) {
    console.error(`❌ Cache error for ${packageName}:`, error);
    // لو فشل الكاش، استخدم NVD مباشرة
    return await queryNVD(packageName, version);
  }
}

// دالة لمسح الكاش
export async function clearCache() {
  try {
    await redis.flushall();
    console.log('🧹 Redis cache cleared');
  } catch (error) {
    console.error('❌ Failed to clear cache:', error);
  }
}

// دالة لجلب إحصائيات الكاش
export async function getCacheStats() {
  try {
    const info = await redis.info();
    const keyspace = info.match(/keyspace=(\d+)/);
    return {
      connected: true,
      keys: keyspace ? parseInt(keyspace[1]) : 0
    };
  } catch (error) {
    return {
      connected: false,
      keys: 0
    };
  }
}