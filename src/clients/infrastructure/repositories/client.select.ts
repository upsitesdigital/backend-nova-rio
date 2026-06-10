import type { Prisma } from '@prisma/client';

export class ClientSelect {
  static readonly safe = {
    id: true,
    uuid: true,
    name: true,
    email: true,
    phone: true,
    avatarUrl: true,
    company: true,
    cpfCnpj: true,
    address: true,
    complement: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    unit: { select: { id: true, name: true } },
  } satisfies Prisma.ClientSelect;
}
