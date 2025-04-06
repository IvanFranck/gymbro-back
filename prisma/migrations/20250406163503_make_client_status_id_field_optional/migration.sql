-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_id_statut_fkey";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "id_statut" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_id_statut_fkey" FOREIGN KEY ("id_statut") REFERENCES "statuts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
