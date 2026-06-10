import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type { IProcessedWebhookEventRepository } from '../../domain/interfaces/processed-webhook-event.repository.interface.js';

@Injectable()
export class PrismaProcessedWebhookEventRepository implements IProcessedWebhookEventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerEventOnce(eventId: string, provider: string): Promise<boolean> {
    const inserted = await this.prisma.processedWebhookEvent.createMany({
      data: { eventId, provider },
      skipDuplicates: true,
    });

    return inserted.count > 0;
  }
}
