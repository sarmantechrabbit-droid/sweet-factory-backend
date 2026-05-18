-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MANAGER', 'CHEF', 'REVIEWER', 'CRA');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "entityLabel" TEXT,
    "description" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CookingExperiment" (
    "id" SERIAL NOT NULL,
    "recipeName" TEXT NOT NULL,
    "recipeVersion" TEXT NOT NULL,
    "recipeId" INTEGER,
    "experimentDate" TIMESTAMP(3),
    "experimentTime" TEXT,
    "temperature" DOUBLE PRECISION,
    "duration" INTEGER,
    "expectedTexture" TEXT,
    "achievedTexture" TEXT,
    "expectedOutput" DOUBLE PRECISION,
    "actualOutput" DOUBLE PRECISION,
    "remarks" TEXT,
    "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chefId" INTEGER,

    CONSTRAINT "CookingExperiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperimentImage" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "experimentId" INTEGER NOT NULL,

    CONSTRAINT "ExperimentImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "experimentId" INTEGER NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientCatalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngredientCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeReportCache" (
    "id" SERIAL NOT NULL,
    "recipeName" TEXT NOT NULL,
    "dataSignature" TEXT NOT NULL,
    "reportUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipeReportCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAnswer" (
    "id" SERIAL NOT NULL,
    "answerValue" JSONB NOT NULL,
    "questionId" INTEGER NOT NULL,
    "experimentId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensoryEvaluation" (
    "id" SERIAL NOT NULL,
    "cookingExperimentId" INTEGER NOT NULL,
    "reviewerId" INTEGER,
    "tasteConsistency" DOUBLE PRECISION NOT NULL,
    "aromaticVolatility" DOUBLE PRECISION NOT NULL,
    "sodiumProjection" DOUBLE PRECISION NOT NULL,
    "chromaticAppeal" DOUBLE PRECISION NOT NULL,
    "structuralIntegrity" DOUBLE PRECISION NOT NULL,
    "scovillePerception" DOUBLE PRECISION NOT NULL,
    "lipidSaturation" DOUBLE PRECISION NOT NULL,
    "cellularFreshness" DOUBLE PRECISION NOT NULL,
    "palatePersistence" DOUBLE PRECISION NOT NULL,
    "finalExpertNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensoryEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientCatalog_name_key" ON "IngredientCatalog"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_name_key" ON "Recipe"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeReportCache_recipeName_dataSignature_key" ON "RecipeReportCache"("recipeName", "dataSignature");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CookingExperiment" ADD CONSTRAINT "CookingExperiment_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CookingExperiment" ADD CONSTRAINT "CookingExperiment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperimentImage" ADD CONSTRAINT "ExperimentImage_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "CookingExperiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "CookingExperiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAnswer" ADD CONSTRAINT "ReviewAnswer_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "CookingExperiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAnswer" ADD CONSTRAINT "ReviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ReviewQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAnswer" ADD CONSTRAINT "ReviewAnswer_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensoryEvaluation" ADD CONSTRAINT "SensoryEvaluation_cookingExperimentId_fkey" FOREIGN KEY ("cookingExperimentId") REFERENCES "CookingExperiment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensoryEvaluation" ADD CONSTRAINT "SensoryEvaluation_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
