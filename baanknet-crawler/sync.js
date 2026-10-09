require("dotenv").config();

const mongoose = require("mongoose");
const config = require("./config");
const Property = require("./property.model");
const SyncLog = require("./sync-log.model");
const { fetchProperties, closePlaywrightEngine } = require("./api-client");
const { normalizeProperty } = require("./normalizer");
const { validateProperty } = require("./validator");
const { calculateContentHash } = require("./hash");
const { delay } = require("./utils/delay");
const logger = require("./utils/logger");

let isShuttingDown = false;

// Handle Graceful Shutdown
async function handleShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.warn(`Received ${signal}. Gracefully shutting down sync engine...`);

    await closePlaywrightEngine();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        logger.info("MongoDB disconnected.");
    }
    process.exit(0);
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

/**
 * Connects directly to MongoDB Atlas.
 */
async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return;
    }
    
    const uri = config.mongodbUri;
    if (!uri) {
        throw new Error("MONGODB_URI is not configured in .env");
    }

    logger.info("Connecting to MongoDB Atlas...");
    
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            tlsAllowInvalidCertificates: true
        });
        logger.success("MongoDB Atlas connected successfully.");
    } catch (err) {
        logger.error(`MongoDB Atlas connection error: ${err.message}`);
        throw err;
    }
}

/**
 * Processes a single property record (normalization, validation, change detection, persistence).
 * @param {Object} rawItem - Item from API data array (_source wrapper).
 * @param {Date} syncStartedAt - Timestamp when current sync run began.
 * @returns {Promise<"NEW" | "UPDATED" | "UNCHANGED" | "FAILED">}
 */
async function processRecord(rawItem, syncStartedAt) {
    try {
        const source = rawItem._source || rawItem;
        const normalized = normalizeProperty(source);

        const validation = validateProperty(normalized);
        if (!validation.isValid) {
            logger.warn(`Record validation failed: ${validation.error}`);
            return "FAILED";
        }

        const newHash = calculateContentHash(normalized);
        normalized.contentHash = newHash;
        normalized.lastSeenAt = syncStartedAt;
        normalized.lastSyncedAt = new Date();
        normalized.isActive = true;

        // Check if property already exists in database
        const existing = await Property.findOne(
            { sourcePropertyId: normalized.sourcePropertyId },
            { contentHash: 1, _id: 1 }
        ).lean();

        if (!existing) {
            // INSERT: New property
            await Property.create(normalized);
            logger.record("NEW", normalized.propertyUniqueId || normalized.sourcePropertyId, `(₹${normalized.propertyPrice.toLocaleString("en-IN")})`);
            return "NEW";
        }

        if (existing.contentHash === newHash) {
            // UNCHANGED: Update only timestamps
            await Property.updateOne(
                { _id: existing._id },
                {
                    $set: {
                        lastSeenAt: syncStartedAt,
                        lastSyncedAt: new Date(),
                        isActive: true
                    }
                }
            );
            logger.record("UNCHANGED", normalized.propertyUniqueId || normalized.sourcePropertyId);
            return "UNCHANGED";
        }

        // UPDATED: Content changed, update full record
        await Property.updateOne(
            { _id: existing._id },
            {
                $set: normalized
            }
        );
        logger.record("UPDATED", normalized.propertyUniqueId || normalized.sourcePropertyId, `(Content modified)`);
        return "UPDATED";
    } catch (err) {
        logger.error(`Error processing property record: ${err.message}`);
        return "FAILED";
    }
}

/**
 * Executes a full or test synchronization run.
 * @param {Object} options
 * @param {boolean} [options.isTest=false] - If true, only crawl 2 pages for testing.
 * @param {number} [options.maxPages] - Optional cap on total pages to process.
 * @returns {Promise<Object>} Sync metrics summary.
 */
async function runSync({ isTest = false, maxPages = null } = {}) {
    const syncStartedAt = new Date();
    const startTimeMs = Date.now();

    logger.section(`BAANKNET PROPERTY SYNCHRONIZATION STARTED ${isTest ? "[TEST MODE - 2 PAGES]" : "[FULL SYNC - ALL PAGES]"}`);
    logger.info(`Target API: ${config.apiUrl}`);
    logger.info(`Throttling delay: ${config.requestDelayMs}ms per page`);

    let syncLog = null;
    const counters = {
        apiReportedTotal: 0,
        totalPages: 0,
        pagesProcessed: 0,
        totalFetched: 0,
        newProperties: 0,
        updatedProperties: 0,
        unchangedProperties: 0,
        failedProperties: 0,
        deactivatedProperties: 0,
        failedPages: [],
        errors: []
    };

    try {
        await connectDB();

        // Initialize Sync Log in MongoDB
        syncLog = await SyncLog.create({
            syncStartedAt,
            isTestMode: isTest,
            status: "in_progress"
        });

        // 1. Fetch Page 1 to read dynamic total and totalPages
        logger.info("Fetching Page 1 to initialize dynamic pagination...");
        const page1Result = await fetchProperties({
            page: 1,
            limit: config.pageSize
        });

        const totalPropertiesInApi = page1Result.total;
        let totalPagesInApi = page1Result.totalPages;

        counters.apiReportedTotal = totalPropertiesInApi;

        if (isTest) {
            totalPagesInApi = Math.min(2, totalPagesInApi);
        } else if (maxPages && maxPages > 0) {
            totalPagesInApi = Math.min(maxPages, totalPagesInApi);
        }

        counters.totalPages = totalPagesInApi;
        logger.info(`Total available properties reported by API: ${totalPropertiesInApi}`);
        logger.info(`Total pages to synchronize in this run: ${totalPagesInApi} (Page Size: ${config.pageSize})`);
        logger.divider();

        // Process Page 1 records immediately without re-fetching
        logger.info(`Processing Page 1/${totalPagesInApi} (${page1Result.data.length} records)...`);
        for (const item of page1Result.data) {
            if (isShuttingDown) break;
            counters.totalFetched++;
            const result = await processRecord(item, syncStartedAt);
            if (result === "NEW") counters.newProperties++;
            else if (result === "UPDATED") counters.updatedProperties++;
            else if (result === "UNCHANGED") counters.unchangedProperties++;
            else if (result === "FAILED") counters.failedProperties++;
        }
        counters.pagesProcessed++;

        // 2. Fetch and process remaining pages sequentially
        for (let page = 2; page <= totalPagesInApi; page++) {
            if (isShuttingDown) break;

            // Respect request throttling delay
            if (config.requestDelayMs > 0) {
                await delay(config.requestDelayMs);
            }

            logger.info(`\nFetching Page ${page}/${totalPagesInApi}...`);
            try {
                const pageResult = await fetchProperties({
                    page,
                    limit: config.pageSize
                });

                const records = pageResult.data || [];
                logger.info(`Page ${page} returned ${records.length} records.`);

                for (const item of records) {
                    if (isShuttingDown) break;
                    counters.totalFetched++;
                    const result = await processRecord(item, syncStartedAt);
                    if (result === "NEW") counters.newProperties++;
                    else if (result === "UPDATED") counters.updatedProperties++;
                    else if (result === "UNCHANGED") counters.unchangedProperties++;
                    else if (result === "FAILED") counters.failedProperties++;
                }

                counters.pagesProcessed++;
            } catch (pageError) {
                logger.error(`Failed to fetch/process page ${page}: ${pageError.message}`);
                counters.failedPages.push(page);
                counters.errors.push({
                    page,
                    message: pageError.message,
                    timestamp: new Date()
                });

                // Halt if too many consecutive errors occur
                if (!isTest && counters.failedPages.length > 10) {
                    throw new Error(`Excessive page errors encountered (${counters.failedPages.length} failed pages). Halting sync to protect database integrity.`);
                }
            }
        }

        // 3. Count Verification & Inactive Record Rule
        // Only mark missing properties inactive if 100% of pages succeeded in a full sync
        const isFullCrawlComplete = !isTest && 
                                    counters.pagesProcessed === totalPagesInApi && 
                                    counters.failedPages.length === 0 &&
                                    (counters.totalFetched === totalPropertiesInApi || !maxPages);

        if (isFullCrawlComplete) {
            logger.info("\nVerifying active properties for disappearing/removed listings...");
            const deactivationResult = await Property.updateMany(
                {
                    lastSeenAt: { $lt: syncStartedAt },
                    isActive: true
                },
                {
                    $set: {
                        isActive: false,
                        lastSyncedAt: new Date()
                    }
                }
            );

            counters.deactivatedProperties = deactivationResult.modifiedCount || 0;
            if (counters.deactivatedProperties > 0) {
                logger.warn(`Marked ${counters.deactivatedProperties} removed properties as inactive.`);
            } else {
                logger.success("All existing active properties verified present.");
            }
        } else if (!isTest) {
            logger.warn("Skipping inactive property deactivation because crawl was partial or had failed pages.");
        }

        // 4. Record Final Metrics & Update SyncLog
        const executionTimeMs = Date.now() - startTimeMs;
        let finalStatus = "success";
        if (counters.failedPages.length > 0 || counters.errors.length > 0) {
            finalStatus = counters.pagesProcessed > 0 ? "partial" : "failed";
        }

        if (syncLog) {
            await SyncLog.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        syncFinishedAt: new Date(),
                        executionTimeMs,
                        status: finalStatus,
                        totalPages: counters.totalPages,
                        pagesProcessed: counters.pagesProcessed,
                        totalFetched: counters.totalFetched,
                        apiReportedTotal: counters.apiReportedTotal,
                        newProperties: counters.newProperties,
                        updatedProperties: counters.updatedProperties,
                        unchangedProperties: counters.unchangedProperties,
                        failedProperties: counters.failedProperties,
                        deactivatedProperties: counters.deactivatedProperties,
                        failedPages: counters.failedPages,
                        errors: counters.errors
                    }
                }
            );
        }

        const activeCountInDb = await Property.countDocuments({ isActive: true });

        logger.section(finalStatus === "success" ? "FULL SYNCHRONIZATION COMPLETED SUCCESSFULLY" : "SYNCHRONIZATION COMPLETED WITH WARNINGS");
        console.log(`Execution Time        : ${(executionTimeMs / 1000).toFixed(2)}s`);
        console.log(`API Reported Total    : ${counters.apiReportedTotal}`);
        console.log(`API Total Pages       : ${counters.totalPages}`);
        console.log(`Pages Processed       : ${counters.pagesProcessed} / ${counters.totalPages}`);
        console.log(`Total Records Fetched : ${counters.totalFetched}`);
        console.log(`New Properties        : ${counters.newProperties}`);
        console.log(`Updated Properties    : ${counters.updatedProperties}`);
        console.log(`Unchanged Properties  : ${counters.unchangedProperties}`);
        console.log(`Failed Records        : ${counters.failedProperties}`);
        console.log(`Failed Pages          : [${counters.failedPages.join(", ")}]`);
        console.log(`Deactivated Listings  : ${counters.deactivatedProperties}`);
        console.log(`Active in MongoDB     : ${activeCountInDb}`);
        logger.divider();

        return {
            success: finalStatus === "success",
            status: finalStatus,
            counters,
            activeCountInDb,
            executionTimeMs
        };
    } catch (fatalError) {
        logger.error(`\nCRITICAL SYNC FAILURE: ${fatalError.message}`);

        if (syncLog) {
            await SyncLog.updateOne(
                { _id: syncLog._id },
                {
                    $set: {
                        syncFinishedAt: new Date(),
                        executionTimeMs: Date.now() - startTimeMs,
                        status: "failed",
                        failedPages: counters.failedPages,
                        errors: [
                            ...counters.errors,
                            {
                                message: fatalError.message,
                                timestamp: new Date()
                            }
                        ]
                    }
                }
            );
        }

        throw fatalError;
    } finally {
        await closePlaywrightEngine();
    }
}

// Standalone execution check
if (require.main === module) {
    const isTest = process.argv.includes("--test");
    const maxPagesArg = process.argv.find(arg => arg.startsWith("--max-pages="));
    const maxPages = maxPagesArg ? parseInt(maxPagesArg.split("=")[1], 10) : null;

    runSync({ isTest, maxPages })
        .then(() => {
            logger.info("Process finished. Disconnecting from MongoDB...");
            return mongoose.disconnect();
        })
        .then(() => {
            logger.success("Clean exit.");
            process.exit(0);
        })
        .catch(err => {
            logger.error(`Sync script terminated with error: ${err.message}`);
            mongoose.disconnect().finally(() => process.exit(1));
        });
}

module.exports = {
    runSync
};