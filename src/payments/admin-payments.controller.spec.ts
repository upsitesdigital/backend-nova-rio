import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { AdminPaymentsController } from './admin-payments.controller.js';
import { ListPaymentsUseCase } from './application/use-cases/payment/list-payments.use-case.js';
import { GetPaymentUseCase } from './application/use-cases/payment/get-payment.use-case.js';
import { ApprovePaymentUseCase } from './application/use-cases/payment/approve-payment.use-case.js';
import { CancelPaymentUseCase } from './application/use-cases/payment/cancel-payment.use-case.js';

describe('AdminPaymentsController', () => {
  let controller: AdminPaymentsController;
  let listPaymentsUseCase: { listPayments: Mock };
  let getPaymentUseCase: { getPaymentById: Mock };
  let approvePaymentUseCase: { approvePaymentById: Mock };
  let cancelPaymentUseCase: { cancelPaymentById: Mock };

  beforeEach(async () => {
    listPaymentsUseCase = { listPayments: vi.fn() };
    getPaymentUseCase = { getPaymentById: vi.fn() };
    approvePaymentUseCase = { approvePaymentById: vi.fn() };
    cancelPaymentUseCase = { cancelPaymentById: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPaymentsController],
      providers: [
        { provide: ListPaymentsUseCase, useValue: listPaymentsUseCase },
        { provide: GetPaymentUseCase, useValue: getPaymentUseCase },
        { provide: ApprovePaymentUseCase, useValue: approvePaymentUseCase },
        { provide: CancelPaymentUseCase, useValue: cancelPaymentUseCase },
      ],
    }).compile();

    controller = module.get<AdminPaymentsController>(AdminPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listPayments should call listPaymentsUseCase', async () => {
    const query = { status: 'PENDING' as const, page: 1, limit: 10 };
    await controller.listPayments(query);
    expect(listPaymentsUseCase.listPayments).toHaveBeenCalledWith(query);
  });

  it('getPaymentById should call getPaymentUseCase', async () => {
    await controller.getPaymentById(1);
    expect(getPaymentUseCase.getPaymentById).toHaveBeenCalledWith(1);
  });

  it('approvePaymentById should call approvePaymentUseCase', async () => {
    await controller.approvePaymentById(1);
    expect(approvePaymentUseCase.approvePaymentById).toHaveBeenCalledWith(1);
  });

  it('cancelPaymentById should call cancelPaymentUseCase', async () => {
    await controller.cancelPaymentById(1);
    expect(cancelPaymentUseCase.cancelPaymentById).toHaveBeenCalledWith(1);
  });
});
