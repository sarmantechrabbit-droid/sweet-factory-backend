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

module.exports = router;