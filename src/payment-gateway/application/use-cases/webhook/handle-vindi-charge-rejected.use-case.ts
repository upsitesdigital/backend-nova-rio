import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import type { IPaymentGatewayService } from '../../../domain/interfaces/payment-gateway.service.interface.js';
import type { IPaymentRepository } from '../../../../payments/domain/interfaces/payment.repository.interface.js';
import { HandleVindiBillCancelledUseCase } from './handle-vindi-bill-cancelled.use-case.js';

const maxChargeAttempts = 3;

@Injectable()
export class HandleVindiChargeRejectedUseCase {
  private readonly logger = new Logger(HandleVindiChargeRejectedUseCase.name);

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.paymentGatewayService) private paymentGatewayService: IPaymentGatewayService,
    private readonly handleBillCancelled: HandleVindiBillCancelledUseCase,
  ) {}

  async handleChargeRejected(billId: number, reason: string): Promise<void> {
    const payment = await this.paymentRepository.findPaymentByGatewayTransactionId(String(billId));

    if (!payment) {
      this.logger.warn(`No payment found for Vindi bill ${billId}`);
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      this.logger.log(`Payment ${payment.id} already ${payment.status}, skipping`);
      return;
    }

    const attempts = await this.paymentRepository.incrementChargeAttempts(payment.id);

    if (attempts < maxChargeAttempts) {
      this.logger.log(
        `Payment ${payment.id} charge rejected (${attempts}/${maxChargeAttempts}): ${reason}`,
      );
      return;
    }

    // Attempt limit reached: kill the bill at the gateway, otherwise Vindi keeps
    // retrying the charge and emailing the client indefinitely.
    await this.cancelGatewayBill(billId);

    await this.handleBillCancelled.handleBillCancelled(
      billId,
      `${reason} (${attempts} tentativas de cobranca)`,
    );
  }

  private async cancelGatewayBill(billId: number): Promise<void> {
    try {
      await this.paymentGatewayService.cancelGatewayBillById(billId);
    } catch (err) {
      // The bill may already be cancelled or expired on Vindi's side. Log it and still
      // settle our own records, so the payment never stays stuck as PENDING.
      this.logger.error(`Failed to cancel Vindi bill ${billId} after attempt limit`, err);
    }
  }
}
