/*
  Warnings:

  - A unique constraint covering the columns `[telephone]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Made the column `telephone` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "telephone" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_telephone_key" ON "clients"("telephone");
