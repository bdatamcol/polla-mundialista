/*
  Warnings:

  - You are about to drop the column `finalPoints` on the `PointsConfig` table. All the data in the column will be lost.
  - You are about to drop the column `groupStagePoints` on the `PointsConfig` table. All the data in the column will be lost.
  - You are about to drop the column `quartersPoints` on the `PointsConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PointsConfig" DROP COLUMN "finalPoints",
DROP COLUMN "groupStagePoints",
DROP COLUMN "quartersPoints",
ADD COLUMN     "finalistPoints" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "matchPoints" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "semifinalistPoints" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "finalistPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FinalistPrediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "semifinalist1" TEXT,
    "semifinalist2" TEXT,
    "semifinalist3" TEXT,
    "semifinalist4" TEXT,
    "finalist1" TEXT,
    "finalist2" TEXT,
    "semifinalPoints" INTEGER NOT NULL DEFAULT 0,
    "finalPoints" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "semisCorrect" INTEGER NOT NULL DEFAULT 0,
    "finalsCorrect" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalistPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FinalistPrediction_userId_key" ON "FinalistPrediction"("userId");

-- AddForeignKey
ALTER TABLE "FinalistPrediction" ADD CONSTRAINT "FinalistPrediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
