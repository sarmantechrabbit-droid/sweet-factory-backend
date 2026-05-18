const Joi = require("joi");

const ingredientSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Ingredient name is required",
    "any.required": "Ingredient name is required",
  }),

  quantity: Joi.number().positive().required().messages({
    "number.base": "Ingredient quantity must be a number",
    "number.positive": "Ingredient quantity must be greater than 0",
    "any.required": "Ingredient quantity is required",
  }),

  unit: Joi.string().trim().required().messages({
    "string.empty": "Ingredient unit is required",
    "any.required": "Ingredient unit is required",
  }),
});

const createExperimentSchema = Joi.object({
  // Step 1 — Basic Info
  recipeName: Joi.string().trim().required().messages({
    "string.empty": "Recipe name is required",
    "any.required": "Recipe name is required",
  }),

  recipeVersion: Joi.string().trim().required().messages({
    "string.empty": "Recipe version is required",
    "any.required": "Recipe version is required",
  }),

  category: Joi.string().trim().allow("", null),

  description: Joi.string().allow("", null),

  chefId: Joi.number().required(),

  imageUrls: Joi.array().items(Joi.string()),

  // Step 2 — Ingredients
  ingredients: Joi.array()
    .items(ingredientSchema)
    .min(1)
    .required()
    .messages({
      "array.min": "At least one ingredient is required",
      "any.required": "Ingredients are required",
    }),

  // Step 3 — Process Parameters
  temperature: Joi.number().positive().allow(null),

  duration: Joi.number().integer().positive().allow(null),

  cookingMethod: Joi.string().allow("", null),

  sugar: Joi.number().min(0).allow(null),

  milk: Joi.number().min(0).allow(null),

  ghee: Joi.number().min(0).allow(null),

  water: Joi.number().min(0).allow(null),

  coolTemp: Joi.number().allow(null),

  coolDur: Joi.number().integer().allow(null),

  mixTime: Joi.number().integer().allow(null),

  expectedOutput: Joi.number().positive().allow(null),

  actualOutput: Joi.number().positive().allow(null),

  // Step 4 — Quality Targets
  expectedTexture: Joi.string().allow("", null),

  achievedTexture: Joi.string().allow("", null),

  textureTarget: Joi.number().min(0).max(100).allow(null),

  textureActual: Joi.number().min(0).max(100).allow(null),

  colorTarget: Joi.number().min(0).max(100).allow(null),

  colorActual: Joi.number().min(0).max(100).allow(null),

  tasteTarget: Joi.number().min(0).max(100).allow(null),

  tasteActual: Joi.number().min(0).max(100).allow(null),

  finalScore: Joi.number().min(0).max(100).allow(null),

  // Optional fields
  experimentDate: Joi.date().allow(null),

  experimentTime: Joi.string().allow("", null),

  remarks: Joi.string().allow("", null),

  status: Joi.string().valid("DRAFT", "SUBMITTED").optional(),
});

module.exports = {
  createExperimentSchema,
};