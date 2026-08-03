import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { HandleVindiBillCancelledUseCase } from './handle-vindi-bill-cancelled.use-case.js';

describe('HandleVindiBillCancelledUseCase', () => {
  let useCase: HandleVindiBillCancelledUseCase;
  let paymentRepository: {
    findPaymentByGatewayTransactionId: Mock;
    cancelPaymentById: Mock;
  };
  let appointmentRepository: { cancelAppointmentById: Mock };
  let emailService: { sendPaymentCancelledEmail: Mock };

  const pendingPayment = {
    id: 1,
    status: 'PENDING',
    amount: 200,
    client: { id: 1, name: 'João', email: 'joao@test.com', cpfCnpj: null },
    appointment: {
      id: 1,
      date: new Date('2026-03-16'),
      startTime: '09:00',
      service: { id: 1, name: 'Faxina Regular' },
      recurrenceType: 'SINGLE',
    },
    card: null,
  };

  beforeEach(async () => {
    paymentRepository = {
      findPaymentByGatewayTransactionId: vi.fn(),
      cancelPaymentById: vi.fn(),
    };
    appointmentRepository = { cancelAppointmentById: vi.fn().mockResolvedValue(true) };
    emailService = { sendPaymentCancelledEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleVindiBillCancelledUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
        { provide: DiTokens.emailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<HandleVindiBillCancelledUseCase>(HandleVindiBillCancelledUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should cancel payment, release the slot and send email', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(pendingPayment);
    paymentRepository.cancelPaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'CANCELLED',
    });

    await useCase.handleBillCancelled(100, 'Card declined');

    expect(paymentRepository.findPaymentByGatewayTransactionId).toHaveBeenCalledWith('100');
    expect(paymentRepository.cancelPaymentById).toHaveBeenCalledWith(1, 'Card declined');
    expect(appointmentRepository.cancelAppointmentById).toHaveBeenCalledWith(1);
    expect(emailService.sendPaymentCancelledEmail).toHaveBeenCalledWith(
      'joao@test.com',
      'João',
      expect.any(String) as string,
      'Faxina Regular',
    );
  });

  it('should skip when no payment found for bill', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue(null);

    await useCase.handleBillCancelled(999, 'Card declined');

    expect(paymentRepository.cancelPaymentById).not.toHaveBeenCalled();
  });

  it('should skip when payment is not PENDING (idempotent)', async () => {
    paymentRepository.findPaymentByGatewayTransactionId.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await useCase.handleBillCancelled(100, 'Card declined');

    expect(paymentRepository.cancelPaymentById).not.toHaveBeenCalled();
  });
});
