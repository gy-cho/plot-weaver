/*
  Warnings:

  - Added the required column `mapId` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mapId` to the `Relationship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "mapId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "mapId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelationshipMap" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '새 관계도',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "RelationshipMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "RelationshipMap" ADD CONSTRAINT "RelationshipMap_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "RelationshipMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "RelationshipMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
