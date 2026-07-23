import { DiTokens } from '../shared/di/di-tokens.js';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import type { AuthUser } from '../shared/types/auth-user.type.js';
import { ClientPaymentsController } from './client-payments.controller.js';
import { CreateClientPaymentUseCase } from './application/use-cases/payment/create-client-payment.use-case.js';
import { CreatePublicCheckoutUseCase } from './application/use-cases/payment/create-public-checkout.use-case.js';
import { ListClientPaymentsUseCase } from './application/use-cases/payment/list-client-payments.use-case.js';
import { GetClientPaymentUseCase } from './application/use-cases/payment/get-client-payment.use-case.js';
import type { ListClientPaymentsQueryDto } from './dto/payment/list-client-payments-query.dto.js';

describe('ClientPaymentsController', () => {
  let controller: ClientPaymentsController;
  let createClientPaymentUseCase: { createClientPayment: Mock };
  let createPublicCheckoutUseCase: { createPublicCheckout: Mock };
  let listClientPaymentsUseCase: { listPaymentsByClientId: Mock };
  let getClientPaymentUseCase: { getPaymentByIdAndClientId: Mock };

  const clientUser: AuthUser = { id: 1, email: 'client@test.com', type: 'client' };

  beforeEach(async () => {
    createClientPaymentUseCase = { createClientPayment: vi.fn() };
    createPublicCheckoutUseCase = { createPublicCheckout: vi.fn() };
    listClientPaymentsUseCase = { listPaymentsByClientId: vi.fn() };
    getClientPaymentUseCase = { getPaymentByIdAndClientId: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientPaymentsController],
      providers: [
        { provide: CreateClientPaymentUseCase, useValue: createClientPaymentUseCase },
        { provide: CreatePublicCheckoutUseCase, useValue: createPublicCheckoutUseCase },
        { provide: ListClientPaymentsUseCase, useValue: listClientPaymentsUseCase },
        { provide: GetClientPaymentUseCase, useValue: getClientPaymentUseCase },
        { provide: DiTokens.clientAuthRepository, useValue: { findById: vi.fn() } },
      ],
    }).compile();

    controller = module.get<ClientPaymentsController>(ClientPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createClientPayment should call use case with user.id', async () => {
    const dto = { appointmentId: 1, method: 'PIX' as const };
    await controller.createClientPayment(clientUser, dto);
    expect(createClientPaymentUseCase.createClientPayment).toHaveBeenCalledWith(1, dto);
  });

  it('createPublicCheckout should delegate to the checkout use case', async () => {
    const dto = {
      email: 'client@test.com',
      date: '2026-03-15',
      startTime: '09:00',
      duration: 120,
      serviceId: 1,
      method: 'CREDIT_CARD' as const,
    };
    await controller.createPublicCheckout(dto);
    expect(createPublicCheckoutUseCase.createPublicCheckout).toHaveBeenCalledWith(dto);
  });

  it('listClientPayments should call use case with user.id and pagination', async () => {
    const query = { page: 1, limit: 20 } as ListClientPaymentsQueryDto;
    await controller.listClientPayments(clientUser, query);
    expect(listClientPaymentsUseCase.listPaymentsByClientId).toHaveBeenCalledWith(
      1,
      1,
      20,
      undefined,
    );
  });

  it('listClientPayments should clamp limit to 100', async () => {
    const query = { page: 1, limit: 200 } as ListClientPaymentsQueryDto;
    await controller.listClientPayments(clientUser, query);
    expect(listClientPaymentsUseCase.listPaymentsByClientId).toHaveBeenCalledWith(
      1,
      1,
      100,
      undefined,
    );
  });

  it('getClientPaymentById should call use case with id and user.id', async () => {
    await controller.getClientPaymentById(clientUser, 5);
    expect(getClientPaymentUseCase.getPaymentByIdAndClientId).toHaveBeenCalledWith(5, 1);
  });
});
