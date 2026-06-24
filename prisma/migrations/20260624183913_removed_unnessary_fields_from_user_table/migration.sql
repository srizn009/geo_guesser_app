/*
  Warnings:

  - You are about to drop the column `faculty` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "faculty",
DROP COLUMN "year";

-- DropEnum
DROP TYPE "Faculty";

-- DropEnum
DROP TYPE "Year";
