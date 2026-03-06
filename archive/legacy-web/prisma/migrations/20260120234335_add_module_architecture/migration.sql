-- CreateEnum
CREATE TYPE "module_status" AS ENUM ('DRAFT', 'QUESTIONS_GENERATED', 'IN_PROGRESS', 'GENERATING_CHAPTER', 'CHAPTER_GENERATED', 'APPROVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "job_type" ADD VALUE 'GENERATE_MODULE_QUESTIONS';
ALTER TYPE "job_type" ADD VALUE 'GENERATE_MODULE_CHAPTER';
ALTER TYPE "job_type" ADD VALUE 'COMPILE_BOOK';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "bookStatus" TEXT,
ADD COLUMN     "bookTitle" TEXT,
ADD COLUMN     "compiledBookUrl" TEXT,
ADD COLUMN     "currentModuleNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalModulesCompleted" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "title" TEXT,
    "status" "module_status" NOT NULL DEFAULT 'DRAFT',
    "theme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_questions" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "response" TEXT,
    "respondedAt" TIMESTAMP(3),
    "contextSource" TEXT,
    "contextKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_chapters" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "narrativePerson" TEXT,
    "narrativeTone" TEXT,
    "narrativeStyle" TEXT,
    "structure" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modules_projectId_idx" ON "modules"("projectId");

-- CreateIndex
CREATE INDEX "modules_projectId_status_idx" ON "modules"("projectId", "status");

-- CreateIndex
CREATE INDEX "modules_projectId_moduleNumber_idx" ON "modules"("projectId", "moduleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "modules_projectId_moduleNumber_key" ON "modules"("projectId", "moduleNumber");

-- CreateIndex
CREATE INDEX "module_questions_moduleId_idx" ON "module_questions"("moduleId");

-- CreateIndex
CREATE INDEX "module_questions_moduleId_order_idx" ON "module_questions"("moduleId", "order");

-- CreateIndex
CREATE INDEX "module_chapters_moduleId_idx" ON "module_chapters"("moduleId");

-- CreateIndex
CREATE INDEX "module_chapters_moduleId_version_idx" ON "module_chapters"("moduleId", "version");

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_questions" ADD CONSTRAINT "module_questions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_chapters" ADD CONSTRAINT "module_chapters_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
