-- Agregar campos para bloqueo de usuarios
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "blockedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "blockReason" TEXT;

-- Crear índice para búsquedas rápidas por estado
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- Backfill: asegurar que todos los usuarios existentes estén activos
UPDATE "User" SET "isActive" = true WHERE "isActive" IS NULL;