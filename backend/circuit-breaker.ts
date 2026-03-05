// circuit-breaker.ts
import CircuitBreaker from 'opossum';
import { queryNVD } from './src/services/nvd.service';

const breaker = new CircuitBreaker(queryNVD, {
  timeout: 30000,           // 30 seconds
  errorThresholdPercentage: 50, // فتح الدائرة إذا 50% من الطلبات فشلت
  resetTimeout: 30000,      // حاول مرة أخرى بعد 30 ثانية
  volumeThreshold: 10       // قبل فتح الدائرة
});

breaker.fallback(() => {
  return []; // رجع array فاضي لو الدائرة مفتوحة
});