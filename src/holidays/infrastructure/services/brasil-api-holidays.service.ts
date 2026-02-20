import { Injectable, Logger } from '@nestjs/common';
import type {
  BrasilApiHoliday,
  IBrasilApiHolidaysService,
} from '../../domain/interfaces/brasil-api-holidays.service.interface.js';

@Injectable()
export class BrasilApiHolidaysService implements IBrasilApiHolidaysService {
  private readonly logger = new Logger(BrasilApiHolidaysService.name);

  async fetchHolidaysByYear(year: number): Promise<BrasilApiHoliday[]> {
    const url = `https://brasilapi.com.br/api/feriados/v1/${year}`;

    const response = await fetch(url);

    if (!response.ok) {
      this.logger.error(`BrasilAPI returned status ${response.status} for year ${year}`);
      throw new Error(`Failed to fetch holidays from BrasilAPI: ${response.statusText}`);
    }

    return response.json() as Promise<BrasilApiHoliday[]>;
  }
}
