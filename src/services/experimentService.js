const { prisma } = require("../config/db");

const createExperimentService = async (data) => {
  const experiment = await prisma.cookingExperiment.create({
    data: {
      recipeName: data.recipeName,
      recipeVersion: data.recipeVersion,
      description: data.description,

      chefId: data.chefId,

      ingredients: {
        create: (data.ingredients || []).map((ing) => ({
          name: ing.name,
          quantity: Number(ing.quantity),
          unit: ing.unit,
        })),
      },
    },

    include: {
      ingredients: true,
    },
  });

  return experiment;
};

module.exports = {
  createExperimentService,
};