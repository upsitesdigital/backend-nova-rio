-- AlterTable
ALTER TABLE "clients" ADD COLUMN "failedResetAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "clients" ADD COLUMN "resetLockedUntil" TIMESTAMP(3);
