import { DiTokens } from '../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncHolidaysUseCase } from '../../application/use-cases/holiday/sync-holidays.use-case.js';
import { type IJobLock } from '../../domain/interfaces/job-lock.interface.js';

@Injectable()
export class HolidaysSyncCron {
  private readonly logger = new Logger(HolidaysSyncCron.name);
  private readonly lockName = 'holidays_sync';
  private readonly lockTtlMinutes = 15;

  constructor(
    @Inject(DiTokens.jobLock) private jobLock: IJobLock,
    private syncHolidaysUseCase: SyncHolidaysUseCase,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async syncHolidaysMonthly() {
    const year = new Date().getFullYear();
    this.logger.log(`Starting monthly holidays sync for year ${year}`);

    const acquired = await this.jobLock.acquire(this.lockName, this.lockTtlMinutes);

    if (!acquired) {
      this.logger.log('Monthly holidays sync skipped because another instance is running');
      return;
    }

    try {
      const { synced } = await this.syncHolidaysUseCase.syncHolidaysByYear({ year });
      this.logger.log(`Synced ${synced} holidays for year ${year}`);
    } catch (error) {
      this.logger.error(
        `Failed to sync holidays: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await this.jobLock.release(this.lockName);
    }
  }
}
