import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ApproveClientUseCase } from './application/use-cases/client/approve-client.use-case.js';
import { GetClientUseCase } from './application/use-cases/client/get-client.use-case.js';
import { ListClientsUseCase } from './application/use-cases/client/list-clients.use-case.js';
import { RejectClientUseCase } from './application/use-cases/client/reject-client.use-case.js';
import { ClientsController } from './clients.controller.js';
import { CLIENT_MGMT_REPOSITORY } from './domain/interfaces/client-management.repository.interface.js';
import { PrismaClientManagementRepository } from './infrastructure/repositories/prisma-client-management.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [ClientsController],
  providers: [
    { provide: CLIENT_MGMT_REPOSITORY, useClass: PrismaClientManagementRepository },
    ListClientsUseCase,
    GetClientUseCase,
    ApproveClientUseCase,
    RejectClientUseCase,
  ],
})
export class ClientsModule {}
