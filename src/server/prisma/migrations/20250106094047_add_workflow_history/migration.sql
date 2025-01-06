/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `historyWorkflow` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `workflowId` VARCHAR(191) NOT NULL,
    `executionDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'success',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Token_userId_provider_key` ON `Token`(`userId`, `provider`);

-- AddForeignKey
ALTER TABLE `historyWorkflow` ADD CONSTRAINT `historyWorkflow_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `Workflow`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
