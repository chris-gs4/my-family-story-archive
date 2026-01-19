-- AlterTable
ALTER TABLE "interview_questions" ADD COLUMN     "batch" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "interview_questions_projectId_batch_idx" ON "interview_questions"("projectId", "batch");
