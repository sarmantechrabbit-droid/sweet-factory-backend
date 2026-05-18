const express = require("express");

const router = express.Router();

const experimentController = require("../controllers/experimentController");

const verifyToken = require("../middleware/authMiddleware");

const allowRoles = require("../middleware/roleMiddleware");

router.post(
  "/",
  verifyToken,
  allowRoles("CHEF"),
  experimentController.createExperiment
);

router.get(
  "/",
  verifyToken,
  allowRoles("CHEF", "REVIEWER", "MANAGER"),
  experimentController.getAllExperiments
);

router.get(
  "/my",
  verifyToken,
  allowRoles("CHEF"),
  experimentController.getMyExperiments
);

router.get(
  "/stats",
  verifyToken,
  allowRoles("MANAGER"),
  experimentController.getExperimentStats
);

router.get(
  "/:id",
  verifyToken,
  allowRoles("CHEF", "REVIEWER", "MANAGER"),
  experimentController.getExperimentById
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("CHEF"),
  experimentController.updateExperiment
);

router.patch(
  "/:id/submit",
  verifyToken,
  allowRoles("CHEF"),
  experimentController.submitExperiment
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("CHEF"),
  experimentController.deleteExperiment
);

module.exports = router;