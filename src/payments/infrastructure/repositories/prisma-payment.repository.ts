import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CreatePaymentData,
  IPaymentRepository,
  ListPaymentsFilters,
  PaginatedPayments,
  PaymentResponse,
} from '../../domain/interfaces/payment.repository.interface.js';
import type { PaymentStatus } from '@prisma/client';

const PAYMENT_INCLUDE = {
  client: { select: { id: true, name: true, email: true, cpfCnpj: true } },
  appointment: {
    select: {
      id: true,
      date: true,
      startTime: true,
      service: { select: { id: true, name: true } },
      recurrenceType: true,
    },
  },
  card: { select: { id: true, lastFourDigits: true, brand: true } },
} as const;

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private prisma: PrismaService) {}

  async createPayment(data: CreatePaymentData): Promise<PaymentResponse> {
    try {
      return await this.prisma.payment.create({
        data: {
          amount: data.amount,
          subtotal: data.subtotal,
          serviceFee: data.serviceFee,
          discount: data.discount,
          method: data.method,
          pixCode: data.pixCode,
          pixQrCodeUrl: data.pixQrCodeUrl,
          gatewayTransactionId: data.gatewayTransactionId,
          client: { connect: { id: data.clientId } },
          appointment: { connect: { id: data.appointmentId } },
          ...(data.cardId ? { card: { connect: { id: data.cardId } } } : {}),
        },
        include: PAYMENT_INCLUDE,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === 'P2002'
      ) {
        throw new BadRequestException('A payment already exists for this appointment');
      }
      throw error;
    }
  }

  async updatePaymentGatewayDetails(
    id: number,
    data: Pick<CreatePaymentData, 'gatewayTransactionId' | 'pixCode' | 'pixQrCodeUrl'>,
  ): Promise<PaymentResponse> {
    return this.prisma.payment.update({
      where: { id },
      data: {
        gatewayTransactionId: data.gatewayTransactionId,
        pixCode: data.pixCode,
        pixQrCodeUrl: data.pixQrCodeUrl,
      },
      include: PAYMENT_INCLUDE,
    });
  }

  async listPayments(filters: ListPaymentsFilters): Promise<PaginatedPayments> {
    const where: Prisma.PaymentWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.method ? { method: filters.method } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: PAYMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: filters.limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit };
  }

  async listPaymentsByClientId(
    clientId: number,
    page: number,
    limit: number,
    status?: PaymentStatus,
  ): Promise<PaginatedPayments> {
    const where: Prisma.PaymentWhereInput = {
      clientId,
      ...(status ? { status } : {}),
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: PAYMENT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findPaymentByAppointmentId(appointmentId: number): Promise<PaymentResponse | null> {
    return this.prisma.payment.findFirst({
      where: { appointmentId },
      include: PAYMENT_INCLUDE,
    });
  }

  async findPaymentById(id: number): Promise<PaymentResponse | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: PAYMENT_INCLUDE,
    });
  }

  async findPaymentByIdAndClientId(id: number, clientId: number): Promise<PaymentResponse | null> {
    return this.prisma.payment.findFirst({
      where: { id, clientId },
      include: PAYMENT_INCLUDE,
    });
  }

  async findPaymentByGatewayTransactionId(transactionId: string): Promise<PaymentResponse | null> {
    return this.prisma.payment.findFirst({
      where: { gatewayTransactionId: transactionId },
      include: PAYMENT_INCLUDE,
    });
  }

  async approvePaymentById(id: number): Promise<PaymentResponse | null> {
    const updated = await this.prisma.payment.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'APPROVED', paidAt: new Date() },
    });

    if (updated.count !== 1) {
      return null;
    }

    return this.findPaymentById(id);
  }

  async cancelPaymentById(id: number, reason: string): Promise<PaymentResponse | null> {
    const updated = await this.prisma.payment.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'CANCELLED', cancellationReason: reason },
    });

    if (updated.count !== 1) {
      return null;
    }

    return this.findPaymentById(id);
  }

  async deletePaymentById(id: number): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: { status: 'CANCELLED', cancellationReason: 'Deleted by admin' },
    });
  }
}
