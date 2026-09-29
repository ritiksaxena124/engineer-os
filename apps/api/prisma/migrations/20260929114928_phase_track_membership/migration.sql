-- DropForeignKey
ALTER TABLE "phases" DROP CONSTRAINT "phases_trackKey_fkey";

-- AlterTable
ALTER TABLE "phases" DROP COLUMN "trackKey";

-- CreateTable
CREATE TABLE "phase_tracks" (
    "id" TEXT NOT NULL,
    "phaseKey" TEXT NOT NULL,
    "trackKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "phase_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "phase_tracks_phaseKey_trackKey_key" ON "phase_tracks"("phaseKey", "trackKey");

-- AddForeignKey
ALTER TABLE "phase_tracks" ADD CONSTRAINT "phase_tracks_phaseKey_fkey" FOREIGN KEY ("phaseKey") REFERENCES "phases"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_tracks" ADD CONSTRAINT "phase_tracks_trackKey_fkey" FOREIGN KEY ("trackKey") REFERENCES "tracks"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

