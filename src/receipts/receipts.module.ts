import { DiTokens } from '../shared/di/di-tokens.js';
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { GenerateReceiptUseCase } from './application/use-cases/receipt/generate-receipt.use-case.js';
import { GetClientReceiptUseCase } from './application/use-cases/receipt/get-client-receipt.use-case.js';
import { GetReceiptUseCase } from './application/use-cases/receipt/get-receipt.use-case.js';
import { PrismaReceiptRepository } from './infrastructure/repositories/prisma-receipt.repository.js';
import { PdfkitReceiptGeneratorService } from './infrastructure/services/pdfkit-receipt-generator.service.js';
import { ReceiptsController } from './receipts.controller.js';

@Module({
  imports: [AuthModule, forwardRef(() => PaymentsModule)],
  controllers: [ReceiptsController],
  providers: [
    { provide: DiTokens.receiptRepository, useClass: PrismaReceiptRepository },
    { provide: DiTokens.receiptGenerator, useClass: PdfkitReceiptGeneratorService },
    GenerateReceiptUseCase,
    { provide: DiTokens.receiptGenerationService, useExisting: GenerateReceiptUseCase },
    GetReceiptUseCase,
    GetClientReceiptUseCase,
  ],
  exports: [DiTokens.receiptGenerationService],
})
export class ReceiptsModule {}
