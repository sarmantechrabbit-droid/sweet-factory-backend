const createAuditLog = async (db, { action, entity, entityId, entityLabel, description, userId }) => {
    try {
        await db.auditLog.create({
            data: {
                action,
                entity,
                entityId:    entityId    ?? null,
                entityLabel: entityLabel ?? null,
                description,
                userId:      userId      ?? null,
            },
        });
    } catch (err) {
        console.error("[AuditLog] Write failed:", err.message);
    }
};

module.exports = { createAuditLog };
