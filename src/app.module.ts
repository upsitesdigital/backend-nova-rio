import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { EmailModule } from './email/email.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { HolidaysModule } from './holidays/holidays.module.js';
import { PackagesModule } from './packages/packages.module.js';
import { ServicesModule } from './services/services.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { UnitsModule } from './units/units.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EmailModule,
    AuthModule,
    ServicesModule,
    AdminUsersModule,
    ClientsModule,
    EmployeesModule,
    HolidaysModule,
    PackagesModule,
    UnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
