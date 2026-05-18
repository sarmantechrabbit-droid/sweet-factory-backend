const express = require("express");
const {
    createQuestion,
    submitAnswer,
    submitBatchAnswers,
    getAllQuestions,
    updateQuestion,
    deleteQuestion
} = require("../controllers/questionController.js");
const verifyToken = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/", verifyToken, getAllQuestions);
router.post("/", verifyToken, createQuestion);
router.post("/answer", verifyToken, submitAnswer);
router.post("/batch-answer", verifyToken, submitBatchAnswers);
router.put("/:id", verifyToken, updateQuestion);
router.delete("/:id", verifyToken, deleteQuestion);

module.exports = router;