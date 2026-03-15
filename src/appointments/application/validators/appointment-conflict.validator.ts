import { BadRequestException, Injectable } from '@nestjs/common';

interface LockedAppointmentRow {
  id: number;
  startTime: string;
  duration: number;
}

interface ConflictCheckInput {
  startTime: string;
  duration: number;
  excludeId?: number;
}

@Injectable()
export class AppointmentConflictValidator {
  assertNoTimeConflict(
    existingAppointments: LockedAppointmentRow[],
    params: ConflictCheckInput,
    errorMessage: string,
  ): void {
    const filtered = params.excludeId
      ? existingAppointments.filter((apt) => apt.id !== params.excludeId)
      : existingAppointments;

    const [reqHours, reqMinutes] = params.startTime.split(':').map(Number);
    const reqStart = reqHours * 60 + reqMinutes;
    const reqEnd = reqStart + params.duration;

    const conflict = filtered.find((apt) => {
      const [aptHours, aptMinutes] = apt.startTime.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + apt.duration;
      return reqStart < aptEnd && reqEnd > aptStart;
    });

    if (conflict) {
      throw new BadRequestException(errorMessage);
    }
  }
}
