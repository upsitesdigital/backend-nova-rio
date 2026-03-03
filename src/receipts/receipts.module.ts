import { Module, forwardRef } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module.js';
import { GenerateReceiptUseCase } from './application/use-cases/receipt/generate-receipt.use-case.js';
import { GetClientReceiptUseCase } from './application/use-cases/receipt/get-client-receipt.use-case.js';
import { GetReceiptUseCase } from './application/use-cases/receipt/get-receipt.use-case.js';
import { RECEIPT_GENERATOR } from './domain/interfaces/receipt-generator.interface.js';
import { RECEIPT_REPOSITORY } from './domain/interfaces/receipt.repository.interface.js';
import { PrismaReceiptRepository } from './infrastructure/repositories/prisma-receipt.repository.js';
import { PdfkitReceiptGeneratorService } from './infrastructure/services/pdfkit-receipt-generator.service.js';
import { ReceiptsController } from './receipts.controller.js';

@Module({
  imports: [forwardRef(() => PaymentsModule)],
  controllers: [ReceiptsController],
  providers: [
    { provide: RECEIPT_REPOSITORY, useClass: PrismaReceiptRepository },
    { provide: RECEIPT_GENERATOR, useClass: PdfkitReceiptGeneratorService },
    GenerateReceiptUseCase,
    GetReceiptUseCase,
    GetClientReceiptUseCase,
  ],
  exports: [GenerateReceiptUseCase],
})
export class ReceiptsModule {}
