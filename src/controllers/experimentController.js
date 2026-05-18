const { asyncHandler } = require("../utils/asyncHandler");
const experimentService = require("../services/experimentService");
const { success } = require("../utils/apiResponse");
const {
  createExperimentSchema,
  updateExperimentSchema,
} = require("../validations/experimentValidation");

const createExperiment = asyncHandler(async (req, res) => {
  const chefId = req.user.id;

  // ✅ role check
  if (
    req.user.role !== "CHEF" &&
    req.user.role !== "MANAGER"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Only chefs and managers can create experiments",
    });
  }

  // ✅ image handling
  const imageUrls = (req.files || []).map(
    (file) => file.path
  );

  if (imageUrls.length > 3) {
    return res.status(400).json({
      success: false,
      message: "Maximum 3 images allowed",
    });
  }

  // ✅ ingredients parsing
  let ingredients = req.body.ingredients;

  if (typeof ingredients === "string") {
    try {
      ingredients = JSON.parse(ingredients);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ingredients format",
      });
    }
  }

  if (
    !ingredients ||
    !Array.isArray(ingredients) ||
    ingredients.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "At least one ingredient is required",
    });
  }

  // ✅ payload
  const payload = {
    ...req.body,
    ingredients,
    imageUrls,
    chefId,
  };

  // ✅ joi validation
  const { error, value } =
    createExperimentSchema.validate(
      payload,
      {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
      }
    );

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details
        .map((e) => e.message)
        .join(", "),
    });
  }

  // ✅ create experiment
  const experiment =
    await experimentService.createExperiment(
      value
    );

  return success(
    res,
    experiment,
    "Experiment created successfully"
  );
});

const getAllExperiments = asyncHandler(
  async (req, res) => {
    const { search, status, page, limit } =
      req.query;

    let chefId;

    if (req.user.role === "CHEF") {
      chefId = req.user.id;
    }

    const experiments =
      await experimentService.getAllExperiments({
        search,
        status,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        chefId,
      });

    return success(
      res,
      experiments,
      "Experiments fetched successfully"
    );
  }
);

const getMyExperiments = asyncHandler(
  async (req, res) => {
    const experiments =
      await experimentService.getMyExperiments(
        req.user.id
      );

    return success(
      res,
      experiments,
      "My experiments fetched successfully"
    );
  }
);

const getExperimentById = asyncHandler(
  async (req, res) => {
    const experiment =
      await experimentService.getExperimentById(
        Number(req.params.id)
      );

    return success(
      res,
      experiment,
      "Experiment fetched successfully"
    );
  }
);

const updateExperiment = asyncHandler(
  async (req, res) => {
    let ingredients = req.body.ingredients;

    // ✅ parse ingredients
    if (typeof ingredients === "string") {
      try {
        ingredients = JSON.parse(ingredients);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid ingredients format",
        });
      }
    }

    const payload = {
      ...req.body,
      ingredients,
    };

    // ✅ validation
    const { error, value } =
      updateExperimentSchema.validate(
        payload,
        {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true,
        }
      );

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details
          .map((e) => e.message)
          .join(", "),
      });
    }

    const experiment =
      await experimentService.updateExperiment(
        Number(req.params.id),
        value,
        req.user.id
      );

    return success(
      res,
      experiment,
      "Experiment updated successfully"
    );
  }
);

const submitExperiment = asyncHandler(
  async (req, res) => {
    const experiment =
      await experimentService.submitExperiment(
        Number(req.params.id),
        req.user.id
      );

    return success(
      res,
      experiment,
      "Experiment submitted successfully"
    );
  }
);

const deleteExperiment = asyncHandler(
  async (req, res) => {
    const result =
      await experimentService.deleteExperiment(
        Number(req.params.id),
        req.user.id
      );

    return success(
      res,
      result,
      "Experiment deleted successfully"
    );
  }
);

const getExperimentStats = asyncHandler(
  async (req, res) => {
    const stats =
      await experimentService.getExperimentStats();

    return success(
      res,
      stats,
      "Experiment stats fetched successfully"
    );
  }
);

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