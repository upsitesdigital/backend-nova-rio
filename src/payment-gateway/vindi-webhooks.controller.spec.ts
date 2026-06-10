import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { ProcessVindiWebhookUseCase } from './application/use-cases/webhook/process-vindi-webhook.use-case.js';
import { VindiWebhooksController } from './vindi-webhooks.controller.js';
import type { VindiWebhookPayload } from './domain/types/vindi.types.js';

function fakeReq(payload: unknown, rawBody?: Buffer) {
  return { body: payload, rawBody } as never;
}

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

  it('should delegate to the use-case with the raw body and signature', async () => {
    const rawBody = Buffer.from('{"raw":true}');

    const result = await controller.receiveVindiWebhook(
      'sig-123',
      fakeReq(payload, rawBody),
      payload,
    );

    expect(processVindiWebhook.processVindiWebhook).toHaveBeenCalledWith(
      rawBody,
      'sig-123',
      payload,
    );
    expect(result).toEqual({ received: true });
  });

  it('should fall back to stringified body when rawBody is absent', async () => {
    await controller.receiveVindiWebhook('sig-123', fakeReq(payload), payload);

    expect(processVindiWebhook.processVindiWebhook).toHaveBeenCalledWith(
      JSON.stringify(payload),
      'sig-123',
      payload,
    );
  });

  it('should propagate errors from the use-case', async () => {
    processVindiWebhook.processVindiWebhook.mockRejectedValue(new Error('boom'));

    await expect(
      controller.receiveVindiWebhook('sig-123', fakeReq(payload), payload),
    ).rejects.toThrow('boom');
  });
});
