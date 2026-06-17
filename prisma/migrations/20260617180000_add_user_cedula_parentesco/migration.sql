-- Agregar columna cedula como NULLABLE inicialmente
ALTER TABLE "User" ADD COLUMN "cedula" TEXT;

-- Agregar columna parentesco (opcional)
ALTER TABLE "User" ADD COLUMN "parentesco" TEXT;

-- Backfill: asignar cédulas únicas a usuarios existentes que aún no la tengan
-- Usa el id del usuario (sin guiones) con prefijo "MIGR-" para garantizar unicidad
UPDATE "User"
SET "cedula" = 'MIGR-' || REPLACE("id", '-', '')
WHERE "cedula" IS NULL;

-- Ahora hacer cedula NOT NULL
ALTER TABLE "User" ALTER COLUMN "cedula" SET NOT NULL;

-- Crear índice único para cedula
CREATE UNIQUE INDEX "User_cedula_key" ON "User"("cedula");

-- Crear índice regular para búsquedas
CREATE INDEX "User_cedula_idx" ON "User"("cedula");