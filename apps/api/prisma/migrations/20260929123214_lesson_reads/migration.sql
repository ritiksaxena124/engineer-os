-- CreateTable
CREATE TABLE "lesson_reads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_reads_lessonId_idx" ON "lesson_reads"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_reads_userId_lessonId_key" ON "lesson_reads"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "lesson_reads" ADD CONSTRAINT "lesson_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_reads" ADD CONSTRAINT "lesson_reads_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

