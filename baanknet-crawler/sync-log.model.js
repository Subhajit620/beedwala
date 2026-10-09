const mongoose = require("mongoose");

const syncLogSchema = new mongoose.Schema(
    {
        syncStartedAt: {
            type: Date,
            required: true
        },
        syncFinishedAt: {
            type: Date
        },
        executionTimeMs: {
            type: Number
        },

        status: {
            type: String,
            enum: ["in_progress", "success", "partial", "failed"],
            default: "in_progress",
            index: true
        },

        isTestMode: {
            type: Boolean,
            default: false
        },

        totalPages: {
            type: Number,
            default: 0
        },
        pagesProcessed: {
            type: Number,
            default: 0
        },

        totalFetched: {
            type: Number,
            default: 0
        },
        newProperties: {
            type: Number,
            default: 0
        },
        updatedProperties: {
            type: Number,
            default: 0
        },
        unchangedProperties: {
            type: Number,
            default: 0
        },
        failedProperties: {
            type: Number,
            default: 0
        },
        deactivatedProperties: {
            type: Number,
            default: 0
        },

        apiReportedTotal: {
            type: Number,
            default: 0
        },

        failedPages: [Number],

        errors: [
            {
                timestamp: { type: Date, default: Date.now },
                page: Number,
                message: String,
                details: mongoose.Schema.Types.Mixed
            }
        ]
    },
    {
        timestamps: true,
        collection: "sync_logs",
        suppressReservedKeysWarning: true
    }
);

syncLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SyncLog", syncLogSchema);
