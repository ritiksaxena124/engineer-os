-- CreateTable
CREATE TABLE "interview_scenarios" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "ticketTitle" TEXT NOT NULL,
    "ticketBody" TEXT NOT NULL,
    "signalNotes" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "interview_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_scenario_files" (
    "id" TEXT NOT NULL,
    "scenarioSlug" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isCheck" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "interview_scenario_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_scenario_fixes" (
    "id" TEXT NOT NULL,
    "scenarioSlug" TEXT NOT NULL,
    "requiredText" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fixedText" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "interview_scenario_fixes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_rooms" (
    "id" TEXT NOT NULL,
    "scenarioSlug" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "candidateLabel" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "openMinutes" INTEGER NOT NULL,
    "openedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_room_files" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "contents" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_room_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_room_events" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "kindKey" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "outcome" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_room_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_scenarios_slug_key" ON "interview_scenarios"("slug");

-- CreateIndex
CREATE INDEX "interview_scenario_files_scenarioSlug_position_idx" ON "interview_scenario_files"("scenarioSlug", "position");

-- CreateIndex
CREATE UNIQUE INDEX "interview_scenario_files_scenarioSlug_path_key" ON "interview_scenario_files"("scenarioSlug", "path");

-- CreateIndex
CREATE INDEX "interview_scenario_fixes_scenarioSlug_position_idx" ON "interview_scenario_fixes"("scenarioSlug", "position");

-- CreateIndex
CREATE UNIQUE INDEX "interview_rooms_tokenHash_key" ON "interview_rooms"("tokenHash");

-- CreateIndex
CREATE INDEX "interview_rooms_scenarioSlug_idx" ON "interview_rooms"("scenarioSlug");

-- CreateIndex
CREATE INDEX "interview_rooms_hostUserId_createdAt_idx" ON "interview_rooms"("hostUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "interview_room_files_roomId_path_key" ON "interview_room_files"("roomId", "path");

-- CreateIndex
CREATE INDEX "interview_room_events_roomId_createdAt_idx" ON "interview_room_events"("roomId", "createdAt");

-- AddForeignKey
ALTER TABLE "interview_scenario_files" ADD CONSTRAINT "interview_scenario_files_scenarioSlug_fkey" FOREIGN KEY ("scenarioSlug") REFERENCES "interview_scenarios"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scenario_fixes" ADD CONSTRAINT "interview_scenario_fixes_scenarioSlug_fkey" FOREIGN KEY ("scenarioSlug") REFERENCES "interview_scenarios"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_rooms" ADD CONSTRAINT "interview_rooms_scenarioSlug_fkey" FOREIGN KEY ("scenarioSlug") REFERENCES "interview_scenarios"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_rooms" ADD CONSTRAINT "interview_rooms_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_room_files" ADD CONSTRAINT "interview_room_files_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "interview_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_room_events" ADD CONSTRAINT "interview_room_events_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "interview_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

