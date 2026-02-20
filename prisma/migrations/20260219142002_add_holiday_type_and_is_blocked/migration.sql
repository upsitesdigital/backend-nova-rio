-- AlterTable
ALTER TABLE "holidays" ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'national';
