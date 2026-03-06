-- CreateEnum
CREATE TYPE "journal_entry_status" AS ENUM ('RECORDING', 'UPLOADED', 'PROCESSING', 'COMPLETE', 'ERROR');

-- AlterEnum
ALTER TYPE "job_type" ADD VALUE 'PROCESS_JOURNAL_ENTRY';

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT,
    "audioFileKey" TEXT,
    "rawTranscript" TEXT,
    "narrativeText" TEXT,
    "promptText" TEXT,
    "status" "journal_entry_status" NOT NULL DEFAULT 'RECORDING',
    "wordCount" INTEGER,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "journal_entries_projectId_idx" ON "journal_entries"("projectId");

-- CreateIndex
CREATE INDEX "journal_entries_projectId_entryDate_idx" ON "journal_entries"("projectId", "entryDate");

-- CreateIndex
CREATE INDEX "journal_entries_status_idx" ON "journal_entries"("status");

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
