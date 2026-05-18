const { asyncHandler } = require("../utils/asyncHandler.js");
const questionService = require("../services/questionService.js");
const { success } = require("../utils/apiResponse.js");

const {
    createQuestionSchema,
    answerQuestionSchema,
    batchAnswerSchema,
    updateQuestionSchema
} = require("../validations/questionValidation.js");

const createQuestion = asyncHandler(async (req, res) => {
    const { error, value } = createQuestionSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message.replace(/"/g, "")
        });
    }

    const question = await questionService.createQuestionService(value);

    success(res, question, "Question created successfully");
});

const submitAnswer = asyncHandler(async (req, res) => {
    const { error, value } = answerQuestionSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message.replace(/"/g, "")
        });
    }

    const reviewerId = req.user.id;

    if (req.user.role !== "REVIEWER") {
        return res.status(403).json({
            success: false,
            message: "Only reviewers can submit answers"
        });
    }

    const answer = await questionService.answerQuestionService(
        value,
        reviewerId
    );

    success(res, answer, "Answer submitted");
});

const submitBatchAnswers = asyncHandler(async (req, res) => {
    const { error, value } = batchAnswerSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message.replace(/"/g, "")
        });
    }

    const reviewerId = req.user.id;

    if (req.user.role !== "REVIEWER") {
        return res.status(403).json({
            success: false,
            message: "Only reviewers can submit answers"
        });
    }

    const results = await questionService.batchAnswerQuestionsService(
        value.answers,
        reviewerId
    );

    success(res, results, `${results.length} answers submitted successfully`);
});

const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await questionService.getAllQuestionsService();

    success(res, questions, "Questions retrieved successfully");
});

const updateQuestion = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    const { error, value } = updateQuestionSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message.replace(/"/g, "")
        });
    }

    if (Object.keys(value).length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one field is required"
        });
    }

    const updated = await questionService.updateQuestionService(id, value);

    success(res, updated, "Question updated successfully");
});

const deleteQuestion = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    await questionService.deleteQuestionService(id);

    success(res, null, "Question deleted successfully");
});

module.exports = {
    createQuestion,
    submitAnswer,
    submitBatchAnswers,
    getAllQuestions,
    updateQuestion,
    deleteQuestion
};