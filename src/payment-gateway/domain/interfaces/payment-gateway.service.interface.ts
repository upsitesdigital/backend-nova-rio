import type { VindiBill, VindiCustomer, VindiPaymentProfile } from '../types/vindi.types.js';

export const PAYMENT_GATEWAY_SERVICE = Symbol('PAYMENT_GATEWAY_SERVICE');

export interface CreateGatewayCustomerData {
  name: string;
  email: string;
  registryCode?: string;
  phone?: string;
}

export interface CreateGatewayPaymentProfileData {
  gatewayCustomerId: number;
  holderName: string;
  cardExpiration: string;
  cardNumber: string;
  cardCvv: string;
  paymentMethodCode: string;
  paymentCompanyCode?: string;
}

export interface CreateGatewayBillData {
  gatewayCustomerId: number;
  paymentMethodCode: string;
  amount: number;
  productId: number;
  paymentProfileId?: number;
}

export interface IPaymentGatewayService {
  createGatewayCustomer(data: CreateGatewayCustomerData): Promise<VindiCustomer>;
  createGatewayPaymentProfile(data: CreateGatewayPaymentProfileData): Promise<VindiPaymentProfile>;
  createGatewayBill(data: CreateGatewayBillData): Promise<VindiBill>;
  cancelGatewayBillById(billId: number): Promise<void>;
}
