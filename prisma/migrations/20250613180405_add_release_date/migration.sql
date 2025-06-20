/*
  Warnings:

  - You are about to drop the column `date` on the `Track` table. All the data in the column will be lost.
  - Made the column `artist` on table `Track` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "date",
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ALTER COLUMN "artist" SET NOT NULL;
