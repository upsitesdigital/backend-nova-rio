import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { APPOINTMENT_REPOSITORY } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import { CARD_REPOSITORY } from '../../../../cards/domain/interfaces/card.repository.interface.js';
import { PAYMENT_GATEWAY_SERVICE } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import { PrismaService } from '../../../../shared/prisma/prisma.service.js';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import { CreateClientPaymentUseCase } from './create-client-payment.use-case.js';

describe('CreateClientPaymentUseCase', () => {
  let useCase: CreateClientPaymentUseCase;
  let paymentRepository: { createPayment: Mock };
  let appointmentRepository: { findAppointmentByIdAndClientId: Mock };
  let cardRepository: { findCardByIdAndClientId: Mock };
  let paymentGatewayService: {
    createGatewayCustomer: Mock;
    createGatewayBill: Mock;
  };
  let prisma: {
    service: { findUnique: Mock };
    package: { findUnique: Mock };
    client: { findUnique: Mock; update: Mock };
  };

  const scheduledAppointment = {
    id: 1,
    status: 'SCHEDULED',
    recurrenceType: 'SINGLE',
    service: { id: 1, name: 'Faxina Regular' },
    package: null,
    client: { id: 1, name: 'João', email: 'joao@test.com' },
  };

  const clientRecord = {
    id: 1,
    name: 'João',
    email: 'joao@test.com',
    cpfCnpj: '12345678900',
    phone: '11999999999',
    vindiCustomerId: null,
  };

  const vindiBill = {
    id: 100,
    status: 'pending',
    amount: '200.00',
    charges: [
      {
        id: 1,
        status: 'pending',
        amount: '200.00',
        last_transaction: {
          gateway_response_fields: {
            pix_code: 'pix-code-from-vindi',
            qr_code_url: 'https://vindi.com/qr/abc123',
          },
        },
      },
    ],
  };

  const createdPayment = {
    id: 1,
    amount: 200,
    subtotal: 200,
    serviceFee: 0,
    discount: 0,
    method: 'PIX',
    status: 'PENDING',
    gatewayTransactionId: '100',
    pixCode: 'pix-code-from-vindi',
    pixQrCodeUrl: 'https://vindi.com/qr/abc123',
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
    paymentRepository = { createPayment: vi.fn() };
    appointmentRepository = { findAppointmentByIdAndClientId: vi.fn() };
    cardRepository = { findCardByIdAndClientId: vi.fn() };
    paymentGatewayService = {
      createGatewayCustomer: vi.fn().mockResolvedValue({ id: 50 }),
      createGatewayBill: vi.fn().mockResolvedValue(vindiBill),
    };
    prisma = {
      service: { findUnique: vi.fn() },
      package: { findUnique: vi.fn() },
      client: {
        findUnique: vi.fn().mockResolvedValue(clientRecord),
        update: vi.fn().mockResolvedValue({ ...clientRecord, vindiCustomerId: 50 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClientPaymentUseCase,
        { provide: PAYMENT_REPOSITORY, useValue: paymentRepository },
        { provide: APPOINTMENT_REPOSITORY, useValue: appointmentRepository },
        { provide: CARD_REPOSITORY, useValue: cardRepository },
        { provide: PAYMENT_GATEWAY_SERVICE, useValue: paymentGatewayService },
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn().mockReturnValue('1'),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateClientPaymentUseCase>(CreateClientPaymentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when appointment not found', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(null);

    await expect(
      useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when appointment not SCHEDULED', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...scheduledAppointment,
      status: 'COMPLETED',
    });

    await expect(
      useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when card payment without cardId', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(scheduledAppointment);

    await expect(
      useCase.createClientPayment(1, { appointmentId: 1, method: 'CREDIT_CARD' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when card not found', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(scheduledAppointment);
    cardRepository.findCardByIdAndClientId.mockResolvedValue(null);

    await expect(
      useCase.createClientPayment(1, { appointmentId: 1, method: 'CREDIT_CARD', cardId: 99 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create PIX payment via Vindi gateway', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(scheduledAppointment);
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });
    paymentRepository.createPayment.mockResolvedValue(createdPayment);

    const result = await useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' });

    expect(result).toEqual(createdPayment);
    expect(paymentGatewayService.createGatewayCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'João', email: 'joao@test.com' }),
    );
    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethodCode: 'pix',
        amount: 200,
        productId: 1,
      }),
    );
    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 200,
        gatewayTransactionId: '100',
        pixCode: 'pix-code-from-vindi',
        pixQrCodeUrl: 'https://vindi.com/qr/abc123',
      }),
    );
  });

  it('should reuse existing vindiCustomerId if client already has one', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue(scheduledAppointment);
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });
    prisma.client.findUnique.mockResolvedValue({ ...clientRecord, vindiCustomerId: 42 });
    paymentRepository.createPayment.mockResolvedValue(createdPayment);

    await useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' });

    expect(paymentGatewayService.createGatewayCustomer).not.toHaveBeenCalled();
    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledWith(
      expect.objectContaining({ gatewayCustomerId: 42 }),
    );
  });

  it('should apply 10% discount for WEEKLY recurrence', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...scheduledAppointment,
      recurrenceType: 'WEEKLY',
    });
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });
    paymentRepository.createPayment.mockResolvedValue(createdPayment);

    await useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' });

    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 180 }),
    );
    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 180,
        subtotal: 200,
        discount: 20,
      }),
    );
  });

  it('should apply 5% discount for MONTHLY recurrence', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...scheduledAppointment,
      recurrenceType: 'MONTHLY',
    });
    prisma.service.findUnique.mockResolvedValue({ basePrice: 200 });
    paymentRepository.createPayment.mockResolvedValue(createdPayment);

    await useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' });

    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 190 }),
    );
    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 190,
        subtotal: 200,
        discount: 10,
      }),
    );
  });

  it('should use package price for PACKAGE recurrence', async () => {
    appointmentRepository.findAppointmentByIdAndClientId.mockResolvedValue({
      ...scheduledAppointment,
      recurrenceType: 'PACKAGE',
      package: { id: 1, name: 'Pacote 10h' },
    });
    prisma.package.findUnique.mockResolvedValue({ price: 500 });
    paymentRepository.createPayment.mockResolvedValue(createdPayment);

    await useCase.createClientPayment(1, { appointmentId: 1, method: 'PIX' });

    expect(paymentGatewayService.createGatewayBill).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500 }),
    );
    expect(paymentRepository.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500,
        subtotal: 500,
        discount: 0,
      }),
    );
  });
});
