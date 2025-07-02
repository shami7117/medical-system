-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "arrivalTime" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT DEFAULT 'Routine',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Waiting';
