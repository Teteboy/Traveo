-- AlterTable
ALTER TABLE "videos" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "videos_userId_idx" ON "videos"("userId");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
