-- AlterTable
ALTER TABLE "question_categories" ADD COLUMN     "signalKey" TEXT;

-- AlterTable
ALTER TABLE "signals" ADD COLUMN     "evidencedByReview" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "mastery_record_signals_recordId_signalKey_key" ON "mastery_record_signals"("recordId", "signalKey");

-- AddForeignKey
ALTER TABLE "question_categories" ADD CONSTRAINT "question_categories_signalKey_fkey" FOREIGN KEY ("signalKey") REFERENCES "signals"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

