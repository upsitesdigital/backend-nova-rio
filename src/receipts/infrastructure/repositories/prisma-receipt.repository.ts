import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service.js';
import type {
  CreateReceiptData,
  IReceiptRepository,
  ReceiptResponse,
} from '../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class PrismaReceiptRepository implements IReceiptRepository {
  constructor(private prisma: PrismaService) {}

  async createReceipt(data: CreateReceiptData): Promise<ReceiptResponse> {
    return this.prisma.receipt.create({
      data: {
        fileUrl: data.fileUrl,
        payment: { connect: { id: data.paymentId } },
      },
    });
  }

  async findReceiptByPaymentId(paymentId: number): Promise<ReceiptResponse | null> {
    return this.prisma.receipt.findUnique({
      where: { paymentId },
    });
  }
}
