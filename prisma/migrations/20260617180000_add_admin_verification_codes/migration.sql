-- CreateTable
CREATE TABLE "admin_verification_codes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "admin_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_verification_codes_uuid_key" ON "admin_verification_codes"("uuid");

-- CreateIndex
CREATE INDEX "admin_verification_codes_adminId_type_idx" ON "admin_verification_codes"("adminId", "type");
