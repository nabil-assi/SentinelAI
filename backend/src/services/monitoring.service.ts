// monitoring.service.ts
import os from 'os';

class Monitor {
  private scansInProgress = 0;
  private maxConcurrentScans = 5;
  
  async canStartScan(): Promise<boolean> {
    const loadAvg = os.loadavg()[0];
    const freeMem = os.freemem() / os.totalmem();
    
    return (
      this.scansInProgress < this.maxConcurrentScans &&
      loadAvg < 4 &&
      freeMem > 0.2
    );
  }
  
  async startScan(scanId: string) {
    if (!await this.canStartScan()) {
      throw new Error('System busy, try later');
    }
    this.scansInProgress++;
    // ... start scan
  }
}