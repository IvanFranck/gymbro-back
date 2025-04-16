/*
  Warnings:

  - A unique constraint covering the columns `[id_client,id_service]` on the table `client_services` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "client_services_id_client_id_service_key" ON "client_services"("id_client", "id_service");
