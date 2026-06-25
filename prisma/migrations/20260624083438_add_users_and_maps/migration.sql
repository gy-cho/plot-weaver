/*
  Warnings:

  - You are about to drop the column `description` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `mapId` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `mapId` on the `Relationship` table. All the data in the column will be lost.
  - You are about to drop the `RelationshipMap` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `storybookId` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storybookId` to the `Relationship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_mapId_fkey";

-- DropForeignKey
ALTER TABLE "Relationship" DROP CONSTRAINT "Relationship_mapId_fkey";

-- DropForeignKey
ALTER TABLE "RelationshipMap" DROP CONSTRAINT "RelationshipMap_ownerId_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "description",
DROP COLUMN "mapId",
ADD COLUMN     "customFields" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "storybookId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Relationship" DROP COLUMN "mapId",
ADD COLUMN     "storybookId" TEXT NOT NULL;

-- DropTable
DROP TABLE "RelationshipMap";

-- CreateTable
CREATE TABLE "Storybook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '새 스토리북',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Storybook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Storybook" ADD CONSTRAINT "Storybook_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_storybookId_fkey" FOREIGN KEY ("storybookId") REFERENCES "Storybook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relationship" ADD CONSTRAINT "Relationship_storybookId_fkey" FOREIGN KEY ("storybookId") REFERENCES "Storybook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
