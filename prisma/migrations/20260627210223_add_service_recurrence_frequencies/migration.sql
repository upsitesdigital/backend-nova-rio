-- CreateEnum
CREATE TYPE "ServiceRecurrenceFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "recurrenceFrequencies" "ServiceRecurrenceFrequency"[] DEFAULT ARRAY['WEEKLY', 'BIWEEKLY', 'MONTHLY']::"ServiceRecurrenceFrequency"[];
