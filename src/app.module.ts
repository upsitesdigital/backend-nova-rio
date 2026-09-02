import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminUsersModule } from './admin-users/admin-users.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CardsModule } from './cards/cards.module.js';
import { AdminProfileModule } from './admin-profile/admin-profile.module.js';
import { ClientProfileModule } from './client-profile/client-profile.module.js';
import { ClientsModule } from './clients/clients.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { EmailModule } from './email/email.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { HealthModule } from './health/health.module.js';
import { HolidaysModule } from './holidays/holidays.module.js';
import { PackagesModule } from './packages/packages.module.js';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { ReceiptsModule } from './receipts/receipts.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { ServicesModule } from './services/services.module.js';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter.js';
import { ObservabilityModule } from './shared/observability/observability.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { UnitsModule } from './units/units.module.js';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ObservabilityModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    EmailModule,
    AuthModule,
    ClientProfileModule,
    AdminProfileModule,
    AppointmentsModule,
    CardsModule,
    ServicesModule,
    AdminUsersModule,
    ClientsModule,
    DashboardModule,
    EmployeesModule,
    HealthModule,
    HolidaysModule,
    PackagesModule,
    PaymentsModule,
    ReceiptsModule,
    ReportsModule,
    PaymentGatewayModule,
    UnitsModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
