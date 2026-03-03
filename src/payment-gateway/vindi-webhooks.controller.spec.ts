import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HandleVindiBillPaidUseCase } from './application/use-cases/webhook/handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './application/use-cases/webhook/handle-vindi-charge-rejected.use-case.js';
import { VindiWebhooksController } from './vindi-webhooks.controller.js';

describe('VindiWebhooksController', () => {
  let controller: VindiWebhooksController;
  let handleBillPaid: { handleBillPaid: Mock };
  let handleChargeRejected: { handleChargeRejected: Mock };

  beforeEach(async () => {
    handleBillPaid = { handleBillPaid: vi.fn().mockResolvedValue(undefined) };
    handleChargeRejected = { handleChargeRejected: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VindiWebhooksController],
      providers: [
        { provide: HandleVindiBillPaidUseCase, useValue: handleBillPaid },
        { provide: HandleVindiChargeRejectedUseCase, useValue: handleChargeRejected },
      ],
    }).compile();

    controller = module.get<VindiWebhooksController>(VindiWebhooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should handle bill_paid event', async () => {
    const payload = {
      event: {
        type: 'bill_paid',
        data: {
          bill: { id: 100, status: 'paid', amount: '200.00', charges: [], customer: { id: 1 } },
        },
      },
    };

    const result = await controller.receiveVindiWebhook(payload);

    expect(handleBillPaid.handleBillPaid).toHaveBeenCalledWith(100);
    expect(result).toEqual({ received: true });
  });

  it('should handle charge_rejected event', async () => {
    const payload = {
      event: {
        type: 'charge_rejected',
        data: {
          charge: {
            id: 50,
            status: 'rejected',
            amount: '200.00',
            bill: { id: 100 },
            last_transaction: { gateway_message: 'Insufficient funds' },
          },
        },
      },
    };

    const result = await controller.receiveVindiWebhook(payload);

    expect(handleChargeRejected.handleChargeRejected).toHaveBeenCalledWith(
      100,
      'Insufficient funds',
    );
    expect(result).toEqual({ received: true });
  });

  it('should handle bill_canceled event', async () => {
    const payload = {
      event: {
        type: 'bill_canceled',
        data: {
          bill: { id: 100, status: 'canceled', amount: '200.00', charges: [], customer: { id: 1 } },
        },
      },
    };

    const result = await controller.receiveVindiWebhook(payload);

    expect(handleChargeRejected.handleChargeRejected).toHaveBeenCalledWith(
      100,
      'Bill cancelled by gateway',
    );
    expect(result).toEqual({ received: true });
  });

  it('should return received:true even for unknown events', async () => {
    const payload = {
      event: {
        type: 'unknown_event',
        data: { bill: { id: 0, status: '', amount: '0', charges: [], customer: { id: 0 } } },
      },
    };

    const result = await controller.receiveVindiWebhook(payload);

    expect(result).toEqual({ received: true });
  });

  it('should return received:true even when handler throws', async () => {
    handleBillPaid.handleBillPaid.mockRejectedValue(new Error('DB error'));

    const payload = {
      event: {
        type: 'bill_paid',
        data: {
          bill: { id: 100, status: 'paid', amount: '200.00', charges: [], customer: { id: 1 } },
        },
      },
    };

    const result = await controller.receiveVindiWebhook(payload);

    expect(result).toEqual({ received: true });
  });
});
