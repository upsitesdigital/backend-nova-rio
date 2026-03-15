import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedPayments() {
  const clientEmail = 'lorenzo.dz@hotmail.com';

  const client = await prisma.client.findUnique({ where: { email: clientEmail } });
  if (!client) {
    console.error(`Client "${clientEmail}" not found. Run main seed first.`);
    process.exit(1);
  }

  const service = await prisma.service.findFirst({
    where: { name: 'Faxina Pós-Obra', isActive: true },
  });
  if (!service) {
    console.error('Service "Faxina Pós-Obra" not found. Run main seed first.');
    process.exit(1);
  }

  const existingPayments = await prisma.payment.count({ where: { clientId: client.id } });
  if (existingPayments > 0) {
    console.log(`Client "${clientEmail}" already has ${existingPayments} payments, skipping.`);
    return;
  }

  let card = await prisma.card.findFirst({
    where: { clientId: client.id },
    orderBy: { id: 'asc' },
  });
  if (!card) {
    card = await prisma.card.create({
      data: {
        clientId: client.id,
        cardNumber: '4111111111110123',
        lastFourDigits: '0123',
        brand: 'visa',
        holderName: 'LORENZO DZ',
        expiryMonth: 12,
        expiryYear: 2030,
        isDefault: true,
      },
    });
    console.log('Card •••• 0123 created for client.');
  }

  const paymentRows: {
    method: 'CREDIT_CARD' | 'PIX';
    status: 'APPROVED' | 'PENDING' | 'CANCELLED';
    cardId: number | null;
  }[] = [
    { method: 'CREDIT_CARD', status: 'APPROVED', cardId: card.id },
    { method: 'CREDIT_CARD', status: 'APPROVED', cardId: card.id },
    { method: 'PIX', status: 'APPROVED', cardId: null },
    { method: 'CREDIT_CARD', status: 'PENDING', cardId: card.id },
    { method: 'CREDIT_CARD', status: 'PENDING', cardId: card.id },
    { method: 'PIX', status: 'CANCELLED', cardId: null },
  ];

  for (let i = 0; i < paymentRows.length; i++) {
    const row = paymentRows[i];
    const appointmentDate = new Date('2025-09-25');
    const startHour = 8 + i;

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        duration: 60,
        status: row.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED',
        recurrenceType: 'SINGLE',
        clientId: client.id,
        serviceId: service.id,
      },
    });

    await prisma.payment.create({
      data: {
        amount: 57.0,
        subtotal: 57.0,
        serviceFee: 0,
        discount: 0,
        method: row.method,
        status: row.status,
        paidAt: row.status === 'APPROVED' ? new Date('2025-09-25T12:00:00Z') : null,
        cancellationReason: row.status === 'CANCELLED' ? 'Cancelado pelo cliente' : null,
        clientId: client.id,
        appointmentId: appointment.id,
        cardId: row.cardId,
      },
    });

    console.log(`Payment ${i + 1}/6 created: ${row.method} — ${row.status}`);
  }

  console.log(`All 6 payments seeded for "${clientEmail}".`);
}

seedPayments()
  .catch((e) => {
    console.error('Seed payments failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
