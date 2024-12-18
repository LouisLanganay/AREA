/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Workflow` ADD COLUMN `favorite` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `Token_userId_provider_key` ON `Token`(`userId`, `provider`);
