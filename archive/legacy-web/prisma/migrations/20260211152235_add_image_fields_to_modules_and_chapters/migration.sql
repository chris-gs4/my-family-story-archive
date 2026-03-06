-- AlterTable
ALTER TABLE "module_chapters" ADD COLUMN     "illustrationGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "illustrationPrompt" TEXT,
ADD COLUMN     "illustrationUrl" TEXT;

-- AlterTable
ALTER TABLE "modules" ADD COLUMN     "coverImageGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "coverImagePrompt" TEXT,
ADD COLUMN     "coverImageUrl" TEXT;
