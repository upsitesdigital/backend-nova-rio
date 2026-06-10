export interface IJobLock {
  acquire(name: string, ttlMinutes: number): Promise<boolean>;
  release(name: string): Promise<void>;
}
