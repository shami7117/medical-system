-- Migration: add-patient-type-and-specialty-link
-- This file should be placed in: prisma/migrations/[timestamp]_add-patient-type-and-specialty-link/migration.sql

-- Step 1: Create the PatientType enum
CREATE TYPE "PatientType" AS ENUM ('EMERGENCY', 'CLINIC');

-- Step 2: Add the patientType column as optional first
ALTER TABLE "patients" ADD COLUMN "patientType" "PatientType";

-- Step 3: Add the specialtyId column as optional
ALTER TABLE "patients" ADD COLUMN "specialtyId" TEXT;

-- Step 4: Update existing patients with default values
-- Set all existing patients as EMERGENCY (safest default)
UPDATE "patients" SET "patientType" = 'EMERGENCY' WHERE "patientType" IS NULL;

-- Step 5: Now make patientType required since all rows have values
ALTER TABLE "patients" ALTER COLUMN "patientType" SET NOT NULL;

-- Step 6: Add foreign key constraint for specialtyId
ALTER TABLE "patients" ADD CONSTRAINT "patients_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Update the Specialty table to add the patients relation (if needed)
-- This might already be handled by Prisma's introspection