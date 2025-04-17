/*
  Warnings:

  - You are about to drop the column `id_abonnement` on the `tarifs_abonnement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tarifs_abonnement" DROP COLUMN "id_abonnement",
ADD COLUMN     "actif" BOOLEAN DEFAULT true;
