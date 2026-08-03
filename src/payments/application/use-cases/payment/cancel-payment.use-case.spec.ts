import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { CancelPaymentUseCase } from './cancel-payment.use-case.js';

describe('CancelPaymentUseCase', () => {
  let useCase: CancelPaymentUseCase;
  let paymentRepository: {
    findPaymentById: Mock;
    cancelPaymentById: Mock;
  };
  let paymentGatewayService: { cancelGatewayBillById: Mock };
  let appointmentRepository: { cancelAppointmentById: Mock };
  let emailService: { sendPaymentCancelledEmail: Mock };

  const pendingPayment = {
    id: 1,
    status: 'PENDING',
    amount: 200,
    gatewayTransactionId: '100',
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
      findPaymentById: vi.fn().mockResolvedValue(pendingPayment),
      cancelPaymentById: vi.fn().mockResolvedValue({ ...pendingPayment, status: 'CANCELLED' }),
    };
    paymentGatewayService = { cancelGatewayBillById: vi.fn().mockResolvedValue(undefined) };
    appointmentRepository = { cancelAppointmentById: vi.fn().mockResolvedValue(true) };
    emailService = { sendPaymentCancelledEmail: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelPaymentUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
        { provide: DiTokens.paymentGatewayService, useValue: paymentGatewayService },
        { provide: DiTokens.appointmentRepository, useValue: appointmentRepository },
        { provide: DiTokens.emailService, useValue: emailService },
      ],
    }).compile();

    useCase = module.get<CancelPaymentUseCase>(CancelPaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should cancel the gateway bill, the payment and the appointment', async () => {
    const result = await useCase.cancelPaymentById(1);

    expect(paymentGatewayService.cancelGatewayBillById).toHaveBeenCalledWith(100);
    expect(paymentRepository.cancelPaymentById).toHaveBeenCalledWith(
      1,
      'Cancelado pelo administrador',
    );
    expect(appointmentRepository.cancelAppointmentById).toHaveBeenCalledWith(1);
    expect(emailService.sendPaymentCancelledEmail).toHaveBeenCalled();
    expect(result.status).toBe('CANCELLED');
  });

  it('should skip the gateway when the payment has no bill', async () => {
    paymentRepository.findPaymentById.mockResolvedValue({
      ...pendingPayment,
      gatewayTransactionId: null,
    });

    await useCase.cancelPaymentById(1);

    expect(paymentGatewayService.cancelGatewayBillById).not.toHaveBeenCalled();
    expect(paymentRepository.cancelPaymentById).toHaveBeenCalled();
  });

  it('should throw NotFoundException when the payment does not exist', async () => {
    paymentRepository.findPaymentById.mockResolvedValue(null);

    await expect(useCase.cancelPaymentById(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when the payment is not pending', async () => {
    paymentRepository.findPaymentById.mockResolvedValue({
      ...pendingPayment,
      status: 'APPROVED',
    });

    await expect(useCase.cancelPaymentById(1)).rejects.toThrow(BadRequestException);
    expect(paymentGatewayService.cancelGatewayBillById).not.toHaveBeenCalled();
  });

  it('should not cancel locally when the gateway cancellation fails', async () => {
    paymentGatewayService.cancelGatewayBillById.mockRejectedValue(new Error('Vindi down'));

    await expect(useCase.cancelPaymentById(1)).rejects.toThrow('Vindi down');
    expect(paymentRepository.cancelPaymentById).not.toHaveBeenCalled();
  });
});
