import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CreateAdminUserUseCase } from './application/use-cases/admin-user/create-admin-user.use-case.js';
import { DeleteAdminUserUseCase } from './application/use-cases/admin-user/delete-admin-user.use-case.js';
import { GetAdminUserUseCase } from './application/use-cases/admin-user/get-admin-user.use-case.js';
import { ListAdminUsersUseCase } from './application/use-cases/admin-user/list-admin-users.use-case.js';
import { AdminUsersController } from './admin-users.controller.js';
import { ADMIN_USER_REPOSITORY } from './domain/interfaces/admin-user.repository.interface.js';
import { PrismaAdminUserRepository } from './infrastructure/repositories/prisma-admin-user.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController],
  providers: [
    { provide: ADMIN_USER_REPOSITORY, useClass: PrismaAdminUserRepository },
    CreateAdminUserUseCase,
    ListAdminUsersUseCase,
    GetAdminUserUseCase,
    DeleteAdminUserUseCase,
  ],
})
export class AdminUsersModule {}
