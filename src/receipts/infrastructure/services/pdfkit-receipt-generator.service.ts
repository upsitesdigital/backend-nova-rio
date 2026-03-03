import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import PDFDocument from 'pdfkit';
import type { PaymentResponse } from '../../../payments/domain/interfaces/payment.repository.interface.js';
import type { IReceiptGenerator } from '../../domain/interfaces/receipt-generator.interface.js';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'receipts');

@Injectable()
export class PdfkitReceiptGeneratorService implements IReceiptGenerator {
  private readonly logger = new Logger(PdfkitReceiptGeneratorService.name);

  async generateReceiptPdf(payment: PaymentResponse): Promise<string> {
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const filename = `receipt-${payment.id}-${Date.now()}.pdf`;
    const filePath = join(UPLOADS_DIR, filename);
    const relativeUrl = `receipts/${filename}`;

    await this.buildPdf(payment, filePath);

    this.logger.log(`Receipt PDF generated: ${relativeUrl}`);
    return relativeUrl;
  }

  private buildPdf(payment: PaymentResponse, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = createWriteStream(filePath);

      stream.on('finish', resolve);
      stream.on('error', reject);
      doc.pipe(stream);

      this.renderHeader(doc);
      this.renderReceiptInfo(doc, payment);
      this.renderClientInfo(doc, payment);
      this.renderServiceInfo(doc, payment);
      this.renderBreakdown(doc, payment);
      this.renderPaymentMethod(doc, payment);
      this.renderFooter(doc);

      doc.end();
    });
  }

  private renderHeader(doc: PDFKit.PDFDocument): void {
    doc.fontSize(22).font('Helvetica-Bold').text('NOVA RIO', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').text('RECIBO DE PAGAMENTO', { align: 'center' });
    doc.moveDown(1);
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown(1);
  }

  private renderReceiptInfo(doc: PDFKit.PDFDocument, payment: PaymentResponse): void {
    const paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date();
    const formattedDate = paidAt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    doc.fontSize(10).font('Helvetica');
    doc.text(`Recibo N.: ${payment.id}`, { continued: true });
    doc.text(`Data: ${formattedDate}`, { align: 'right' });
    doc.text(`ID: ${payment.uuid}`);
    doc.moveDown(1);
  }

  private renderClientInfo(doc: PDFKit.PDFDocument, payment: PaymentResponse): void {
    doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO CLIENTE');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${payment.client.name}`);
    doc.text(`E-mail: ${payment.client.email}`);

    if (payment.client.cpfCnpj) {
      doc.text(`CPF/CNPJ: ${payment.client.cpfCnpj}`);
    }

    doc.moveDown(1);
  }

  private renderServiceInfo(doc: PDFKit.PDFDocument, payment: PaymentResponse): void {
    const appointmentDate = new Date(payment.appointment.date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO SERVICO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Servico: ${payment.appointment.service.name}`);
    doc.text(`Data: ${appointmentDate}`);
    doc.text(`Horario: ${payment.appointment.startTime}`);
    doc.moveDown(1);
  }

  private renderBreakdown(doc: PDFKit.PDFDocument, payment: PaymentResponse): void {
    const formatCurrency = (value: unknown): string => {
      const num = Number(value);
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    doc.fontSize(12).font('Helvetica-Bold').text('DETALHAMENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Subtotal: ${formatCurrency(payment.subtotal)}`);
    doc.text(`Taxa de servico: ${formatCurrency(payment.serviceFee)}`);
    doc.text(`Desconto: ${formatCurrency(payment.discount)}`);
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`TOTAL: ${formatCurrency(payment.amount)}`);
    doc.moveDown(1);
  }

  private renderPaymentMethod(doc: PDFKit.PDFDocument, payment: PaymentResponse): void {
    doc.fontSize(12).font('Helvetica-Bold').text('FORMA DE PAGAMENTO');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');

    if (payment.method === 'PIX') {
      doc.text('Metodo: PIX');
    } else if (payment.card) {
      doc.text(`Metodo: ${payment.card.brand} **** ${payment.card.lastFourDigits}`);
    } else {
      doc.text(`Metodo: ${payment.method}`);
    }

    if (payment.gatewayTransactionId) {
      doc.text(`ID da transacao: ${payment.gatewayTransactionId}`);
    }

    doc.moveDown(1);
  }

  private renderFooter(doc: PDFKit.PDFDocument): void {
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();
    doc.moveDown(1);
    doc.fontSize(8).font('Helvetica').text('Nova Rio - Servicos de Limpeza', { align: 'center' });
    doc.text('Este documento serve como comprovante de pagamento.', { align: 'center' });
  }
}
