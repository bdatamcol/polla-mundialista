-- CreateTable
CREATE TABLE "UserPositionSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPositionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPositionSnapshot_userId_takenAt_idx" ON "UserPositionSnapshot"("userId", "takenAt");

-- CreateIndex
CREATE INDEX "UserPositionSnapshot_takenAt_idx" ON "UserPositionSnapshot"("takenAt");

-- AddForeignKey
ALTER TABLE "UserPositionSnapshot" ADD CONSTRAINT "UserPositionSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
