/**
 * Full data seeder for Nova Rio backend.
 *
 * Run manually:
 *   docker exec nova_rio_backend npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-full.ts
 *
 * Or locally:
 *   npm run seed:full
 *
 * Creates realistic data across all models with past, present and future dates.
 * Safe to re-run — skips if data already exists (checks marker client).
 */

import 'dotenv/config';
import { HolidayType, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

if (process.env.NODE_ENV === 'production') {
  console.error('Seed script must not run in production.');
  process.exitCode = 1;
  process.exit();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function date(iso: string): Date {
  return new Date(iso);
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function futureDate(daysAhead: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d;
}

function todayDate(): Date {
  return new Date();
}

function randomCpf(): string {
  const digits: number[] = [];
  for (let i = 0; i < 9; i++) digits.push(Math.floor(Math.random() * 10));
  for (let j = 0; j < 2; j++) {
    const val = digits.reduce((sum, d, i) => sum + (digits.length + 1 - i) * d, 0) % 11;
    digits.push(val < 2 ? 0 : 11 - val);
  }
  return digits.join('');
}

function randomPhone(): string {
  const num = Math.floor(10000000 + Math.random() * 90000000);
  return `+55219${num}`;
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function seedAdmins() {
  const admins = [
    {
      name: 'Admin Master',
      email: 'admin@novario.com',
      role: 'ADMIN_MASTER' as const,
      password: 'Admin@2026!',
    },
    {
      name: 'Fernanda Gestora',
      email: 'fernanda@novario.com',
      role: 'ADMIN_BASIC' as const,
      password: 'Admin@2026!',
    },
  ];

  for (const a of admins) {
    const existing = await prisma.adminUser.findUnique({ where: { email: a.email } });
    if (existing) {
      console.log(`  Admin "${a.email}" exists, skipping.`);
      continue;
    }
    const hashed = await bcrypt.hash(a.password, 10);
    await prisma.adminUser.create({
      data: { name: a.name, email: a.email, password: hashed, role: a.role, status: 'ACTIVE' },
    });
    console.log(`  Admin "${a.email}" created.`);
  }
}

async function seedUnits() {
  const units = [
    {
      name: 'Condomínio Le Monde',
      address: 'Avenida das Américas, 4666 - Barra da Tijuca, Rio de Janeiro - RJ, 22640-102',
      street: 'Avenida das Américas',
      number: '4666',
      neighborhood: 'Barra da Tijuca',
      city: 'Rio de Janeiro',
      state: 'RJ',
      cep: '22640-102',
      latitude: -23.001132,
      longitude: -43.329055,
      serviceRadiusKm: 5,
    },
    {
      name: 'Condomínio Riviera',
      address: 'Rua Prefeito João Felipe, 200 - Recreio, Rio de Janeiro - RJ, 22790-000',
      street: 'Rua Prefeito João Felipe',
      number: '200',
      neighborhood: 'Recreio',
      city: 'Rio de Janeiro',
      state: 'RJ',
      cep: '22790-000',
      latitude: -23.0125,
      longitude: -43.44,
      serviceRadiusKm: 3,
    },
  ];

  for (const u of units) {
    const existing = await prisma.unit.findUnique({ where: { name: u.name } });
    if (existing) {
      console.log(`  Unit "${u.name}" exists, skipping.`);
      continue;
    }
    await prisma.unit.create({ data: u });
    console.log(`  Unit "${u.name}" created.`);
  }
}

async function seedServices() {
  const services = [
    {
      name: 'Faxina Regular',
      description: 'Limpeza completa e manutenção periódica',
      icon: 'broom',
      basePrice: 150.0,
      allowSingle: true,
      allowPackage: true,
      allowRecurrence: true,
    },
    {
      name: 'Faxina Premium',
      description: 'Limpeza premium com produtos especiais',
      icon: 'sketch-logo',
      basePrice: 250.0,
      allowSingle: true,
      allowPackage: true,
      allowRecurrence: true,
    },
    {
      name: 'Faxina Pós-Obra',
      description: 'Limpeza especializada após construção',
      icon: 'star-four',
      basePrice: 350.0,
      allowSingle: true,
      allowPackage: false,
      allowRecurrence: false,
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (existing) {
      console.log(`  Service "${s.name}" exists, skipping.`);
      continue;
    }
    await prisma.service.create({ data: s });
    console.log(`  Service "${s.name}" created.`);
  }
}

async function seedPackages() {
  const faxinaRegular = await prisma.service.findFirst({ where: { name: 'Faxina Regular' } });
  const faxinaPremium = await prisma.service.findFirst({ where: { name: 'Faxina Premium' } });
  if (!faxinaRegular || !faxinaPremium) return;

  const packages = [
    {
      name: 'Pacote Regular 10h',
      description: '10 horas de faxina regular',
      totalHours: 10,
      price: 1350.0,
      serviceId: faxinaRegular.id,
    },
    {
      name: 'Pacote Premium 10h',
      description: '10 horas de faxina premium',
      totalHours: 10,
      price: 2250.0,
      serviceId: faxinaPremium.id,
    },
  ];

  for (const p of packages) {
    const existing = await prisma.package.findFirst({ where: { name: p.name } });
    if (existing) {
      console.log(`  Package "${p.name}" exists, skipping.`);
      continue;
    }
    await prisma.package.create({ data: p });
    console.log(`  Package "${p.name}" created.`);
  }
}

async function seedEmployees() {
  const unit1 = await prisma.unit.findFirst({ where: { name: 'Condomínio Le Monde' } });
  const unit2 = await prisma.unit.findFirst({ where: { name: 'Condomínio Riviera' } });

  const employees = [
    {
      name: 'Carlos Magno',
      email: 'carlos.magno@gmail.com',
      cpf: randomCpf(),
      phone: '+5521987654321',
      availabilityFrom: '07:00',
      availabilityTo: '18:00',
      unitId: unit1?.id,
      notes: 'Funcionário experiente, 5 anos de casa',
    },
    {
      name: 'Eloísa Penteado',
      email: 'eloisa.penteado@gmail.com',
      cpf: randomCpf(),
      phone: '+5521976543210',
      availabilityFrom: '08:00',
      availabilityTo: '17:00',
      unitId: unit1?.id,
      notes: null,
    },
    {
      name: 'Fábio Moraes',
      email: 'fabio.moraes@gmail.com',
      cpf: randomCpf(),
      phone: '+5521965432109',
      availabilityFrom: '07:00',
      availabilityTo: '16:00',
      unitId: unit1?.id,
      notes: 'Especialista em pós-obra',
    },
    {
      name: 'Ana Paula Souza',
      email: 'ana.souza@gmail.com',
      cpf: randomCpf(),
      phone: randomPhone(),
      availabilityFrom: '08:00',
      availabilityTo: '17:00',
      unitId: unit2?.id,
      notes: null,
    },
    {
      name: 'Bruno Costa',
      email: 'bruno.costa@gmail.com',
      cpf: randomCpf(),
      phone: randomPhone(),
      availabilityFrom: '09:00',
      availabilityTo: '18:00',
      unitId: unit2?.id,
      notes: null,
    },
    {
      name: 'Camila Ferreira',
      email: 'camila.ferreira@gmail.com',
      cpf: randomCpf(),
      phone: randomPhone(),
      availabilityFrom: '07:00',
      availabilityTo: '15:00',
      unitId: unit1?.id,
      notes: null,
    },
    {
      name: 'Diego Oliveira',
      email: 'diego.oliveira@gmail.com',
      cpf: randomCpf(),
      phone: randomPhone(),
      availabilityFrom: '10:00',
      availabilityTo: '19:00',
      unitId: unit2?.id,
      notes: null,
    },
    {
      name: 'Elena Santos',
      email: 'elena.santos@gmail.com',
      cpf: randomCpf(),
      phone: randomPhone(),
      availabilityFrom: '08:00',
      availabilityTo: '16:00',
      unitId: unit1?.id,
      status: 'INACTIVE' as const,
      notes: 'Desligada em fevereiro 2026',
    },
  ];

  for (const e of employees) {
    const existing = await prisma.employee.findFirst({ where: { email: e.email } });
    if (existing) {
      console.log(`  Employee "${e.name}" exists, skipping.`);
      continue;
    }
    const { notes, ...rest } = e;
    await prisma.employee.create({ data: { ...rest, notes } });
    console.log(`  Employee "${e.name}" created.`);
  }
}

async function seedClients() {
  const unit1 = await prisma.unit.findFirst({ where: { name: 'Condomínio Le Monde' } });

  const clients = [
    {
      name: 'Caio Teste',
      email: 'cliente@teste.com',
      phone: '(21) 99999-9999',
      cpfCnpj: '000.000.000-00',
      password: 'Senha@123',
      status: 'ACTIVE' as const,
      unitId: unit1?.id,
    },
    {
      name: 'Lorenzo DZ',
      email: 'lorenzo.dz@hotmail.com',
      phone: '(21) 99999-0001',
      cpfCnpj: null,
      password: 'Senha@123',
      status: 'ACTIVE' as const,
      unitId: unit1?.id,
    },
    {
      name: 'Mariana Silva',
      email: 'mariana.silva@gmail.com',
      phone: '(21) 98888-1234',
      cpfCnpj: '123.456.789-00',
      password: 'Senha@123',
      status: 'ACTIVE' as const,
      unitId: unit1?.id,
    },
    {
      name: 'Roberto Alves',
      email: 'roberto.alves@gmail.com',
      phone: '(21) 97777-5678',
      cpfCnpj: null,
      password: 'Senha@123',
      status: 'ACTIVE' as const,
      unitId: null,
    },
    {
      name: 'Patrícia Lima',
      email: 'patricia.lima@gmail.com',
      phone: '(21) 96666-4321',
      cpfCnpj: null,
      password: 'Senha@123',
      status: 'PENDING' as const,
      unitId: null,
    },
    {
      name: 'Gustavo Mendes',
      email: 'gustavo.mendes@gmail.com',
      phone: '(21) 95555-8765',
      cpfCnpj: null,
      password: 'Senha@123',
      status: 'INACTIVE' as const,
      unitId: null,
    },
  ];

  for (const c of clients) {
    const existing = await prisma.client.findUnique({ where: { email: c.email } });
    if (existing) {
      console.log(`  Client "${c.name}" exists, skipping.`);
      continue;
    }
    const hashed = await bcrypt.hash(c.password, 10);
    await prisma.client.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        cpfCnpj: c.cpfCnpj,
        password: hashed,
        status: c.status,
        unitId: c.unitId,
      },
    });
    console.log(`  Client "${c.name}" created.`);
  }
}

async function seedCards() {
  const clients = await prisma.client.findMany({ where: { status: 'ACTIVE' }, take: 4 });

  const cardData: {
    lastFourDigits: string;
    brand: string;
    holderName: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }[] = [
    {
      lastFourDigits: '4242',
      brand: 'visa',
      holderName: '',
      expiryMonth: 12,
      expiryYear: 2030,
      isDefault: true,
    },
    {
      lastFourDigits: '5353',
      brand: 'mastercard',
      holderName: '',
      expiryMonth: 6,
      expiryYear: 2028,
      isDefault: false,
    },
  ];

  for (const client of clients) {
    const existingCards = await prisma.card.count({ where: { clientId: client.id } });
    if (existingCards > 0) {
      console.log(`  Client "${client.name}" already has cards, skipping.`);
      continue;
    }
    for (const card of cardData) {
      await prisma.card.create({
        data: { ...card, holderName: client.name.toUpperCase(), clientId: client.id },
      });
    }
    console.log(`  2 cards created for "${client.name}".`);
  }
}

async function seedAppointmentsAndPayments() {
  const marker = await prisma.appointment.findFirst({ where: { notes: 'SEED_FULL_MARKER' } });
  if (marker) {
    console.log('  Appointments already seeded (marker found), skipping.');
    return;
  }

  const clients = await prisma.client.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { id: 'asc' },
    take: 4,
  });
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { id: 'asc' },
    take: 6,
  });
  const services = await prisma.service.findMany({ orderBy: { id: 'asc' } });
  const unit = await prisma.unit.findFirst({ where: { name: 'Condomínio Le Monde' } });

  if (clients.length === 0 || employees.length === 0 || services.length === 0) {
    console.log('  Missing base data for appointments, skipping.');
    return;
  }

  // --- PAST appointments (completed, 30-7 days ago) ---
  const pastAppointments: {
    daysAgo: number;
    hour: string;
    duration: number;
    status: 'COMPLETED' | 'CANCELLED';
    clientIdx: number;
    employeeIdx: number;
    serviceIdx: number;
    recurrenceType: 'SINGLE' | 'PACKAGE' | 'WEEKLY';
  }[] = [
    {
      daysAgo: 30,
      hour: '08:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 0,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 28,
      hour: '09:00',
      duration: 90,
      status: 'COMPLETED',
      clientIdx: 1,
      employeeIdx: 1,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 25,
      hour: '10:00',
      duration: 180,
      status: 'COMPLETED',
      clientIdx: 2,
      employeeIdx: 2,
      serviceIdx: 2,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 23,
      hour: '08:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 0,
      employeeIdx: 3,
      serviceIdx: 0,
      recurrenceType: 'WEEKLY',
    },
    {
      daysAgo: 21,
      hour: '14:00',
      duration: 120,
      status: 'CANCELLED',
      clientIdx: 1,
      employeeIdx: 0,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 18,
      hour: '09:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 2,
      employeeIdx: 1,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 16,
      hour: '08:00',
      duration: 90,
      status: 'COMPLETED',
      clientIdx: 3,
      employeeIdx: 4,
      serviceIdx: 1,
      recurrenceType: 'PACKAGE',
    },
    {
      daysAgo: 14,
      hour: '10:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 0,
      employeeIdx: 2,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 12,
      hour: '08:00',
      duration: 180,
      status: 'COMPLETED',
      clientIdx: 1,
      employeeIdx: 3,
      serviceIdx: 2,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 10,
      hour: '09:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 2,
      employeeIdx: 0,
      serviceIdx: 1,
      recurrenceType: 'WEEKLY',
    },
    {
      daysAgo: 8,
      hour: '14:00',
      duration: 90,
      status: 'COMPLETED',
      clientIdx: 3,
      employeeIdx: 5,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 7,
      hour: '08:00',
      duration: 120,
      status: 'COMPLETED',
      clientIdx: 0,
      employeeIdx: 1,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
  ];

  // --- PRESENT appointments (today, scheduled) ---
  const todayAppointments: typeof pastAppointments = [
    {
      daysAgo: 0,
      hour: '09:00',
      duration: 120,
      status: 'COMPLETED' as const,
      clientIdx: 0,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 0,
      hour: '10:00',
      duration: 90,
      status: 'COMPLETED' as const,
      clientIdx: 1,
      employeeIdx: 2,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAgo: 0,
      hour: '14:00',
      duration: 120,
      status: 'COMPLETED' as const,
      clientIdx: 2,
      employeeIdx: 3,
      serviceIdx: 0,
      recurrenceType: 'WEEKLY',
    },
  ];

  // --- FUTURE appointments (1-30 days from now, scheduled) ---
  const futureAppointments: {
    daysAhead: number;
    hour: string;
    duration: number;
    clientIdx: number;
    employeeIdx: number;
    serviceIdx: number;
    recurrenceType: 'SINGLE' | 'PACKAGE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  }[] = [
    {
      daysAhead: 1,
      hour: '08:00',
      duration: 120,
      clientIdx: 0,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 1,
      hour: '10:00',
      duration: 90,
      clientIdx: 1,
      employeeIdx: 1,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 2,
      hour: '09:00',
      duration: 120,
      clientIdx: 2,
      employeeIdx: 2,
      serviceIdx: 0,
      recurrenceType: 'WEEKLY',
    },
    {
      daysAhead: 3,
      hour: '08:00',
      duration: 180,
      clientIdx: 3,
      employeeIdx: 3,
      serviceIdx: 2,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 3,
      hour: '14:00',
      duration: 120,
      clientIdx: 0,
      employeeIdx: 4,
      serviceIdx: 1,
      recurrenceType: 'PACKAGE',
    },
    {
      daysAhead: 5,
      hour: '09:00',
      duration: 120,
      clientIdx: 1,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 5,
      hour: '14:00',
      duration: 90,
      clientIdx: 2,
      employeeIdx: 5,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 7,
      hour: '08:00',
      duration: 120,
      clientIdx: 3,
      employeeIdx: 1,
      serviceIdx: 0,
      recurrenceType: 'BIWEEKLY',
    },
    {
      daysAhead: 8,
      hour: '10:00',
      duration: 120,
      clientIdx: 0,
      employeeIdx: 2,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 10,
      hour: '09:00',
      duration: 180,
      clientIdx: 1,
      employeeIdx: 3,
      serviceIdx: 2,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 12,
      hour: '08:00',
      duration: 120,
      clientIdx: 2,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'MONTHLY',
    },
    {
      daysAhead: 14,
      hour: '14:00',
      duration: 90,
      clientIdx: 3,
      employeeIdx: 4,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 15,
      hour: '09:00',
      duration: 120,
      clientIdx: 0,
      employeeIdx: 5,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 20,
      hour: '08:00',
      duration: 120,
      clientIdx: 1,
      employeeIdx: 1,
      serviceIdx: 0,
      recurrenceType: 'WEEKLY',
    },
    {
      daysAhead: 25,
      hour: '10:00',
      duration: 90,
      clientIdx: 2,
      employeeIdx: 2,
      serviceIdx: 1,
      recurrenceType: 'SINGLE',
    },
    {
      daysAhead: 30,
      hour: '09:00',
      duration: 120,
      clientIdx: 3,
      employeeIdx: 0,
      serviceIdx: 0,
      recurrenceType: 'SINGLE',
    },
  ];

  const paymentMethods: ('CREDIT_CARD' | 'PIX')[] = [
    'CREDIT_CARD',
    'CREDIT_CARD',
    'PIX',
    'CREDIT_CARD',
    'PIX',
    'CREDIT_CARD',
  ];
  let appointmentCount = 0;

  // Create past
  for (const a of pastAppointments) {
    const client = clients[a.clientIdx % clients.length];
    const employee = employees[a.employeeIdx % employees.length];
    const service = services[a.serviceIdx % services.length];
    const card = await prisma.card.findFirst({
      where: { clientId: client.id },
      orderBy: { id: 'asc' },
    });

    const appointment = await prisma.appointment.create({
      data: {
        date: pastDate(a.daysAgo),
        startTime: a.hour,
        duration: a.duration,
        status: a.status,
        recurrenceType: a.recurrenceType,
        clientId: client.id,
        employeeId: employee.id,
        serviceId: service.id,
        unitId: unit?.id,
        notes: appointmentCount === 0 ? 'SEED_FULL_MARKER' : null,
      },
    });

    const method = paymentMethods[appointmentCount % paymentMethods.length];
    const amount = Number(service.basePrice) * (a.duration / 60);
    const paymentStatus = a.status === 'CANCELLED' ? ('CANCELLED' as const) : ('APPROVED' as const);

    await prisma.payment.create({
      data: {
        amount,
        subtotal: amount,
        serviceFee: 0,
        discount: 0,
        method,
        status: paymentStatus,
        paidAt: paymentStatus === 'APPROVED' ? pastDate(a.daysAgo) : null,
        cancellationReason: paymentStatus === 'CANCELLED' ? 'Cancelado pelo cliente' : null,
        clientId: client.id,
        appointmentId: appointment.id,
        cardId: method === 'CREDIT_CARD' ? (card?.id ?? null) : null,
      },
    });

    appointmentCount++;
  }
  console.log(`  ${pastAppointments.length} past appointments + payments created.`);

  // Create today
  for (const a of todayAppointments) {
    const client = clients[a.clientIdx % clients.length];
    const employee = employees[a.employeeIdx % employees.length];
    const service = services[a.serviceIdx % services.length];
    const card = await prisma.card.findFirst({
      where: { clientId: client.id },
      orderBy: { id: 'asc' },
    });

    const appointment = await prisma.appointment.create({
      data: {
        date: todayDate(),
        startTime: a.hour,
        duration: a.duration,
        status: 'SCHEDULED',
        recurrenceType: a.recurrenceType,
        clientId: client.id,
        employeeId: employee.id,
        serviceId: service.id,
        unitId: unit?.id,
      },
    });

    const method = paymentMethods[appointmentCount % paymentMethods.length];
    const amount = Number(service.basePrice) * (a.duration / 60);

    await prisma.payment.create({
      data: {
        amount,
        subtotal: amount,
        serviceFee: 0,
        discount: 0,
        method,
        status: 'PENDING',
        clientId: client.id,
        appointmentId: appointment.id,
        cardId: method === 'CREDIT_CARD' ? (card?.id ?? null) : null,
      },
    });

    appointmentCount++;
  }
  console.log(`  ${todayAppointments.length} today appointments + payments created.`);

  // Create future
  for (const a of futureAppointments) {
    const client = clients[a.clientIdx % clients.length];
    const employee = employees[a.employeeIdx % employees.length];
    const service = services[a.serviceIdx % services.length];
    const card = await prisma.card.findFirst({
      where: { clientId: client.id },
      orderBy: { id: 'asc' },
    });

    const appointment = await prisma.appointment.create({
      data: {
        date: futureDate(a.daysAhead),
        startTime: a.hour,
        duration: a.duration,
        status: 'SCHEDULED',
        recurrenceType: a.recurrenceType,
        clientId: client.id,
        employeeId: employee.id,
        serviceId: service.id,
        unitId: unit?.id,
      },
    });

    const method = paymentMethods[appointmentCount % paymentMethods.length];
    const amount = Number(service.basePrice) * (a.duration / 60);

    await prisma.payment.create({
      data: {
        amount,
        subtotal: amount,
        serviceFee: 0,
        discount: 0,
        method,
        status: 'PENDING',
        clientId: client.id,
        appointmentId: appointment.id,
        cardId: method === 'CREDIT_CARD' ? (card?.id ?? null) : null,
      },
    });

    appointmentCount++;
  }
  console.log(`  ${futureAppointments.length} future appointments + payments created.`);
}

async function seedHolidays() {
  const holidays = [
    { date: date('2026-01-01'), name: 'Ano Novo', type: HolidayType.NATIONAL },
    { date: date('2026-02-16'), name: 'Carnaval', type: HolidayType.NATIONAL },
    { date: date('2026-02-17'), name: 'Carnaval', type: HolidayType.NATIONAL },
    { date: date('2026-04-03'), name: 'Sexta-feira Santa', type: HolidayType.NATIONAL },
    { date: date('2026-04-21'), name: 'Tiradentes', type: HolidayType.NATIONAL },
    { date: date('2026-05-01'), name: 'Dia do Trabalho', type: HolidayType.NATIONAL },
    { date: date('2026-06-04'), name: 'Corpus Christi', type: HolidayType.NATIONAL },
    { date: date('2026-09-07'), name: 'Independência do Brasil', type: HolidayType.NATIONAL },
    { date: date('2026-10-12'), name: 'Nossa Senhora Aparecida', type: HolidayType.NATIONAL },
    { date: date('2026-11-02'), name: 'Finados', type: HolidayType.NATIONAL },
    { date: date('2026-11-15'), name: 'Proclamação da República', type: HolidayType.NATIONAL },
    { date: date('2026-12-25'), name: 'Natal', type: HolidayType.NATIONAL },
  ];

  for (const h of holidays) {
    const existing = await prisma.holiday.findFirst({ where: { date: h.date } });
    if (existing) continue;
    await prisma.holiday.create({ data: { ...h, isBlocked: true } });
  }
  console.log(`  ${holidays.length} holidays seeded.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Nova Rio Full Seeder ===\n');

  console.log('[1/8] Admins...');
  await seedAdmins();

  console.log('[2/8] Units...');
  await seedUnits();

  console.log('[3/8] Services...');
  await seedServices();

  console.log('[4/8] Packages...');
  await seedPackages();

  console.log('[5/8] Employees...');
  await seedEmployees();

  console.log('[6/8] Clients...');
  await seedClients();

  console.log('[7/8] Cards...');
  await seedCards();

  console.log('[8/8] Appointments + Payments...');
  await seedAppointmentsAndPayments();

  console.log('[bonus] Holidays...');
  await seedHolidays();

  console.log('\n=== Seeding complete! ===');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
