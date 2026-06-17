/*
  Warnings:

  - You are about to drop the `job_locks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "units" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT;

-- DropTable
DROP TABLE "job_locks";
