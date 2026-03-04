import type { PaymentMethod, PaymentStatus, Prisma, RecurrenceType } from '@prisma/client';
import type { PaginatedResponse } from '../../../shared/types/paginated-response.type.js';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentResponse {
  id: number;
  uuid: string;
  amount: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  serviceFee: Prisma.Decimal;
  discount: Prisma.Decimal;
  method: PaymentMethod;
  status: PaymentStatus;
  cancellationReason: string | null;
  gatewayTransactionId: string | null;
  pixCode: string | null;
  pixQrCodeUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client: { id: number; name: string; email: string; cpfCnpj: string | null };
  appointment: {
    id: number;
    date: Date;
    startTime: string;
    service: { id: number; name: string };
    recurrenceType: RecurrenceType;
  };
  card: { id: number; lastFourDigits: string; brand: string } | null;
}

export type PaginatedPayments = PaginatedResponse<PaymentResponse>;

export interface CreatePaymentData {
  amount: number;
  subtotal: number;
  serviceFee: number;
  discount: number;
  method: PaymentMethod;
  pixCode?: string;
  pixQrCodeUrl?: string;
  gatewayTransactionId?: string;
  clientId: number;
  appointmentId: number;
  cardId?: number;
}

export interface ListPaymentsFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  clientId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
}

export interface IPaymentRepository {
  createPayment(data: CreatePaymentData): Promise<PaymentResponse>;
  listPayments(filters: ListPaymentsFilters): Promise<PaginatedPayments>;
  listPaymentsByClientId(
    clientId: number,
    page: number,
    limit: number,
    status?: PaymentStatus,
  ): Promise<PaginatedPayments>;
  findPaymentById(id: number): Promise<PaymentResponse | null>;
  findPaymentByIdAndClientId(id: number, clientId: number): Promise<PaymentResponse | null>;
  findPaymentByGatewayTransactionId(transactionId: string): Promise<PaymentResponse | null>;
  approvePaymentById(id: number): Promise<PaymentResponse>;
  cancelPaymentById(id: number, reason: string): Promise<PaymentResponse>;
  deletePaymentById(id: number): Promise<void>;
}
