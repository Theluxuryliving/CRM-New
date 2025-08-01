-- CreateEnum
CREATE TYPE "FollowupStatus" AS ENUM ('PENDING', 'DONE', 'MISSED', 'RESCHEDULED');

-- CreateTable
CREATE TABLE "FollowUpLog" (
    "id" SERIAL NOT NULL,
    "followupId" INTEGER NOT NULL,
    "status" "FollowupStatus" NOT NULL,
    "updatedById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowUpLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FollowUpLog" ADD CONSTRAINT "FollowUpLog_followupId_fkey" FOREIGN KEY ("followupId") REFERENCES "FollowUp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpLog" ADD CONSTRAINT "FollowUpLog_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
