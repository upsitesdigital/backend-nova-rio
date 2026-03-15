-- DropIndex
DROP INDEX IF EXISTS "appointments_rescheduledFromId_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "rescheduledFromId";
