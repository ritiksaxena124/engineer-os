-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL DEFAULT 'learner',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedBy" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "track_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "track_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phases" (
    "key" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trackKey" TEXT NOT NULL,

    CONSTRAINT "phases_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phaseKey" TEXT NOT NULL,
    "skillKey" TEXT,
    "unlockRequiredLevel" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_prerequisites" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "critical" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "topic_prerequisites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_sections" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "body" TEXT NOT NULL,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_section_kinds" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "lesson_section_kinds_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "question_categories" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "asks" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "question_categories_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "isDiagnostic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT NOT NULL,
    "lessonId" TEXT,
    "categoryKey" TEXT NOT NULL,
    "levelKey" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "shortAnswer" TEXT NOT NULL,
    "idealAnswer" TEXT NOT NULL,
    "deepAnswer" TEXT NOT NULL,
    "commonMistakes" TEXT NOT NULL,
    "whyWrong" TEXT NOT NULL,
    "followUps" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_expected_concepts" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "question_expected_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_levels" (
    "key" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "capability" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mastery_levels_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "signals" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "levelKey" TEXT NOT NULL,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "mastery_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "levelKey" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mastery_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_record_signals" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "signalKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "evidenceCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "mastery_record_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mastery_events" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "fromLevel" TEXT NOT NULL,
    "toLevel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mastery_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "sessionId" TEXT,
    "answerText" TEXT NOT NULL,
    "verdictKey" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "missingConcepts" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_verdicts" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "attempt_verdicts_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "starterCode" TEXT NOT NULL,
    "testSpec" TEXT NOT NULL,
    "hiddenTests" TEXT NOT NULL,
    "hintChain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT NOT NULL,
    "lessonId" TEXT,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brief" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "checklist" TEXT NOT NULL,
    "rubric" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phaseKey" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typeKey" TEXT NOT NULL,
    "topicSlug" TEXT,
    "plannedMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "summary" TEXT NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_types" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "session_types_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "review_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "intervalDays" INTEGER NOT NULL,
    "lapseCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "review_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mistakes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "lesson" TEXT NOT NULL,
    "conceptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "architecture_decisions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "alternatives" TEXT NOT NULL,
    "tradeoffs" TEXT NOT NULL,
    "consequences" TEXT NOT NULL,
    "statusKey" TEXT NOT NULL DEFAULT 'proposed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "architecture_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severityKey" TEXT NOT NULL,
    "phaseKey" TEXT,
    "alertText" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "logs" TEXT NOT NULL,
    "traces" TEXT NOT NULL,
    "rootCause" TEXT NOT NULL,
    "mitigations" TEXT NOT NULL,
    "permanentFix" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_steps" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,

    CONSTRAINT "incident_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "whyUsed" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" TEXT NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modeKey" TEXT NOT NULL,
    "topicSlug" TEXT,
    "prompt" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "rubricScores" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "phaseKey" TEXT,
    "passRule" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_parts" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "instructions" TEXT NOT NULL,
    "questionIds" TEXT NOT NULL,

    CONSTRAINT "assessment_parts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "track_memberships_userId_trackKey_idx" ON "track_memberships"("userId", "trackKey");

-- CreateIndex
CREATE UNIQUE INDEX "phases_number_key" ON "phases"("number");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_phaseKey_number_idx" ON "topics"("phaseKey", "number");

-- CreateIndex
CREATE INDEX "topic_prerequisites_topicId_idx" ON "topic_prerequisites"("topicId");

-- CreateIndex
CREATE INDEX "topic_prerequisites_prerequisiteId_idx" ON "topic_prerequisites"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_slug_key" ON "concepts"("slug");

-- CreateIndex
CREATE INDEX "concepts_topicId_idx" ON "concepts"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_topicId_idx" ON "lessons"("topicId");

-- CreateIndex
CREATE INDEX "lesson_sections_lessonId_position_idx" ON "lesson_sections"("lessonId", "position");

-- CreateIndex
CREATE INDEX "questions_topicId_categoryKey_idx" ON "questions"("topicId", "categoryKey");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_questionId_key" ON "question_answers"("questionId");

-- CreateIndex
CREATE INDEX "question_expected_concepts_questionId_idx" ON "question_expected_concepts"("questionId");

-- CreateIndex
CREATE INDEX "mastery_records_userId_topicId_idx" ON "mastery_records"("userId", "topicId");

-- CreateIndex
CREATE INDEX "mastery_record_signals_recordId_idx" ON "mastery_record_signals"("recordId");

-- CreateIndex
CREATE INDEX "mastery_events_recordId_idx" ON "mastery_events"("recordId");

-- CreateIndex
CREATE INDEX "attempts_userId_questionId_idx" ON "attempts"("userId", "questionId");

-- CreateIndex
CREATE INDEX "attempts_createdAt_idx" ON "attempts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");

-- CreateIndex
CREATE INDEX "exercises_topicId_idx" ON "exercises"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_phaseKey_idx" ON "projects"("phaseKey");

-- CreateIndex
CREATE INDEX "learning_sessions_userId_startedAt_idx" ON "learning_sessions"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "review_schedules_userId_dueAt_idx" ON "review_schedules"("userId", "dueAt");

-- CreateIndex
CREATE INDEX "mistakes_userId_createdAt_idx" ON "mistakes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "journal_entries_userId_createdAt_idx" ON "journal_entries"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "architecture_decisions_slug_key" ON "architecture_decisions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_slug_key" ON "incidents"("slug");

-- CreateIndex
CREATE INDEX "incident_steps_incidentId_position_idx" ON "incident_steps"("incidentId", "position");

-- CreateIndex
CREATE INDEX "resources_topicId_idx" ON "resources"("topicId");

-- CreateIndex
CREATE INDEX "interview_sessions_userId_startedAt_idx" ON "interview_sessions"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_slug_key" ON "assessments"("slug");

-- CreateIndex
CREATE INDEX "assessment_parts_assessmentId_position_idx" ON "assessment_parts"("assessmentId", "position");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_memberships" ADD CONSTRAINT "track_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_memberships" ADD CONSTRAINT "track_memberships_trackKey_fkey" FOREIGN KEY ("trackKey") REFERENCES "tracks"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phases" ADD CONSTRAINT "phases_trackKey_fkey" FOREIGN KEY ("trackKey") REFERENCES "tracks"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_phaseKey_fkey" FOREIGN KEY ("phaseKey") REFERENCES "phases"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_skillKey_fkey" FOREIGN KEY ("skillKey") REFERENCES "skills"("key") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_prerequisites" ADD CONSTRAINT "topic_prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_kindKey_fkey" FOREIGN KEY ("kindKey") REFERENCES "lesson_section_kinds"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_categoryKey_fkey" FOREIGN KEY ("categoryKey") REFERENCES "question_categories"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_levelKey_fkey" FOREIGN KEY ("levelKey") REFERENCES "mastery_levels"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_expected_concepts" ADD CONSTRAINT "question_expected_concepts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_expected_concepts" ADD CONSTRAINT "question_expected_concepts_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signals" ADD CONSTRAINT "signals_levelKey_fkey" FOREIGN KEY ("levelKey") REFERENCES "mastery_levels"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_levelKey_fkey" FOREIGN KEY ("levelKey") REFERENCES "mastery_levels"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_record_signals" ADD CONSTRAINT "mastery_record_signals_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "mastery_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_record_signals" ADD CONSTRAINT "mastery_record_signals_signalKey_fkey" FOREIGN KEY ("signalKey") REFERENCES "signals"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_events" ADD CONSTRAINT "mastery_events_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "mastery_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_verdictKey_fkey" FOREIGN KEY ("verdictKey") REFERENCES "attempt_verdicts"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_phaseKey_fkey" FOREIGN KEY ("phaseKey") REFERENCES "phases"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_typeKey_fkey" FOREIGN KEY ("typeKey") REFERENCES "session_types"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_schedules" ADD CONSTRAINT "review_schedules_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mistakes" ADD CONSTRAINT "mistakes_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "architecture_decisions" ADD CONSTRAINT "architecture_decisions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_steps" ADD CONSTRAINT "incident_steps_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_parts" ADD CONSTRAINT "assessment_parts_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
