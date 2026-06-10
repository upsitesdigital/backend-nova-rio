import type { Prisma } from '@prisma/client';

export class AdminUserSelect {
  static readonly safe = {
    id: true,
    uuid: true,
    name: true,
    email: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    createdById: true,
  } satisfies Prisma.AdminUserSelect;
}
