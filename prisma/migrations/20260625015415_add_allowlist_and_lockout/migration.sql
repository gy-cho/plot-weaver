-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastFailedLoginAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AllowedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedEmail_email_key" ON "AllowedEmail"("email");
