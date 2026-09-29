-- DropIndex
DROP INDEX "incident_steps_incidentId_position_idx";

-- DropIndex
DROP INDEX "mastery_records_userId_topicId_idx";

-- DropIndex
DROP INDEX "question_expected_concepts_questionId_idx";

-- DropIndex
DROP INDEX "topics_phaseKey_number_idx";

-- DropIndex
DROP INDEX "track_memberships_userId_trackKey_idx";

-- AlterTable
ALTER TABLE "review_schedules" ADD COLUMN     "activeMarker" INTEGER DEFAULT 1;

-- AlterTable
ALTER TABLE "topics" ADD COLUMN     "activeMarker" INTEGER DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "incident_steps_incidentId_position_key" ON "incident_steps"("incidentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "mastery_records_userId_topicId_key" ON "mastery_records"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "question_expected_concepts_questionId_conceptId_key" ON "question_expected_concepts"("questionId", "conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "review_schedules_userId_questionId_activeMarker_key" ON "review_schedules"("userId", "questionId", "activeMarker");

-- CreateIndex
CREATE INDEX "topics_phaseKey_idx" ON "topics"("phaseKey");

-- CreateIndex
CREATE UNIQUE INDEX "topics_phaseKey_number_activeMarker_key" ON "topics"("phaseKey", "number", "activeMarker");

-- CreateIndex
CREATE UNIQUE INDEX "track_memberships_userId_trackKey_key" ON "track_memberships"("userId", "trackKey");

