-- DropForeignKey
ALTER TABLE "patients" DROP CONSTRAINT "patients_specialtyId_fkey";

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
