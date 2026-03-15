import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APPOINTMENT_REPOSITORY } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type { IAppointmentRepository } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import { CLIENT_REPOSITORY } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../../../../auth/domain/interfaces/client.repository.interface.js';
import { CARD_REPOSITORY } from '../../../../cards/domain/interfaces/card.repository.interface.js';
import type { ICardRepository } from '../../../../cards/domain/interfaces/card.repository.interface.js';
import { PAYMENT_GATEWAY_SERVICE } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import type { IPaymentGatewayService } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import { PAYMENT_PRICING_SERVICE } from '../../../domain/services/payment-pricing.service.interface.js';
import type { IPaymentPricingService } from '../../../domain/services/payment-pricing.service.interface.js';
import { PAYMENT_REPOSITORY } from '../../../domain/interfaces/payment.repository.interface.js';
import type {
  CreatePaymentData,
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import { mapPaymentMethodToVindi } from '../../mappers/payment-method.mapper.js';
import type { CreatePaymentDto } from '../../../dto/payment/create-payment.dto.js';

@Injectable()
export class CreateClientPaymentUseCase {
  private readonly logger = new Logger(CreateClientPaymentUseCase.name);
  private readonly vindiProductId: number;

  constructor(
    @Inject(PAYMENT_REPOSITORY) private paymentRepository: IPaymentRepository,
    @Inject(APPOINTMENT_REPOSITORY) private appointmentRepository: IAppointmentRepository,
    @Inject(CARD_REPOSITORY) private cardRepository: ICardRepository,
    @Inject(PAYMENT_GATEWAY_SERVICE) private paymentGatewayService: IPaymentGatewayService,
    @Inject(PAYMENT_PRICING_SERVICE) private pricingService: IPaymentPricingService,
    @Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository,
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

    if ((dto.method === 'CREDIT_CARD' || dto.method === 'DEBIT_CARD') && !dto.cardId) {
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
    );

    const serviceFee = 0;
    const amount = subtotal - discount + serviceFee;

    const vindiCustomerId = await this.ensureVindiCustomerExists(clientId);

    const vindiBill = await this.paymentGatewayService.createGatewayBill({
      gatewayCustomerId: vindiCustomerId,
      paymentMethodCode: mapPaymentMethodToVindi(dto.method),
      amount,
      productId: this.vindiProductId,
    });

    const gatewayResponseFields = vindiBill.charges[0]?.last_transaction?.gateway_response_fields;
    const pixCode = gatewayResponseFields?.pix_code ?? null;
    const pixQrCodeUrl = gatewayResponseFields?.qr_code_url ?? null;

    const paymentData: CreatePaymentData = {
      amount,
      subtotal,
      serviceFee,
      discount,
      method: dto.method,
      gatewayTransactionId: String(vindiBill.id),
      clientId,
      appointmentId: dto.appointmentId,
      ...(dto.cardId ? { cardId: dto.cardId } : {}),
      ...(pixCode ? { pixCode } : {}),
      ...(pixQrCodeUrl ? { pixQrCodeUrl } : {}),
    };

    return this.paymentRepository.createPayment(paymentData);
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
