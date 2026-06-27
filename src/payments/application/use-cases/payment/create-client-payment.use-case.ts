import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type { IClientProfileRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { ICardRepository } from '../../../../cards/domain/interfaces/card.repository.interface.js';
import type { IPaymentGatewayService } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import type { IPaymentPricingService } from '../../../domain/services/payment-pricing.service.interface.js';
import type {
  CreatePaymentData,
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import { PaymentMethod } from '@prisma/client';
import { PaymentMethodMapper } from '../../mappers/payment-method.mapper.js';
import type { CreatePaymentDto } from '../../../dto/payment/create-payment.dto.js';

@Injectable()
export class CreateClientPaymentUseCase {
  private readonly logger = new Logger(CreateClientPaymentUseCase.name);
  private readonly vindiProductId: number;

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.cardRepository) private cardRepository: ICardRepository,
    @Inject(DiTokens.paymentGatewayService) private paymentGatewayService: IPaymentGatewayService,
    @Inject(DiTokens.paymentPricingService) private pricingService: IPaymentPricingService,
    @Inject(DiTokens.clientProfileRepository) private clientRepository: IClientProfileRepository,
    configService: ConfigService,
  ) {
    this.vindiProductId = Number(configService.getOrThrow<string>('VINDI_PRODUCT_ID'));
  }

  async createClientPayment(clientId: number, dto: CreatePaymentDto): Promise<PaymentResponse> {
    const appointment = await this.appointmentRepository.findAppointmentByIdAndClientId(
      dto.appointmentId,
      clientId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new BadRequestException('Only scheduled appointments can be paid');
    }

    const existingPayment = await this.paymentRepository.findPaymentByAppointmentId(
      dto.appointmentId,
    );
    if (existingPayment) {
      throw new BadRequestException('A payment already exists for this appointment');
    }

    if (
      (dto.method === PaymentMethod.CREDIT_CARD || dto.method === PaymentMethod.DEBIT_CARD) &&
      !dto.cardId
    ) {
      throw new BadRequestException('Card is required for card payments');
    }

    if (dto.cardId) {
      const card = await this.cardRepository.findCardByIdAndClientId(dto.cardId, clientId);
      if (!card) {
        throw new NotFoundException('Card not found');
      }
    }

    const { subtotal, discount } = await this.pricingService.calculatePricing(
      appointment.service.id,
      appointment.recurrenceType,
      appointment.package?.id ?? null,
      appointment.weeklyFrequency,
    );

    const serviceFee = 0;
    const amount = subtotal - discount + serviceFee;

    const paymentData: CreatePaymentData = {
      amount,
      subtotal,
      serviceFee,
      discount,
      method: dto.method,
      clientId,
      appointmentId: dto.appointmentId,
      ...(dto.cardId ? { cardId: dto.cardId } : {}),
    };

    const payment = await this.paymentRepository.createPayment(paymentData);

    try {
      const vindiCustomerId = await this.ensureVindiCustomerExists(clientId);

      const vindiBill = await this.paymentGatewayService.createGatewayBill({
        gatewayCustomerId: vindiCustomerId,
        paymentMethodCode: PaymentMethodMapper.toVindi(dto.method),
        amount,
        productId: this.vindiProductId,
      });

      const gatewayResponseFields = vindiBill.charges[0]?.last_transaction?.gateway_response_fields;
      const pixCode = gatewayResponseFields?.pix_code ?? undefined;
      const pixQrCodeUrl = gatewayResponseFields?.qr_code_url ?? undefined;

      return this.paymentRepository.updatePaymentGatewayDetails(payment.id, {
        gatewayTransactionId: String(vindiBill.id),
        ...(pixCode ? { pixCode } : {}),
        ...(pixQrCodeUrl ? { pixQrCodeUrl } : {}),
      });
    } catch (error) {
      const rolledBack = await this.paymentRepository.deletePendingPaymentReservation(payment.id);

      if (!rolledBack) {
        this.logger.warn(
          `Reserved payment ${payment.id} could not be rolled back after gateway error`,
        );
      }

      throw error;
    }
  }

  private async ensureVindiCustomerExists(clientId: number): Promise<number> {
    const client = await this.clientRepository.findClientForPayment(clientId);

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.vindiCustomerId) {
      return client.vindiCustomerId;
    }

    const vindiCustomer = await this.paymentGatewayService.createGatewayCustomer({
      name: client.name,
      email: client.email,
      ...(client.cpfCnpj ? { registryCode: client.cpfCnpj } : {}),
      ...(client.phone ? { phone: client.phone } : {}),
    });

    await this.clientRepository.updateVindiCustomerId(clientId, vindiCustomer.id);

    this.logger.log(`Created Vindi customer ${vindiCustomer.id} for client ${clientId}`);

    return vindiCustomer.id;
  }
}
