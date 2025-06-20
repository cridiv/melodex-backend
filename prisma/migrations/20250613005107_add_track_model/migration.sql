/*
  Warnings:

  - You are about to drop the column `metadata` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "metadata";
