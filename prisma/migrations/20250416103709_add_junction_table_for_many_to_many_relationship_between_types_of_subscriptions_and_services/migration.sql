-- CreateTable
CREATE TABLE "type_abonnement_service" (
    "id" SERIAL NOT NULL,
    "id_type_abonnement" INTEGER NOT NULL,
    "id_service" INTEGER NOT NULL,

    CONSTRAINT "type_abonnement_service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "type_abonnement_service_id_type_abonnement_id_service_key" ON "type_abonnement_service"("id_type_abonnement", "id_service");

-- AddForeignKey
ALTER TABLE "type_abonnement_service" ADD CONSTRAINT "type_abonnement_service_id_type_abonnement_fkey" FOREIGN KEY ("id_type_abonnement") REFERENCES "types_abonnement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "type_abonnement_service" ADD CONSTRAINT "type_abonnement_service_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
