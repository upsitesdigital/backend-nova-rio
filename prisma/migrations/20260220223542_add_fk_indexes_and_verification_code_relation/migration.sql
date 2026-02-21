-- CreateIndex
CREATE INDEX "admin_users_createdById_idx" ON "admin_users"("createdById");

-- CreateIndex
CREATE INDEX "appointments_employeeId_date_status_idx" ON "appointments"("employeeId", "date", "status");

-- CreateIndex
CREATE INDEX "appointments_unitId_idx" ON "appointments"("unitId");

-- CreateIndex
CREATE INDEX "appointments_clientId_status_idx" ON "appointments"("clientId", "status");

-- CreateIndex
CREATE INDEX "cards_clientId_idx" ON "cards"("clientId");

-- CreateIndex
CREATE INDEX "clients_unitId_idx" ON "clients"("unitId");

-- CreateIndex
CREATE INDEX "employees_unitId_idx" ON "employees"("unitId");

-- CreateIndex
CREATE INDEX "packages_serviceId_idx" ON "packages"("serviceId");

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
