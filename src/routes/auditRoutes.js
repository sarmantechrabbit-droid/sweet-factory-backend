const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController.js");
const verifyToken = require("../middleware/authMiddleware.js");

router.get("/", verifyToken, getAuditLogs);

module.exports = router;
