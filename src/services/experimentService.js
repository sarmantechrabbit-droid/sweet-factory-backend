const { prisma } = require("../config/db");

const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients)) {
    throw new Error("Ingredients must be an array");
  }

  for (const item of ingredients) {
    if (!item.name || !item.name.trim()) {
      throw new Error("Ingredient name is required");
    }

    if (!item.quantity || Number(item.quantity) <= 0) {
      throw new Error("Ingredient quantity must be greater than 0");
    }

    if (!item.unit || !item.unit.trim()) {
      throw new Error("Ingredient unit is required");
    }
  }
};

const createExperiment = async (data, userId) => {
  const {
    recipeName,
    recipeVersion,
    description,
    temperature,
    duration,
    expectedTexture,
    achievedTexture,
    expectedOutput,
    actualOutput,
    remarks,
    ingredients = [],
  } = data;

  if (!recipeName || !recipeName.trim()) {
    throw new Error("Recipe name is required");
  }

  if (!recipeVersion || !recipeVersion.trim()) {
    throw new Error("Recipe version is required");
  }

  validateIngredients(ingredients);

  if (temperature && Number(temperature) <= 0) {
    throw new Error("Temperature must be positive");
  }

  if (duration && Number(duration) <= 0) {
    throw new Error("Duration must be positive");
  }

  if (expectedOutput && Number(expectedOutput) <= 0) {
    throw new Error("Expected output must be positive");
  }

  if (actualOutput && Number(actualOutput) <= 0) {
    throw new Error("Actual output must be positive");
  }

  const experiment = await prisma.cookingExperiment.create({
    data: {
      recipeName: recipeName.trim(),
      recipeVersion: recipeVersion.trim(),
      description,
      temperature: temperature ? Number(temperature) : null,
      duration: duration ? Number(duration) : null,
      expectedTexture,
      achievedTexture,
      expectedOutput: expectedOutput
        ? Number(expectedOutput)
        : null,
      actualOutput: actualOutput
        ? Number(actualOutput)
        : null,
      remarks,
      chefId: userId,
      status: "DRAFT",

      ingredients: {
        create: ingredients.map((item) => ({
          name: item.name.trim(),
          quantity: Number(item.quantity),
          unit: item.unit.trim(),
        })),
      },
    },

    include: {
      ingredients: true,
      chef: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return experiment;
};

const getAllExperiments = async (filters) => {
  const { status, recipeName } = filters;

  const where = {
    ...(status ? { status } : {}),
    ...(recipeName
      ? {
          recipeName: {
            contains: recipeName,
            mode: "insensitive",
          },
        }
      : {}),
  };

  return await prisma.cookingExperiment.findMany({
    where,

    include: {
      chef: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      ingredients: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMyExperiments = async (userId) => {
  return await prisma.cookingExperiment.findMany({
    where: {
      chefId: userId,
    },

    include: {
      ingredients: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getExperimentById = async (id) => {
  const experiment = await prisma.cookingExperiment.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      chef: true,
      ingredients: true,
      images: true,
      reviewAnswers: true,
      sensoryEvaluations: true,
    },
  });

  if (!experiment) {
    throw new Error("Experiment not found");
  }

  return experiment;
};

const updateExperiment = async (id, data, userId) => {
  const experiment = await prisma.cookingExperiment.findUnique({
    where: {
      id: Number(id),
    },

    include: {
      ingredients: true,
    },
  });

  if (!experiment) {
    throw new Error("Experiment not found");
  }

  if (experiment.chefId !== userId) {
    throw new Error("Unauthorized");
  }

  if (experiment.status !== "DRAFT") {
    throw new Error("Only draft experiments can be updated");
  }

  const {
    recipeName,
    recipeVersion,
    description,
    temperature,
    duration,
    expectedTexture,
    achievedTexture,
    expectedOutput,
    actualOutput,
    remarks,
    ingredients = [],
  } = data;

  validateIngredients(ingredients);

  const updatedExperiment =
    await prisma.cookingExperiment.update({
      where: {
        id: Number(id),
      },

      data: {
        recipeName,
        recipeVersion,
        description,
        temperature: temperature
          ? Number(temperature)
          : null,
        duration: duration ? Number(duration) : null,
        expectedTexture,
        achievedTexture,
        expectedOutput: expectedOutput
          ? Number(expectedOutput)
          : null,
        actualOutput: actualOutput
          ? Number(actualOutput)
          : null,
        remarks,

        ingredients: {
          deleteMany: {},
          create: ingredients.map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity),
            unit: item.unit.trim(),
          })),
        },
      },

      include: {
        ingredients: true,
      },
    });

  return updatedExperiment;
};

const submitExperiment = async (id, userId) => {
  const experiment = await prisma.cookingExperiment.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!experiment) {
    throw new Error("Experiment not found");
  }

  if (experiment.chefId !== userId) {
    throw new Error("Unauthorized");
  }

  if (experiment.status !== "DRAFT") {
    throw new Error("Experiment already submitted");
  }

  return await prisma.cookingExperiment.update({
    where: {
      id: Number(id),
    },

    data: {
      status: "SUBMITTED",
    },
  });
};

const deleteExperiment = async (id, userId) => {
  const experiment = await prisma.cookingExperiment.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!experiment) {
    throw new Error("Experiment not found");
  }

  if (experiment.chefId !== userId) {
    throw new Error("Unauthorized");
  }

  if (experiment.status !== "DRAFT") {
    throw new Error("Only draft experiments can be deleted");
  }

  await prisma.cookingExperiment.delete({
    where: {
      id: Number(id),
    },
  });

  return {
    message: "Experiment deleted successfully",
  };
};

const getExperimentStats = async () => {
  const total = await prisma.cookingExperiment.count();

  const draft = await prisma.cookingExperiment.count({
    where: {
      status: "DRAFT",
    },
  });

  const submitted =
    await prisma.cookingExperiment.count({
      where: {
        status: "SUBMITTED",
      },
    });

  const perChef = await prisma.staff.findMany({
    where: {
      role: "CHEF",
    },

    select: {
      id: true,
      name: true,

      _count: {
        select: {
          experiments: true,
        },
      },
    },
  });

  return {
    total,
    draft,
    submitted,
    perChef,
  };
};

module.exports = {
  createExperiment,
  getAllExperiments,
  getMyExperiments,
  getExperimentById,
  updateExperiment,
  submitExperiment,
  deleteExperiment,
  getExperimentStats,
};