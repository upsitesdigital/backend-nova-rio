import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ProcessVindiWebhookUseCase } from './application/use-cases/webhook/process-vindi-webhook.use-case.js';
import { VindiWebhooksController } from './vindi-webhooks.controller.js';
import type { VindiWebhookPayload } from './domain/types/vindi.types.js';

const AUTH = 'Basic dXNlcjpwYXNz';

const payload = {
  event: {
    type: 'bill_paid',
    data: {
      bill: { id: 100, status: 'paid', amount: '200.00', charges: [], customer: { id: 1 } },
    },
  },
} as unknown as VindiWebhookPayload;

describe('VindiWebhooksController', () => {
  let controller: VindiWebhooksController;
  let processVindiWebhook: { processVindiWebhook: Mock };

  beforeEach(async () => {
    processVindiWebhook = { processVindiWebhook: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VindiWebhooksController],
      providers: [{ provide: ProcessVindiWebhookUseCase, useValue: processVindiWebhook }],
    }).compile();

    controller = module.get<VindiWebhooksController>(VindiWebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate to the use-case with the authorization header', async () => {
    const result = await controller.receiveVindiWebhook(AUTH, payload);

    expect(processVindiWebhook.processVindiWebhook).toHaveBeenCalledWith(AUTH, payload);
    expect(result).toEqual({ received: true });
  });

  it('should propagate errors from the use-case', async () => {
    processVindiWebhook.processVindiWebhook.mockRejectedValue(new Error('boom'));

    await expect(controller.receiveVindiWebhook(AUTH, payload)).rejects.toThrow('boom');
  });
});
