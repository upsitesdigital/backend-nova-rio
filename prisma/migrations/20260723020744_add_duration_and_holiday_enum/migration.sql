/*
  Warnings:

  - The `type` column on the `holidays` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NATIONAL', 'STATE', 'MUNICIPAL', 'FACULTATIVO');

-- AlterTable
ALTER TABLE "holidays" DROP COLUMN "type",
ADD COLUMN     "type" "HolidayType" NOT NULL DEFAULT 'NATIONAL';

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "durationMinutes" INTEGER NOT NULL DEFAULT 120;
