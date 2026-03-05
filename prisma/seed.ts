import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function seedAdminUser() {
  const isProduction = process.env.NODE_ENV === 'production';

  const email = process.env.ADMIN_EMAIL ?? 'admin@novario.com';
  const name = process.env.ADMIN_NAME ?? 'Admin Master';

  let password: string;
  if (isProduction) {
    if (!process.env.ADMIN_PASSWORD) {
      throw new Error('ADMIN_PASSWORD must be set in production');
    }
    password = process.env.ADMIN_PASSWORD;
  } else {
    password = process.env.ADMIN_PASSWORD ?? 'Admin@2026!';
  }

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

  const unitData = {
    name: unitName,
    address: 'Avenida das Américas, Barra da Tijuca, Rio de Janeiro - RJ, 22640-102',
    latitude: -23.001132,
    longitude: -43.3290548,
    serviceRadiusKm: 5,
  };

  const existing = await prisma.unit.findUnique({ where: { name: unitName } });

  if (existing) {
    if (existing.latitude === null) {
      await prisma.unit.update({ where: { id: existing.id }, data: unitData });
      console.log(`Unit "${unitName}" updated with geo fields.`);
    } else {
      console.log(`Unit "${unitName}" already exists, skipping seed.`);
    }
    return;
  }

  await prisma.unit.create({ data: unitData });

  console.log(`Unit "${unitName}" created successfully.`);
}

async function seedServices() {
  const services = [
    {
      name: 'Faxina Regular',
      description: 'Limpeza completa e manutenção periódica',
      icon: 'broom',
      basePrice: 50.0,
      allowSingle: true,
      allowPackage: true,
      allowRecurrence: true,
    },
    {
      name: 'Faxina Premium',
      description: 'Limpeza completa e manutenção periódica',
      icon: 'sketch-logo',
      basePrice: 50.0,
      allowSingle: true,
      allowPackage: true,
      allowRecurrence: true,
    },
    {
      name: 'Faxina Pós-Obra',
      description: 'Limpeza especializada após construção',
      icon: 'star-four',
      basePrice: 50.0,
      allowSingle: true,
      allowPackage: false,
      allowRecurrence: false,
    },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { name: service.name, isActive: true },
    });

    if (existing) {
      console.log(`Service "${service.name}" already exists, skipping.`);
      continue;
    }

    await prisma.service.create({ data: service });
    console.log(`Service "${service.name}" created successfully.`);
  }
}

async function main() {
  await seedAdminUser();
  await seedDefaultUnit();
  await seedServices();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
