const experimentService = require("../services/experimentService");

const createExperiment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      chefId: req.user.id,
    };

    const experiment =
      await experimentService.createExperimentService(data);

    res.status(201).json({
      success: true,
      message: "Experiment created successfully",
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExperiment,
};