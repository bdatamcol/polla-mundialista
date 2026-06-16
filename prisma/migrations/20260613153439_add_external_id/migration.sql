/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "awayTeamFull" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "homeTeamFull" TEXT,
ADD COLUMN     "lastSyncAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

-- CreateIndex
CREATE INDEX "Match_externalId_idx" ON "Match"("externalId");
