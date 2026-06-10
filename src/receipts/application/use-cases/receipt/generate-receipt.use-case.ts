import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IReceiptGenerator } from '../../../domain/interfaces/receipt-generator.interface.js';
import type { IReceiptGenerationService } from '../../../domain/interfaces/receipt-generation.service.interface.js';
import type {
  IReceiptRepository,
  ReceiptResponse,
} from '../../../domain/interfaces/receipt.repository.interface.js';

@Injectable()
export class GenerateReceiptUseCase implements IReceiptGenerationService {
  private readonly logger = new Logger(GenerateReceiptUseCase.name);

  constructor(
    @Inject(DiTokens.receiptRepository) private receiptRepository: IReceiptRepository,
    @Inject(DiTokens.receiptGenerator) private receiptGenerator: IReceiptGenerator,
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
  ) {}

  async generateReceiptForPayment(paymentId: number): Promise<ReceiptResponse> {
    const existing = await this.receiptRepository.findReceiptByPaymentId(paymentId);
    if (existing) {
      this.logger.log(`Receipt already exists for payment ${paymentId}`);
      return existing;
    }

    const payment = await this.paymentRepository.findPaymentById(paymentId);
    if (!payment) {
      throw new Error(`Payment ${paymentId} not found for receipt generation`);
    }

    const fileUrl = await this.receiptGenerator.generateReceiptPdf(payment);

    try {
      return await this.receiptRepository.createReceipt({ paymentId, fileUrl });
    } catch (error) {
      const duplicateReceipt =
        error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002';

      if (!duplicateReceipt) {
        throw error;
      }

      await unlink(fileUrl).catch((err) =>
        this.logger.warn(`Failed to remove duplicate receipt PDF ${fileUrl}`, err),
      );

      const winner = await this.receiptRepository.findReceiptByPaymentId(paymentId);
      if (winner) {
        return winner;
      }

      throw error;
    }
  }
}
