import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { GenerateReceiptUseCase } from './application/use-cases/receipt/generate-receipt.use-case.js';
import { GetClientReceiptUseCase } from './application/use-cases/receipt/get-client-receipt.use-case.js';
import { GetReceiptUseCase } from './application/use-cases/receipt/get-receipt.use-case.js';
import { RECEIPT_GENERATION_SERVICE } from './domain/interfaces/receipt-generation.service.interface.js';
import { RECEIPT_GENERATOR } from './domain/interfaces/receipt-generator.interface.js';
import { RECEIPT_REPOSITORY } from './domain/interfaces/receipt.repository.interface.js';
import { PrismaReceiptRepository } from './infrastructure/repositories/prisma-receipt.repository.js';
import { PdfkitReceiptGeneratorService } from './infrastructure/services/pdfkit-receipt-generator.service.js';
import { ReceiptsController } from './receipts.controller.js';

@Module({
  imports: [AuthModule, forwardRef(() => PaymentsModule)],
  controllers: [ReceiptsController],
  providers: [
    { provide: RECEIPT_REPOSITORY, useClass: PrismaReceiptRepository },
    { provide: RECEIPT_GENERATOR, useClass: PdfkitReceiptGeneratorService },
    GenerateReceiptUseCase,
    { provide: RECEIPT_GENERATION_SERVICE, useExisting: GenerateReceiptUseCase },
    GetReceiptUseCase,
    GetClientReceiptUseCase,
  ],
  exports: [RECEIPT_GENERATION_SERVICE],
})
export class ReceiptsModule {}
