/*
  Warnings:

  - You are about to drop the column `correctWinnerPoints` on the `PointsConfig` table. All the data in the column will be lost.
  - You are about to drop the column `exactScoreBonus` on the `PointsConfig` table. All the data in the column will be lost.
  - You are about to drop the column `totalExactScorePoints` on the `PointsConfig` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MatchPhase" AS ENUM ('GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "phase" "MatchPhase" NOT NULL DEFAULT 'GROUP';

-- AlterTable
ALTER TABLE "PointsConfig" DROP COLUMN "correctWinnerPoints",
DROP COLUMN "exactScoreBonus",
DROP COLUMN "totalExactScorePoints",
ADD COLUMN     "finalPoints" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "groupStagePoints" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "quartersPoints" INTEGER NOT NULL DEFAULT 10;

-- CreateIndex
CREATE INDEX "Match_phase_idx" ON "Match"("phase");
