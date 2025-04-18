/*
  Warnings:

  - Added the required column `id_tarif_abonnement` to the `abonnements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_abonnement` to the `tarifs_abonnement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "abonnements" ADD COLUMN     "id_tarif_abonnement" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tarifs_abonnement" ADD COLUMN     "id_abonnement" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_id_tarif_abonnement_fkey" FOREIGN KEY ("id_tarif_abonnement") REFERENCES "tarifs_abonnement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
