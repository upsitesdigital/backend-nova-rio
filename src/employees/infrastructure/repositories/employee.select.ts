import type { Prisma } from '@prisma/client';

export class EmployeeSelect {
  static readonly safe = {
    id: true,
    uuid: true,
    name: true,
    email: true,
    phone: true,
    cpf: true,
    address: true,
    avatarUrl: true,
    status: true,
    availabilityFrom: true,
    availabilityTo: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    unit: { select: { id: true, name: true } },
  } satisfies Prisma.EmployeeSelect;
}
