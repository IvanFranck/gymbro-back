-- CreateTable
CREATE TABLE "tarifs_abonnement" (
    "id" SERIAL NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "genre" TEXT NOT NULL,
    "duree_jours" INTEGER NOT NULL,
    "id_type_abonnement" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifs_abonnement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tarifs_abonnement_id_type_abonnement_genre_duree_jours_key" ON "tarifs_abonnement"("id_type_abonnement", "genre", "duree_jours");

-- AddForeignKey
ALTER TABLE "tarifs_abonnement" ADD CONSTRAINT "tarifs_abonnement_id_type_abonnement_fkey" FOREIGN KEY ("id_type_abonnement") REFERENCES "types_abonnement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
