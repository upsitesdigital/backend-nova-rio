-- AlterTable
ALTER TABLE "admin_users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "tokenFamily" TEXT;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "tokenFamily" TEXT,
ADD COLUMN     "vindiCustomerId" INTEGER;
