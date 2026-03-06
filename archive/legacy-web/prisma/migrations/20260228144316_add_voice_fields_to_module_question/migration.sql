-- AlterTable
ALTER TABLE "module_questions" ADD COLUMN     "audioFileKey" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "narrativeText" TEXT,
ADD COLUMN     "processingStatus" TEXT,
ADD COLUMN     "rawTranscript" TEXT;
