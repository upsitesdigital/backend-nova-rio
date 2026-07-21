import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type {
  IClientAuthRepository,
  IClientProfileRepository,
} from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IPaymentGatewayService } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import type { IPaymentPricingService } from '../../../domain/services/payment-pricing.service.interface.js';
import type {
  CreatePaymentData,
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import { PaymentMethod } from '@prisma/client';
import { PaymentMethodMapper } from '../../mappers/payment-method.mapper.js';
import type { CreatePublicPaymentDto } from '../../../dto/payment/create-public-payment.dto.js';

@Injectable()
export class CreatePublicPaymentUseCase {
  private readonly logger = new Logger(CreatePublicPaymentUseCase.name);
  private readonly vindiProductId: number;

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.appointmentRepository) private appointmentRepository: IAppointmentRepository,
    @Inject(DiTokens.paymentGatewayService) private paymentGatewayService: IPaymentGatewayService,
    @Inject(DiTokens.paymentPricingService) private pricingService: IPaymentPricingService,
    @Inject(DiTokens.clientProfileRepository)
    private clientProfileRepository: IClientProfileRepository,
    @Inject(DiTokens.clientAuthRepository) private clientAuthRepository: IClientAuthRepository,
    configService: ConfigService,
  ) {
    this.vindiProductId = Number(configService.getOrThrow<string>('VINDI_PRODUCT_ID'));
  }

  async createPublicPayment(dto: CreatePublicPaymentDto): Promise<PaymentResponse> {
    const client = await this.clientAuthRepository.findByEmail(dto.email);

    if (!client) {
      throw new NotFoundException('Client not found. Please create an account first.');
    }

    const appointment = await this.appointmentRepository.findAppointmentByIdAndClientId(
      dto.appointmentId,
      client.id,
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
      clientId: client.id,
      appointmentId: dto.appointmentId,
    };

    const payment = await this.paymentRepository.createPayment(paymentData);

    try {
      const vindiCustomerId = await this.ensureVindiCustomerExists(client.id);

      let paymentProfileId: number | undefined;

      if (dto.cardNumber && dto.cardCvv && dto.cardExpiry && dto.holderName) {
        const expiryParts = dto.cardExpiry.split('/');
        const cardExpiration = `${expiryParts[0].padStart(2, '0')}/${expiryParts[1]}`;

        if (dto.cardNumber.length < 13) {
          throw new BadRequestException('Invalid card number');
        }

        const paymentProfile = await this.paymentGatewayService.createGatewayPaymentProfile({
          gatewayCustomerId: vindiCustomerId,
          holderName: dto.holderName,
          cardExpiration,
          cardNumber: dto.cardNumber,
          cardCvv: dto.cardCvv,
          paymentMethodCode: this.resolveVindiPaymentMethod(dto.method),
        });

        paymentProfileId = paymentProfile.id;
      }

      const vindiBill = await this.paymentGatewayService.createGatewayBill({
        gatewayCustomerId: vindiCustomerId,
        paymentMethodCode: PaymentMethodMapper.toVindi(dto.method),
        amount,
        productId: this.vindiProductId,
        ...(paymentProfileId ? { paymentProfileId } : {}),
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

  private resolveVindiPaymentMethod(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return 'credit_card';
      case PaymentMethod.DEBIT_CARD:
        return 'debit_card';
      default:
        return 'credit_card';
    }
  }

  private async ensureVindiCustomerExists(clientId: number): Promise<number> {
    const client = await this.clientProfileRepository.findClientForPayment(clientId);

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

    await this.clientProfileRepository.updateVindiCustomerId(clientId, vindiCustomer.id);

    this.logger.log(`Created Vindi customer ${vindiCustomer.id} for client ${clientId}`);

    return vindiCustomer.id;
  }
}
