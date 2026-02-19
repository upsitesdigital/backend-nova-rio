import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@novario.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin@2026!';
  const name = process.env.ADMIN_NAME ?? 'Admin Master';

  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin "${email}" already exists, skipping seed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN_MASTER',
      status: 'ACTIVE',
    },
  });

  console.log(`Admin "${email}" created successfully.`);
}

async function seedDefaultUnit() {
  const unitName = 'Condomínio Le Monde';

  const existing = await prisma.unit.findUnique({ where: { name: unitName } });

  if (existing) {
    console.log(`Unit "${unitName}" already exists, skipping seed.`);
    return;
  }

  await prisma.unit.create({
    data: { name: unitName },
  });

  console.log(`Unit "${unitName}" created successfully.`);
}

async function main() {
  await seedAdminUser();
  await seedDefaultUnit();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
