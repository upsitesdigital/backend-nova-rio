import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HandleVindiBillCancelledUseCase } from './handle-vindi-bill-cancelled.use-case.js';
import { HandleVindiBillPaidUseCase } from './handle-vindi-bill-paid.use-case.js';
import { HandleVindiChargeRejectedUseCase } from './handle-vindi-charge-rejected.use-case.js';
import { ProcessVindiWebhookUseCase } from './process-vindi-webhook.use-case.js';
import type { VindiWebhookPayload } from '../../../domain/types/vindi.types.js';

function billPaidPayload(billId: number): VindiWebhookPayload {
  return {
    event: {
      type: 'bill_paid',
      data: {
        bill: { id: billId, status: 'paid', amount: '200.00', charges: [], customer: { id: 1 } },
      },
    },
  };
}

function chargeRejectedPayload(billId: number, message?: string): VindiWebhookPayload {
  return {
    event: {
      type: 'charge_rejected',
      data: {
        charge: {
          id: 50,
          status: 'rejected',
          amount: '200.00',
          bill: { id: billId },
          last_transaction: message ? { gateway_message: message } : {},
        },
      },
    },
  } as unknown as VindiWebhookPayload;
}

function billCanceledPayload(billId: number): VindiWebhookPayload {
  return {
    event: {
      type: 'bill_canceled',
      data: {
        bill: {
          id: billId,
          status: 'canceled',
          amount: '200.00',
          charges: [],
          customer: { id: 1 },
        },
      },
    },
  };
}

describe('ProcessVindiWebhookUseCase', () => {
  let useCase: ProcessVindiWebhookUseCase;
  let authenticator: { authenticate: Mock };
  let processedEventRepository: { registerEventOnce: Mock };
  let handleBillPaid: { handleBillPaid: Mock };
  let handleChargeRejected: { handleChargeRejected: Mock };
  let handleBillCancelled: { handleBillCancelled: Mock };
  const AUTH = 'Basic dXNlcjpwYXNz';

  beforeEach(async () => {
    authenticator = { authenticate: vi.fn().mockReturnValue(true) };
    processedEventRepository = { registerEventOnce: vi.fn().mockResolvedValue(true) };
    handleBillPaid = { handleBillPaid: vi.fn().mockResolvedValue(undefined) };
    handleChargeRejected = { handleChargeRejected: vi.fn().mockResolvedValue(undefined) };
    handleBillCancelled = { handleBillCancelled: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessVindiWebhookUseCase,
        { provide: DiTokens.webhookAuthenticator, useValue: authenticator },
        { provide: DiTokens.processedWebhookEventRepository, useValue: processedEventRepository },
        { provide: HandleVindiBillPaidUseCase, useValue: handleBillPaid },
        { provide: HandleVindiChargeRejectedUseCase, useValue: handleChargeRejected },
        { provide: HandleVindiBillCancelledUseCase, useValue: handleBillCancelled },
      ],
    }).compile();

    useCase = module.get<ProcessVindiWebhookUseCase>(ProcessVindiWebhookUseCase);
  });

  it('should reject when the credentials are invalid', async () => {
    authenticator.authenticate.mockReturnValue(false);

    await expect(useCase.processVindiWebhook(AUTH, billPaidPayload(100))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(processedEventRepository.registerEventOnce).not.toHaveBeenCalled();
  });

  it('should handle bill_paid with the bill id', async () => {
    await useCase.processVindiWebhook(AUTH, billPaidPayload(100));

    expect(handleBillPaid.handleBillPaid).toHaveBeenCalledWith(100);
  });

  it('should handle charge_rejected with the gateway message', async () => {
    await useCase.processVindiWebhook(AUTH, chargeRejectedPayload(100, 'Insufficient funds'));

    expect(handleChargeRejected.handleChargeRejected).toHaveBeenCalledWith(
      100,
      'Insufficient funds',
    );
  });

  it('should handle bill_canceled as an immediate cancellation', async () => {
    await useCase.processVindiWebhook(AUTH, billCanceledPayload(100));

    expect(handleBillCancelled.handleBillCancelled).toHaveBeenCalledWith(
      100,
      'Bill cancelled by gateway',
    );
    expect(handleChargeRejected.handleChargeRejected).not.toHaveBeenCalled();
  });

  it('should skip routing for duplicate events', async () => {
    processedEventRepository.registerEventOnce.mockResolvedValue(false);

    await useCase.processVindiWebhook(AUTH, billPaidPayload(100));

    expect(handleBillPaid.handleBillPaid).not.toHaveBeenCalled();
  });

  it('should not throw for unknown event types', async () => {
    const unknown = {
      event: { type: 'unknown_event', data: {} },
    } as unknown as VindiWebhookPayload;

    await expect(useCase.processVindiWebhook(AUTH, unknown)).resolves.toBeUndefined();
  });

  it('should re-throw when a handler fails', async () => {
    handleBillPaid.handleBillPaid.mockRejectedValue(new Error('DB error'));

    await expect(useCase.processVindiWebhook(AUTH, billPaidPayload(100))).rejects.toThrow(
      'DB error',
    );
  });
});
