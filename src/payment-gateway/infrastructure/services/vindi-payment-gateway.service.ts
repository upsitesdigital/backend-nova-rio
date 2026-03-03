import { Injectable } from '@nestjs/common';
import type {
  CreateGatewayBillData,
  CreateGatewayCustomerData,
  CreateGatewayPaymentProfileData,
  IPaymentGatewayService,
} from '../../domain/interfaces/payment-gateway.service.interface.js';
import type {
  CreateVindiBillData,
  CreateVindiCustomerData,
  CreateVindiPaymentProfileData,
  VindiBill,
  VindiCustomer,
  VindiPaymentProfile,
} from '../../domain/types/vindi.types.js';
import { VindiHttpClient } from '../clients/vindi-http.client.js';

@Injectable()
export class VindiPaymentGatewayService implements IPaymentGatewayService {
  constructor(private readonly vindiClient: VindiHttpClient) {}

  async createGatewayCustomer(data: CreateGatewayCustomerData): Promise<VindiCustomer> {
    const body: CreateVindiCustomerData = {
      name: data.name,
      email: data.email,
      ...(data.registryCode ? { registry_code: data.registryCode } : {}),
      ...(data.phone ? { phones: [{ phone_type: 'mobile', number: data.phone }] } : {}),
    };

    const response = await this.vindiClient.sendRequest<{ customer: VindiCustomer }>('/customers', {
      method: 'POST',
      body,
    });

    return response.customer;
  }

  async createGatewayPaymentProfile(
    data: CreateGatewayPaymentProfileData,
  ): Promise<VindiPaymentProfile> {
    const body: CreateVindiPaymentProfileData = {
      customer_id: data.gatewayCustomerId,
      holder_name: data.holderName,
      card_expiration: data.cardExpiration,
      card_number: data.cardNumber,
      card_cvv: data.cardCvv,
      payment_method_code: data.paymentMethodCode,
      ...(data.paymentCompanyCode ? { payment_company_code: data.paymentCompanyCode } : {}),
    };

    const response = await this.vindiClient.sendRequest<{
      payment_profile: VindiPaymentProfile;
    }>('/payment_profiles', { method: 'POST', body });

    return response.payment_profile;
  }

  async createGatewayBill(data: CreateGatewayBillData): Promise<VindiBill> {
    const body: CreateVindiBillData = {
      customer_id: data.gatewayCustomerId,
      payment_method_code: data.paymentMethodCode,
      bill_items: [
        {
          product_id: data.productId,
          amount: data.amount,
        },
      ],
      ...(data.paymentProfileId ? { payment_profile: { id: data.paymentProfileId } } : {}),
    };

    const response = await this.vindiClient.sendRequest<{ bill: VindiBill }>('/bills', {
      method: 'POST',
      body,
    });

    return response.bill;
  }

  async cancelGatewayBillById(billId: number): Promise<void> {
    await this.vindiClient.sendRequest<void>(`/bills/${billId}`, {
      method: 'DELETE',
    });
  }
}
