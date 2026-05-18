/*
  Warnings:

  - You are about to drop the column `aromaticVolatility` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `cellularFreshness` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `chromaticAppeal` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `finalExpertNote` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `lipidSaturation` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `palatePersistence` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `scovillePerception` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `sodiumProjection` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `structuralIntegrity` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `tasteConsistency` on the `SensoryEvaluation` table. All the data in the column will be lost.
  - Added the required column `colorscore` to the `SensoryEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalqualityscore` to the `SensoryEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tastescore` to the `SensoryEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `texturescore` to the `SensoryEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SensoryEvaluation" DROP COLUMN "aromaticVolatility",
DROP COLUMN "cellularFreshness",
DROP COLUMN "chromaticAppeal",
DROP COLUMN "finalExpertNote",
DROP COLUMN "lipidSaturation",
DROP COLUMN "palatePersistence",
DROP COLUMN "scovillePerception",
DROP COLUMN "sodiumProjection",
DROP COLUMN "structuralIntegrity",
DROP COLUMN "tasteConsistency",
ADD COLUMN     "colorscore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "finalqualityscore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "reviewnotes" TEXT,
ADD COLUMN     "tastescore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "texturescore" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE INDEX "SensoryEvaluation_cookingExperimentId_idx" ON "SensoryEvaluation"("cookingExperimentId");

-- CreateIndex
CREATE INDEX "SensoryEvaluation_reviewerId_idx" ON "SensoryEvaluation"("reviewerId");
