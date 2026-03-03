// ============================================================
// Vindi API — Request types
// ============================================================

export interface CreateVindiCustomerData {
  name: string;
  email: string;
  registry_code?: string; // CPF/CNPJ
  phones?: { phone_type: string; number: string }[];
}

export interface CreateVindiPaymentProfileData {
  customer_id: number;
  holder_name: string;
  card_expiration: string; // MM/YYYY
  card_number: string;
  card_cvv: string;
  payment_method_code: string; // 'credit_card' | 'debit_card'
  payment_company_code?: string; // 'visa', 'mastercard', etc.
}

export interface CreateVindiBillData {
  customer_id: number;
  payment_method_code: string; // 'credit_card' | 'debit_card' | 'pix'
  bill_items: VindiBillItem[];
  payment_profile?: { id: number };
}

export interface VindiBillItem {
  product_id: number;
  amount: number;
}

// ============================================================
// Vindi API — Response types
// ============================================================

export interface VindiCustomer {
  id: number;
  name: string;
  email: string;
  registry_code: string | null;
  status: string;
}

export interface VindiPaymentProfile {
  id: number;
  status: string;
  holder_name: string;
  card_number_last_four: string;
  payment_method: { code: string };
  payment_company: { code: string } | null;
}

export interface VindiBillCharge {
  id: number;
  status: string;
  amount: string;
  last_transaction: {
    gateway_response_fields: {
      pix_code?: string;
      qr_code_url?: string;
    } | null;
  } | null;
}

export interface VindiBill {
  id: number;
  status: string;
  amount: string;
  charges: VindiBillCharge[];
}

// ============================================================
// Vindi API — Webhook types
// ============================================================

export interface VindiWebhookBillData {
  bill: {
    id: number;
    status: string;
    amount: string;
    charges: VindiBillCharge[];
    customer: { id: number };
  };
}

export interface VindiWebhookChargeData {
  charge: {
    id: number;
    status: string;
    amount: string;
    bill: { id: number };
    last_transaction: {
      gateway_message: string;
    } | null;
  };
}

export interface VindiWebhookPayload {
  event: {
    type: string;
    data: VindiWebhookBillData | VindiWebhookChargeData;
  };
}
