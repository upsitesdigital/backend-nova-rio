import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'node:path';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { CardsModule } from './cards/cards.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { EmailModule } from './email/email.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { HealthModule } from './health/health.module.js';
import { HolidaysModule } from './holidays/holidays.module.js';
import { PackagesModule } from './packages/packages.module.js';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { ServicesModule } from './services/services.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { UnitsModule } from './units/units.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    EmailModule,
    AuthModule,
    AppointmentsModule,
    CardsModule,
    ServicesModule,
    AdminUsersModule,
    ClientsModule,
    EmployeesModule,
    HealthModule,
    HolidaysModule,
    PackagesModule,
    PaymentsModule,
    ReceiptsModule,
    PaymentGatewayModule,
    UnitsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
