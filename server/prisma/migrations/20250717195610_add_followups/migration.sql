/*
  Warnings:

  - You are about to drop the column `followUpDate` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `FollowUp` table. All the data in the column will be lost.
  - Added the required column `notes` to the `FollowUp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FollowUp" DROP COLUMN "followUpDate",
DROP COLUMN "note",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT NOT NULL;
