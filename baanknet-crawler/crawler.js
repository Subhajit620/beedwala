require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./config");
const { runSync } = require("./sync");
const logger = require("./utils/logger");

let isSyncRunning = false;

/**
 * Executes a sync cycle protected by a concurrency lock.
 */
async function executeScheduledSync(isTest = false) {
    if (isSyncRunning) {
        logger.warn("A synchronization job is already actively running. Skipping this scheduled interval to prevent overlap.");
        return;
    }

    isSyncRunning = true;

    try {
        await runSync({ isTest });
    } catch (error) {
        logger.error(`Scheduled sync encountered an error: ${error.message}`);
    } finally {
        isSyncRunning = false;
        logger.info(`Next sync will trigger according to schedule (${config.syncIntervalMinutes}m interval).`);
    }
}

// Check for immediate execution flag
const runImmediately = process.argv.includes("--now") || process.argv.includes("--immediate");
const isTestMode = process.argv.includes("--test");

logger.section("BAANKNET PROPERTY CRAWLER & DAEMON SCHEDULER");
logger.info(`Sync interval configured to every ${config.syncIntervalMinutes} minutes.`);

// Try using node-cron if available, otherwise use built-in interval timer
let cronScheduled = false;
try {
    const cron = require("node-cron");
    const cronExpression = `*/${config.syncIntervalMinutes} * * * *`;
    cron.schedule(cronExpression, () => {
        logger.info(`\n[CRON TRIGGER] Starting scheduled sync cycle (${new Date().toLocaleTimeString()})...`);
        executeScheduledSync(isTestMode);
    });
    logger.success(`Cron scheduler initialized with pattern: "${cronExpression}"`);
    cronScheduled = true;
} catch (e) {
    // Fallback: Built-in precision interval timer
    const intervalMs = config.syncIntervalMinutes * 60 * 1000;
    setInterval(() => {
        logger.info(`\n[TIMER TRIGGER] Starting scheduled sync cycle (${new Date().toLocaleTimeString()})...`);
        executeScheduledSync(isTestMode);
    }, intervalMs);
    logger.success(`Precision interval scheduler initialized for every ${config.syncIntervalMinutes} minutes (${intervalMs}ms).`);
    cronScheduled = true;
}

if (runImmediately) {
    logger.info("Immediate execution requested via --now. Starting initial sync...");
    executeScheduledSync(isTestMode);
} else {
    logger.info("Daemon is listening. First scheduled job will trigger at the next interval.");
    logger.info("Tip: Use 'node crawler.js --now' to trigger immediately on start.");
}

// Keep daemon alive & handle graceful shutdown
process.on("SIGINT", async () => {
    logger.warn("Crawler daemon stopping...");
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    process.exit(0);
});

process.on("SIGTERM", async () => {
    logger.warn("Crawler daemon stopping...");
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    process.exit(0);
});