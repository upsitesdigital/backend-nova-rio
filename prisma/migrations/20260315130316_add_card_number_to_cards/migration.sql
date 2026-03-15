-- AlterTable: add cardNumber with default for existing rows, then remove default
ALTER TABLE "cards" ADD COLUMN "cardNumber" TEXT NOT NULL DEFAULT '';
UPDATE "cards" SET "cardNumber" = "lastFourDigits" WHERE "cardNumber" = '';
ALTER TABLE "cards" ALTER COLUMN "cardNumber" DROP DEFAULT;
