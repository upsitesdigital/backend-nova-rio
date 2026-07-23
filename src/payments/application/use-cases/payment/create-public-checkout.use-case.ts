import { DiTokens } from '../../../../shared/di/di-tokens.js';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, RecurrenceType } from '@prisma/client';
import type { ICreateClientAppointmentService } from '../../../../appointments/domain/interfaces/create-client-appointment.service.interface.js';
import { AppointmentSchedulingValidator } from '../../../../appointments/application/validators/appointment-scheduling.validator.js';
import type {
  IClientAuthRepository,
  IClientProfileRepository,
} from '../../../../auth/domain/interfaces/client.repository.interface.js';
import type { IPaymentGatewayService } from '../../../../payment-gateway/domain/interfaces/payment-gateway.service.interface.js';
import type { VindiBill } from '../../../../payment-gateway/domain/types/vindi.types.js';
import type { IPaymentPricingService } from '../../../domain/services/payment-pricing.service.interface.js';
import type { AppointmentResponse } from '../../../../appointments/domain/interfaces/appointment.repository.interface.js';
import type {
  CreatePaymentData,
  IPaymentRepository,
  PaymentResponse,
} from '../../../domain/interfaces/payment.repository.interface.js';
import { PaymentMethodMapper } from '../../mappers/payment-method.mapper.js';
import type { CreatePublicCheckoutDto } from '../../../dto/payment/create-public-checkout.dto.js';

const serviceFee = 3;
const rejectedChargeStatus = 'rejected';

@Injectable()
export class CreatePublicCheckoutUseCase {
  private readonly logger = new Logger(CreatePublicCheckoutUseCase.name);
  private readonly vindiProductId: number;

  constructor(
    @Inject(DiTokens.paymentRepository) private paymentRepository: IPaymentRepository,
    @Inject(DiTokens.paymentGatewayService) private paymentGatewayService: IPaymentGatewayService,
    @Inject(DiTokens.paymentPricingService) private pricingService: IPaymentPricingService,
    @Inject(DiTokens.clientAuthRepository) private clientAuthRepository: IClientAuthRepository,
    @Inject(DiTokens.clientProfileRepository)
    private clientProfileRepository: IClientProfileRepository,
    @Inject(DiTokens.createClientAppointmentService)
    private createClientAppointmentService: ICreateClientAppointmentService,
    private readonly schedulingValidator: AppointmentSchedulingValidator,
    configService: ConfigService,
  ) {
    this.vindiProductId = Number(configService.getOrThrow<string>('VINDI_PRODUCT_ID'));
  }

  async createPublicCheckout(dto: CreatePublicCheckoutDto): Promise<PaymentResponse> {
    const client = await this.clientAuthRepository.findByEmail(dto.email);

    if (!client) {
      throw new BadRequestException(
        'Unable to create appointment. Please verify your information.',
      );
    }

    const clientId = client.id;
    const date = new Date(dto.date);

    // Validate date/holiday before charging so we never bill an unschedulable slot.
    await this.schedulingValidator.validateSchedulingDate(date);

    const recurrenceType = dto.recurrenceType ?? RecurrenceType.SINGLE;
    const weeklyFrequency = dto.weeklyFrequency ?? 1;

    const { subtotal, discount } = await this.pricingService.calculatePricing(
      dto.serviceId,
      recurrenceType,
      dto.packageId ?? null,
      weeklyFrequency,
    );

    const amount = subtotal - discount + serviceFee;

    // 1) Charge the gateway FIRST. Nothing is persisted until it accepts —
    //    an invalid/declined method (PIX, debit) throws here and creates nothing.
    const bill = await this.chargeGateway(clientId, dto, amount);

    // 2) Gateway accepted → create the appointment (conflict-checked, sends email).
    let appointment: AppointmentResponse;
    try {
      appointment = await this.createClientAppointmentService.createClientAppointment(
        clientId,
        dto,
      );
    } catch (error) {
      await this.voidBill(bill.id);
      throw error;
    }

    // 3) Persist the payment linked to the just-created appointment.
    const gatewayResponseFields = bill.charges[0]?.last_transaction?.gateway_response_fields;
    const paymentData: CreatePaymentData = {
      amount,
      subtotal,
      serviceFee,
      discount,
      method: dto.method,
      clientId,
      appointmentId: appointment.id,
      gatewayTransactionId: String(bill.id),
      ...(gatewayResponseFields?.pix_code ? { pixCode: gatewayResponseFields.pix_code } : {}),
      ...(gatewayResponseFields?.qr_code_url
        ? { pixQrCodeUrl: gatewayResponseFields.qr_code_url }
        : {}),
    };

    try {
      return await this.paymentRepository.createPayment(paymentData);
    } catch (error) {
      await this.voidBill(bill.id);
      throw error;
    }
  }

  private async chargeGateway(
    clientId: number,
    dto: CreatePublicCheckoutDto,
    amount: number,
  ): Promise<VindiBill> {
    const vindiCustomerId = await this.ensureVindiCustomerExists(clientId);

    let paymentProfileId: number | undefined;

    if (
      dto.method !== PaymentMethod.PIX &&
      dto.cardNumber &&
      dto.cardCvv &&
      dto.cardExpiry &&
      dto.holderName
    ) {
      if (dto.cardNumber.length < 13) {
        throw new BadRequestException('Invalid card number');
      }

      const expiryParts = dto.cardExpiry.split('/');
      const expiryMonth = expiryParts[0].padStart(2, '0');
      const expiryYear = 2000 + parseInt(expiryParts[1], 10);
      const cardExpiration = `${expiryMonth}/${expiryYear}`;

      const paymentProfile = await this.paymentGatewayService.createGatewayPaymentProfile({
        gatewayCustomerId: vindiCustomerId,
        holderName: dto.holderName,
        cardExpiration,
        cardNumber: dto.cardNumber,
        cardCvv: dto.cardCvv,
        paymentMethodCode: PaymentMethodMapper.toVindi(dto.method),
      });

      paymentProfileId = paymentProfile.id;
    }

    const bill = await this.paymentGatewayService.createGatewayBill({
      gatewayCustomerId: vindiCustomerId,
      paymentMethodCode: PaymentMethodMapper.toVindi(dto.method),
      amount,
      productId: this.vindiProductId,
      ...(paymentProfileId ? { paymentProfileId } : {}),
    });

    // Card declines can return HTTP 2xx with a rejected charge — void and fail.
    if (bill.charges[0]?.status === rejectedChargeStatus) {
      await this.voidBill(bill.id);
      throw new BadRequestException('Payment was declined');
    }

    return bill;
  }

  private async voidBill(billId: number): Promise<void> {
    try {
      await this.paymentGatewayService.cancelGatewayBillById(billId);
    } catch (error) {
      this.logger.warn(`Failed to void gateway bill ${billId} during checkout rollback`, error);
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
