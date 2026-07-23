import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AppointmentSchedulingValidator } from '../../../../appointments/application/validators/appointment-scheduling.validator.js';
import type { CreatePublicCheckoutDto } from '../../../dto/payment/create-public-checkout.dto.js';
import { CreatePublicCheckoutUseCase } from './create-public-checkout.use-case.js';

describe('CreatePublicCheckoutUseCase', () => {
  let useCase: CreatePublicCheckoutUseCase;
  let paymentRepository: { createPayment: Mock };
  let paymentGatewayService: {
    createGatewayCustomer: Mock;
    createGatewayPaymentProfile: Mock;
    createGatewayBill: Mock;
    cancelGatewayBillById: Mock;
  };
  let pricingService: { calculatePricing: Mock };
  let clientAuthRepository: { findByEmail: Mock };
  let clientProfileRepository: { findClientForPayment: Mock; updateVindiCustomerId: Mock };
  let createClientAppointmentService: { createClientAppointment: Mock };
  let schedulingValidator: { validateSchedulingDate: Mock };

  const cardDto: CreatePublicCheckoutDto = {
    email: 'client@test.com',
    date: '2026-03-16',
    startTime: '09:00',
    duration: 120,
    serviceId: 1,
    method: 'CREDIT_CARD',
    cardNumber: '4242424242424242',
    cardCvv: '123',
    cardExpiry: '12/30',
    holderName: 'CAIO TESTE',
  };

  const pixDto: CreatePublicCheckoutDto = {
    email: 'client@test.com',
    date: '2026-03-16',
    startTime: '09:00',
    duration: 120,
    serviceId: 1,
    method: 'PIX',
  };

  const appointment = { id: 42, service: { id: 1, name: 'Faxina Premium' } };
  const approvedBill = { id: 900, status: 'paid', charges: [{ id: 1, status: 'paid' }] };

  beforeEach(async () => {
    paymentRepository = { createPayment: vi.fn().mockResolvedValue({ id: 7, status: 'PENDING' }) };
    paymentGatewayService = {
      createGatewayCustomer: vi.fn().mockResolvedValue({ id: 55 }),
      createGatewayPaymentProfile: vi.fn().mockResolvedValue({ id: 88 }),
      createGatewayBill: vi.fn().mockResolvedValue(approvedBill),
      cancelGatewayBillById: vi.fn().mockResolvedValue(undefined),
    };
    pricingService = {
      calculatePricing: vi.fn().mockResolvedValue({ subtotal: 50, discount: 5 }),
    };
    clientAuthRepository = { findByEmail: vi.fn().mockResolvedValue({ id: 1 }) };
    clientProfileRepository = {
      findClientForPayment: vi.fn().mockResolvedValue({
        id: 1,
        name: 'Caio',
        email: 'client@test.com',
        cpfCnpj: null,
        phone: null,
        vindiCustomerId: 55,
      }),
      updateVindiCustomerId: vi.fn(),
    };
    createClientAppointmentService = {
      createClientAppointment: vi.fn().mockResolvedValue(appointment),
    };
    schedulingValidator = { validateSchedulingDate: vi.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePublicCheckoutUseCase,
        { provide: DiTokens.paymentRepository, useValue: paymentRepository },
        { provide: DiTokens.paymentGatewayService, useValue: paymentGatewayService },
        { provide: DiTokens.paymentPricingService, useValue: pricingService },
        { provide: DiTokens.clientAuthRepository, useValue: clientAuthRepository },
        { provide: DiTokens.clientProfileRepository, useValue: clientProfileRepository },
        {
          provide: DiTokens.createClientAppointmentService,
          useValue: createClientAppointmentService,
        },
        { provide: AppointmentSchedulingValidator, useValue: schedulingValidator },
        { provide: ConfigService, useValue: { getOrThrow: vi.fn().mockReturnValue('123') } },
      ],
    }).compile();

    useCase = module.get<CreatePublicCheckoutUseCase>(CreatePublicCheckoutUseCase);
  });

  it('creates appointment and payment after the gateway accepts (card)', async () => {
    await useCase.createPublicCheckout(cardDto);

    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledTimes(1);
    expect(createClientAppointmentService.createClientAppointment).toHaveBeenCalledWith(1, cardDto);
    // amount = subtotal 50 - discount 5 + fee 3
    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 48,
        appointmentId: 42,
        gatewayTransactionId: '900',
      }),
    );
    expect(paymentGatewayService.cancelGatewayBillById).not.toHaveBeenCalled();
  });

  it('creates nothing when the gateway throws (PIX/invalid method)', async () => {
    paymentGatewayService.createGatewayBill.mockRejectedValue(new Error('gateway 422'));

    await expect(useCase.createPublicCheckout(pixDto)).rejects.toThrow();

    expect(createClientAppointmentService.createClientAppointment).not.toHaveBeenCalled();
    expect(paymentRepository.createPayment).not.toHaveBeenCalled();
  });

  it('voids the bill and creates nothing when the charge is rejected (2xx decline)', async () => {
    paymentGatewayService.createGatewayBill.mockResolvedValue({
      id: 901,
      status: 'canceled',
      charges: [{ id: 2, status: 'rejected' }],
    });

    await expect(useCase.createPublicCheckout(cardDto)).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentGatewayService.cancelGatewayBillById).toHaveBeenCalledWith(901);
    expect(createClientAppointmentService.createClientAppointment).not.toHaveBeenCalled();
    expect(paymentRepository.createPayment).not.toHaveBeenCalled();
  });

  it('voids the bill when appointment creation conflicts', async () => {
    createClientAppointmentService.createClientAppointment.mockRejectedValue(
      new BadRequestException('Appointment time is no longer available'),
    );

    await expect(useCase.createPublicCheckout(cardDto)).rejects.toThrow();

    expect(paymentGatewayService.cancelGatewayBillById).toHaveBeenCalledWith(900);
    expect(paymentRepository.createPayment).not.toHaveBeenCalled();
  });

  it('rejects when the client email is unknown', async () => {
    clientAuthRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.createPublicCheckout(cardDto)).rejects.toBeInstanceOf(BadRequestException);

    expect(paymentGatewayService.createGatewayBill).not.toHaveBeenCalled();
  });
});
