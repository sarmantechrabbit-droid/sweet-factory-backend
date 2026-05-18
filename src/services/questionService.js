const { prisma } = require("../config/db.js");
const { createAuditLog } = require("../utils/auditLogger.js");

const createQuestionService = async (data) => {
    const existing = await prisma.reviewQuestion.findFirst({
        where: {
            question: { equals: data.question, mode: "insensitive" },
            deletedAt: null
        }
    });

    if (existing) {
        const error = new Error("Question already exists");
        error.statusCode = 400;
        throw error;
    }

    const question = await prisma.reviewQuestion.create({
        data: {
            question: data.question,
            type:     data.type,
            config:   data.config || null,
        },
    });

    await createAuditLog(prisma, {
        action:      "CREATED",
        entity:      "Question",
        entityId:    question.id,
        entityLabel: `Q-${String(question.id).padStart(3, "0")}`,
        description: `Review question added: "${data.question.slice(0, 60)}${data.question.length > 60 ? "…" : ""}"`,
        userId:      null,
    });

    return question;
};

const answerQuestionService = async (data, reviewerId) => {
    const answer = await prisma.reviewAnswer.create({
        data: {
            questionId:   data.questionId,
            experimentId: data.experimentId,
            reviewerId:   reviewerId,
            answerValue:  data.answerValue,
        },
    });

    const expLabel = `EXP-${String(data.experimentId).padStart(3, "0")}`;
    await createAuditLog(prisma, {
        action:      "ANSWERED",
        entity:      "Review",
        entityId:    data.experimentId,
        entityLabel: expLabel,
        description: `Compliance question answered for ${expLabel}`,
        userId:      reviewerId,
    });

    return answer;
};

const batchAnswerQuestionsService = async (answers, reviewerId) => {
    if (!Array.isArray(answers) || answers.length === 0) return [];

    const experimentId = answers[0].experimentId;

    // Use transaction for atomic creation
    const results = await prisma.$transaction(
        answers.map((ans) =>
            prisma.reviewAnswer.create({
                data: {
                    questionId: ans.questionId,
                    experimentId: ans.experimentId,
                    reviewerId: reviewerId,
                    answerValue: ans.answerValue,
                },
            })
        )
    );

    const expLabel = `EXP-${String(experimentId).padStart(3, "0")}`;
    await createAuditLog(prisma, {
        action: "ANSWERED",
        entity: "Review",
        entityId: experimentId,
        entityLabel: expLabel,
        description: `Compliance batch (${answers.length} answers) submitted for ${expLabel}`,
        userId: reviewerId,
    });

    return results;
};


const getAllQuestionsService = async () => {
    return prisma.reviewQuestion.findMany({
        where: { deletedAt: null },
        orderBy: {
            createdAt: "desc"
        }
    });
};

const updateQuestionService = async (id, data) => {
    const existing = await prisma.reviewQuestion.findFirst({
        where: { id, deletedAt: null }
    });
    if (!existing) throw new Error("Question not found");

    if (data.question) {
        const duplicate = await prisma.reviewQuestion.findFirst({
            where: {
                question: { equals: data.question, mode: "insensitive" },
                deletedAt: null,
                id: { not: id }
            }
        });
        if (duplicate) {
            const error = new Error("Another question with same text already exists");
            error.statusCode = 400;
            throw error;
        }
    }

    const updated = await prisma.reviewQuestion.update({
        where: { id },
        data: {
            ...(data.question !== undefined && { question: data.question }),
            ...(data.type     !== undefined && { type:     data.type }),
            ...(data.config   !== undefined && { config:   data.config }),
        },
    });

    await createAuditLog(prisma, {
        action:      "UPDATED",
        entity:      "Question",
        entityId:    id,
        entityLabel: `Q-${String(id).padStart(3, "0")}`,
        description: `Review question Q-${String(id).padStart(3, "0")} updated`,
        userId:      null,
    });

    return updated;
};

const deleteQuestionService = async (id) => {
    const existing = await prisma.reviewQuestion.findFirst({
        where: { id, deletedAt: null }
    });
    if (!existing) throw new Error("Question not found");

    const deleted = await prisma.reviewQuestion.update({
        where: { id },
        data: { deletedAt: new Date() }
    });

    await createAuditLog(prisma, {
        action:      "DELETED",
        entity:      "Question",
        entityId:    id,
        entityLabel: `Q-${String(id).padStart(3, "0")}`,
        description: `Review question Q-${String(id).padStart(3, "0")} removed from question bank (Soft Deleted)`,
        userId:      null,
    });

    return deleted;
};

module.exports = {
    createQuestionService,
    answerQuestionService,
    batchAnswerQuestionsService,
    getAllQuestionsService,
    updateQuestionService,
    deleteQuestionService
};