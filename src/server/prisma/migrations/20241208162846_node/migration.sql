/*
  Warnings:

  - Added the required column `id_node` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Node` ADD COLUMN `id_node` VARCHAR(191) NOT NULL;
