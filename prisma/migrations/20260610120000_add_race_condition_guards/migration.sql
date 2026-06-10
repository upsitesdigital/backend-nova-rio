-- Gateway/webhook idempotency.
CREATE UNIQUE INDEX IF NOT EXISTS "payments_gatewayTransactionId_key"
ON "payments"("gatewayTransactionId")
WHERE "gatewayTransactionId" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "processed_webhook_events" (
  "id" SERIAL PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "processed_webhook_events_eventId_key"
ON "processed_webhook_events"("eventId");

-- App-maintained invariants that must be enforced by PostgreSQL under concurrency.
CREATE UNIQUE INDEX IF NOT EXISTS "cards_one_default_per_client"
ON "cards"("clientId")
WHERE "isDefault" = true;

CREATE UNIQUE INDEX IF NOT EXISTS "appointments_employee_scheduled_slot"
ON "appointments"("employeeId", "date", "startTime")
WHERE "status" = 'SCHEDULED' AND "employeeId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "appointments_client_scheduled_slot"
ON "appointments"("clientId", "date", "startTime")
WHERE "status" = 'SCHEDULED';
