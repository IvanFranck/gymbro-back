/*
  Warnings:

  - You are about to drop the column `duree_jours` on the `types_abonnement` table. All the data in the column will be lost.
  - You are about to drop the column `niveau` on the `types_abonnement` table. All the data in the column will be lost.
  - You are about to drop the column `prix` on the `types_abonnement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "types_abonnement" DROP COLUMN "duree_jours",
DROP COLUMN "niveau",
DROP COLUMN "prix";
