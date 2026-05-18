const { prisma } = require("../config/db");
const { createAuditLog } = require("../utils/auditLogger.js");

const createSensory = async (payload, reviewerId) => {
    // Validate sensory scores are between 1 and 10
    const sensoryFields = [
        "texturescore", "tastescore", "colorscore",
        "finalqualityscore"
    ];

    for (const field of sensoryFields) {
        const score = payload[field];
        if (score === undefined || score === null || score < 1 || score > 10) {
            throw new Error(`Invalid score for ${field}. Must be between 1 and 10.`);
        }
    }
// texturescore  tastescore colorscore finalqualityscore reviewnotes

    const evaluation = await prisma.sensoryEvaluation.create({
        data: {
            cookingExperimentId: payload.cookingExperimentId,
            reviewerId: reviewerId,

            texturescore: payload.texturescore,
            tastescore: payload.tastescore,
            colorscore: payload.colorscore,
            finalqualityscore: payload.finalqualityscore,
           

            reviewnotes: payload.reviewnotes,
        },
    });

    const expLabel = `EXP-${String(payload.cookingExperimentId).padStart(3, "0")}`;
    await createAuditLog(prisma, {
        action: "COMPLETED",
        entity: "Review",
        entityId: payload.cookingExperimentId,
        entityLabel: expLabel,
        description: `Sensory evaluation completed for ${expLabel}`,
        userId: reviewerId,
    });

    return evaluation;
};

module.exports = {
    createSensory
};