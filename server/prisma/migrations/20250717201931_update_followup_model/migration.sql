/*
  Warnings:

  - You are about to drop the column `date` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `FollowUp` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `FollowUp` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `FollowUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `FollowUp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextFollowupDate` to the `FollowUp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_userId_fkey";

-- AlterTable
ALTER TABLE "FollowUp" DROP COLUMN "date",
DROP COLUMN "notes",
DROP COLUMN "userId",
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "nextFollowupDate" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
