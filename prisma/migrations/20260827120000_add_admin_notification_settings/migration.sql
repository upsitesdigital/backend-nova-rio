-- CreateTable
CREATE TABLE "admin_notification_settings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "events" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_notification_settings_uuid_key" ON "admin_notification_settings"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "admin_notification_settings_email_key" ON "admin_notification_settings"("email");
