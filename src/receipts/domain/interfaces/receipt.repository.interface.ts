export interface ReceiptResponse {
  id: number;
  uuid: string;
  fileUrl: string;
  paymentId: number;
  createdAt: Date;
}

export interface CreateReceiptData {
  paymentId: number;
  fileUrl: string;
}

export interface IReceiptRepository {
  createReceipt(data: CreateReceiptData): Promise<ReceiptResponse>;
  findReceiptByPaymentId(paymentId: number): Promise<ReceiptResponse | null>;
}
