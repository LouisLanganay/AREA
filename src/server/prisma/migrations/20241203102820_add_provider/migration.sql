-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `provider` VARCHAR(191) NULL DEFAULT 'local';
