import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { HolidaysModule } from '../holidays/holidays.module.js';
import { AppointmentConflictValidator } from './application/validators/appointment-conflict.validator.js';
import { AppointmentSchedulingValidator } from './application/validators/appointment-scheduling.validator.js';
import { CancelAppointmentUseCase } from './application/use-cases/appointment/cancel-appointment.use-case.js';
import { CancelClientAppointmentUseCase } from './application/use-cases/appointment/cancel-client-appointment.use-case.js';
import { CompleteAppointmentUseCase } from './application/use-cases/appointment/complete-appointment.use-case.js';
import { CreateAppointmentUseCase } from './application/use-cases/appointment/create-appointment.use-case.js';
import { CreateClientAppointmentUseCase } from './application/use-cases/appointment/create-client-appointment.use-case.js';
import { CreatePublicAppointmentUseCase } from './application/use-cases/appointment/create-public-appointment.use-case.js';
import { GetAppointmentUseCase } from './application/use-cases/appointment/get-appointment.use-case.js';
import { GetClientAppointmentUseCase } from './application/use-cases/appointment/get-client-appointment.use-case.js';
import { ListAppointmentsUseCase } from './application/use-cases/appointment/list-appointments.use-case.js';
import { ListClientAppointmentsUseCase } from './application/use-cases/appointment/list-client-appointments.use-case.js';
import { RescheduleAppointmentUseCase } from './application/use-cases/appointment/reschedule-appointment.use-case.js';
import { RescheduleClientAppointmentUseCase } from './application/use-cases/appointment/reschedule-client-appointment.use-case.js';
import { UpdateAppointmentUseCase } from './application/use-cases/appointment/update-appointment.use-case.js';
import { APPOINTMENT_REPOSITORY } from './domain/interfaces/appointment.repository.interface.js';
import { PrismaAppointmentRepository } from './infrastructure/repositories/prisma-appointment.repository.js';
import { AdminAppointmentsController } from './admin-appointments.controller.js';
import { ClientAppointmentsController } from './client-appointments.controller.js';

@Module({
  imports: [AuthModule, HolidaysModule],
  controllers: [AdminAppointmentsController, ClientAppointmentsController],
  providers: [
    { provide: APPOINTMENT_REPOSITORY, useClass: PrismaAppointmentRepository },
    AppointmentConflictValidator,
    AppointmentSchedulingValidator,
    CreateAppointmentUseCase,
    ListAppointmentsUseCase,
    GetAppointmentUseCase,
    UpdateAppointmentUseCase,
    RescheduleAppointmentUseCase,
    CancelAppointmentUseCase,
    CompleteAppointmentUseCase,
    CreateClientAppointmentUseCase,
    CreatePublicAppointmentUseCase,
    ListClientAppointmentsUseCase,
    GetClientAppointmentUseCase,
    RescheduleClientAppointmentUseCase,
    CancelClientAppointmentUseCase,
  ],
  exports: [APPOINTMENT_REPOSITORY],
})
export class AppointmentsModule {}
