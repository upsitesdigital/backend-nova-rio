import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { VindiHttpClient } from '../clients/vindi-http.client.js';
import { VindiPaymentGatewayService } from './vindi-payment-gateway.service.js';

describe('VindiPaymentGatewayService', () => {
  let service: VindiPaymentGatewayService;
  let vindiClient: { sendRequest: Mock };

  beforeEach(async () => {
    vindiClient = { sendRequest: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VindiPaymentGatewayService, { provide: VindiHttpClient, useValue: vindiClient }],
    }).compile();

    service = module.get<VindiPaymentGatewayService>(VindiPaymentGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGatewayCustomer', () => {
    it('should create a customer via Vindi API', async () => {
      const customer = {
        id: 1,
        name: 'João',
        email: 'joao@test.com',
        registry_code: null,
        status: 'active',
      };
      vindiClient.sendRequest.mockResolvedValue({ customer });

      const result = await service.createGatewayCustomer({
        name: 'João',
        email: 'joao@test.com',
        registryCode: '12345678900',
      });

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/customers', {
        method: 'POST',
        body: {
          name: 'João',
          email: 'joao@test.com',
          registry_code: '12345678900',
        },
      });
      expect(result).toEqual(customer);
    });

    it('should omit optional fields when not provided', async () => {
      const customer = {
        id: 1,
        name: 'João',
        email: 'joao@test.com',
        registry_code: null,
        status: 'active',
      };
      vindiClient.sendRequest.mockResolvedValue({ customer });

      await service.createGatewayCustomer({ name: 'João', email: 'joao@test.com' });

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/customers', {
        method: 'POST',
        body: { name: 'João', email: 'joao@test.com' },
      });
    });
  });

  describe('createGatewayPaymentProfile', () => {
    it('should create a payment profile via Vindi API', async () => {
      const profile = {
        id: 10,
        status: 'active',
        holder_name: 'João Silva',
        card_number_last_four: '1234',
        payment_method: { code: 'credit_card' },
        payment_company: { code: 'visa' },
      };
      vindiClient.sendRequest.mockResolvedValue({ payment_profile: profile });

      const result = await service.createGatewayPaymentProfile({
        gatewayCustomerId: 1,
        holderName: 'João Silva',
        cardExpiration: '12/2028',
        cardNumber: '4111111111111111',
        cardCvv: '123',
        paymentMethodCode: 'credit_card',
        paymentCompanyCode: 'visa',
      });

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/payment_profiles', {
        method: 'POST',
        body: {
          customer_id: 1,
          holder_name: 'João Silva',
          card_expiration: '12/2028',
          card_number: '4111111111111111',
          card_cvv: '123',
          payment_method_code: 'credit_card',
          payment_company_code: 'visa',
        },
      });
      expect(result).toEqual(profile);
    });
  });

  describe('createGatewayBill', () => {
    it('should create a bill via Vindi API', async () => {
      const bill = {
        id: 100,
        status: 'pending',
        amount: '200.00',
        charges: [
          {
            id: 1,
            status: 'pending',
            amount: '200.00',
            last_transaction: {
              gateway_response_fields: { pix_code: 'pix-code-123' },
            },
          },
        ],
      };
      vindiClient.sendRequest.mockResolvedValue({ bill });

      const result = await service.createGatewayBill({
        gatewayCustomerId: 1,
        paymentMethodCode: 'pix',
        amount: 200,
        productId: 1,
      });

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/bills', {
        method: 'POST',
        body: {
          customer_id: 1,
          payment_method_code: 'pix',
          bill_items: [{ product_id: 1, amount: 200 }],
        },
      });
      expect(result).toEqual(bill);
    });

    it('should include payment_profile when paymentProfileId is provided', async () => {
      const bill = { id: 100, status: 'pending', amount: '200.00', charges: [] };
      vindiClient.sendRequest.mockResolvedValue({ bill });

      await service.createGatewayBill({
        gatewayCustomerId: 1,
        paymentMethodCode: 'credit_card',
        amount: 200,
        productId: 1,
        paymentProfileId: 10,
      });

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/bills', {
        method: 'POST',
        body: {
          customer_id: 1,
          payment_method_code: 'credit_card',
          bill_items: [{ product_id: 1, amount: 200 }],
          payment_profile: { id: 10 },
        },
      });
    });
  });

  describe('cancelGatewayBillById', () => {
    it('should delete a bill via Vindi API', async () => {
      vindiClient.sendRequest.mockResolvedValue(undefined);

      await service.cancelGatewayBillById(100);

      expect(vindiClient.sendRequest).toHaveBeenCalledWith('/bills/100', {
        method: 'DELETE',
      });
    });
  });
});
