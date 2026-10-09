require("dotenv").config();

const mongoose = require("mongoose");
const assert = require("assert");
const config = require("./config");
const Property = require("./property.model");
const SyncLog = require("./sync-log.model");
const { normalizeProperty } = require("./normalizer");
const { validateProperty } = require("./validator");
const { calculateContentHash } = require("./hash");
const { isRetryableError } = require("./utils/retry");
const { fetchProperties } = require("./api-client");
const logger = require("./utils/logger");

async function runAllTests() {
    logger.section("RUNNING BAANKNET CRAWLER TEST SUITE");
    let passed = 0;
    let failed = 0;

    // Test 1: Normalizer & Mandatory Fields
    try {
        logger.info("Test 1: Testing Data Normalizer...");
        const rawSample = {
            propertyDetailId: 999001,
            propertyUniqueId: "TEST_PROP_001",
            propertyTitle: " 2 BHK Luxury Flat in Kolkata ",
            propertyPrice: 4500000,
            area: 1200,
            unitOfMeasurement: "sq.ft",
            cityName: "Kolkata",
            stateName: "West Bengal",
            bankName: "State Bank of India",
            photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
        };

        const normalized = normalizeProperty(rawSample);
        assert.strictEqual(normalized.sourcePropertyId, "999001", "sourcePropertyId must be converted to string");
        assert.strictEqual(normalized.propertyUniqueId, "TEST_PROP_001");
        assert.strictEqual(normalized.propertyTitle, "2 BHK Luxury Flat in Kolkata", "Title must be trimmed");
        assert.strictEqual(normalized.propertyPrice, 4500000);
        assert.strictEqual(normalized.photos.length, 2);
        assert.strictEqual(normalized.displayImage, "https://example.com/photo1.jpg");

        logger.success("✔ Test 1 Passed: Data Normalizer works correctly.");
        passed++;
    } catch (e) {
        logger.error("✖ Test 1 Failed:", e.message);
        failed++;
    }

    // Test 2: Validator Constraints
    try {
        logger.info("Test 2: Testing Validator Rules...");
        const validRec = { sourcePropertyId: "123", propertyPrice: 10000, area: 500 };
        assert.strictEqual(validateProperty(validRec).isValid, true);

        const missingId = { propertyPrice: 10000 };
        assert.strictEqual(validateProperty(missingId).isValid, false, "Must fail on missing sourcePropertyId");

        const negativePrice = { sourcePropertyId: "123", propertyPrice: -500 };
        assert.strictEqual(validateProperty(negativePrice).isValid, false, "Must fail on negative price");

        const negativeArea = { sourcePropertyId: "123", propertyPrice: 1000, area: -20 };
        assert.strictEqual(validateProperty(negativeArea).isValid, false, "Must fail on negative area");

        logger.success("✔ Test 2 Passed: Validator enforces constraints correctly.");
        passed++;
    } catch (e) {
        logger.error("✖ Test 2 Failed:", e.message);
        failed++;
    }

    // Test 3: Deterministic Content Hashing
    try {
        logger.info("Test 3: Testing Deterministic Content Hashing...");
        const objA = {
            propertyUniqueId: "UID_100",
            propertyTitle: "Commercial Shop",
            propertyPrice: 5000000,
            area: 800,
            bankName: "Indian Bank",
            cityName: "Kolkata",
            photos: ["img1.jpg", "img2.jpg"]
        };

        const objB = { ...objA };
        const hashA = calculateContentHash(objA);
        const hashB = calculateContentHash(objB);

        assert.strictEqual(hashA, hashB, "Identical objects must yield identical SHA-256 hashes");

        // Change price -> hash must change
        const objC = { ...objA, propertyPrice: 5500000 };
        const hashC = calculateContentHash(objC);
        assert.notStrictEqual(hashA, hashC, "Modified price must generate a different hash");

        logger.success("✔ Test 3 Passed: Content hashing is deterministic and detects field changes.");
        passed++;
    } catch (e) {
        logger.error("✖ Test 3 Failed:", e.message);
        failed++;
    }

    // Test 4: Retry Error Code Filter
    try {
        logger.info("Test 4: Testing Transient Error Classifier...");
        assert.strictEqual(isRetryableError({ response: { status: 500 } }), true, "500 must be retryable");
        assert.strictEqual(isRetryableError({ response: { status: 502 } }), true, "502 must be retryable");
        assert.strictEqual(isRetryableError({ response: { status: 503 } }), true, "503 must be retryable");
        assert.strictEqual(isRetryableError({ response: { status: 429 } }), true, "429 must be retryable");
        assert.strictEqual(isRetryableError({ code: "ETIMEDOUT" }), true, "ETIMEDOUT must be retryable");
        assert.strictEqual(isRetryableError({ code: "ECONNRESET" }), true, "ECONNRESET must be retryable");

        assert.strictEqual(isRetryableError({ response: { status: 401 } }), false, "401 must NOT be retried");
        assert.strictEqual(isRetryableError({ response: { status: 403 } }), false, "403 must NOT be retried");
        assert.strictEqual(isRetryableError({ response: { status: 404 } }), false, "404 must NOT be retried");

        logger.success("✔ Test 4 Passed: Retry logic correctly isolates transient vs permanent HTTP codes.");
        passed++;
    } catch (e) {
        logger.error("✖ Test 4 Failed:", e.message);
        failed++;
    }

    // Test 5: Live API Response Structure & Dynamic Pagination
    try {
        logger.info("Test 5: Testing Live BAANKNET API Dynamic Pagination Envelope...");
        const apiResponse = await fetchProperties({ page: 1, limit: 2 });
        assert.strictEqual(typeof apiResponse.total, "number", "Total must be a number");
        assert(apiResponse.total > 0, "API total must be greater than 0");
        assert.strictEqual(typeof apiResponse.totalPages, "number", "totalPages must be dynamic");
        assert(apiResponse.totalPages > 0, "totalPages must be greater than 0");
        assert(Array.isArray(apiResponse.data), "data must be an array");
        assert(apiResponse.data.length > 0, "data array should contain records");

        logger.success(`✔ Test 5 Passed: Dynamic API returned total: ${apiResponse.total}, totalPages: ${apiResponse.totalPages}.`);
        passed++;
    } catch (e) {
        logger.error("✖ Test 5 Failed:", e.message);
        failed++;
    }

    // Test 6: Database Idempotency & Safe Failure Recovery (MongoDB Atlas)
    try {
        logger.info("Test 6: Testing MongoDB Atlas Idempotency & Unique Constraint...");
        await mongoose.connect(config.mongodbUri, {
            serverSelectionTimeoutMS: 10000,
            tlsAllowInvalidCertificates: true
        });

        const testSourceId = "UNIT_TEST_MOCK_001";
        await Property.deleteOne({ sourcePropertyId: testSourceId });

        // Insert first time
        const mockProp = {
            sourcePropertyId: testSourceId,
            propertyUniqueId: "MOCK_001",
            propertyTitle: "Test Mock Auction Asset",
            propertyPrice: 1500000,
            contentHash: "hash_v1",
            isActive: true,
            lastSeenAt: new Date()
        };
        await Property.create(mockProp);

        const count1 = await Property.countDocuments({ sourcePropertyId: testSourceId });
        assert.strictEqual(count1, 1, "Exactly 1 document should exist");

        // Attempt second insert with same unique key -> must throw duplicate key error
        let dupError = null;
        try {
            await Property.create(mockProp);
        } catch (err) {
            dupError = err;
        }
        assert(dupError !== null, "Duplicate insertion must be rejected by unique index");

        // Clean up test document
        await Property.deleteOne({ sourcePropertyId: testSourceId });
        await mongoose.disconnect();

        logger.success("✔ Test 6 Passed: Database duplicate prevention & unique constraints verified.");
        passed++;
    } catch (e) {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect().catch(() => {});
        }
        logger.error("✖ Test 6 Failed:", e.message);
        failed++;
    }

    logger.section("TEST SUITE SUMMARY");
    console.log(`Passed: ${passed} / 6`);
    console.log(`Failed: ${failed} / 6`);
    logger.divider();

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runAllTests().catch((e) => {
    console.error("Test execution aborted:", e);
    process.exit(1);
});
