-- DropForeignKey
ALTER TABLE `Workflow` DROP FOREIGN KEY `Workflow_userId_fkey`;

-- AddForeignKey
ALTER TABLE `Workflow` ADD CONSTRAINT `Workflow_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
