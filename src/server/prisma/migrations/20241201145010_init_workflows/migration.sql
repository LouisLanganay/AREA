-- CreateTable
CREATE TABLE `Node` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `workflowId` VARCHAR(191) NOT NULL,
    `lastTrigger` INTEGER NULL,
    `dependsOn` VARCHAR(191) NULL,
    `fieldGroups` JSON NOT NULL,
    `conditions` JSON NULL,
    `variables` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workflow` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Node` ADD CONSTRAINT `Node_workflowId_fkey` FOREIGN KEY (`workflowId`) REFERENCES `Workflow`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
