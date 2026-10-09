require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================

mongoose
    .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        tlsAllowInvalidCertificates: true
    })
    .then(() => {
        console.log("MongoDB Atlas connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// ===============================
// Property Schema
// ===============================

const propertySchema = new mongoose.Schema(
    {
        sourcePropertyId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        propertyUniqueId: {
            type: String,
            index: true
        },
        contentHash: {
            type: String,
            index: true
        },

        propertyTypeId: Number,
        propertyType: {
            type: String,
            index: true
        },

        propertyTitle: String,
        propertyHeading: String,

        propertySubTypeId: Number,
        propertySubType: {
            type: String,
            index: true
        },
        specificPropSubType: String,

        propertyPrice: {
            type: Number,
            index: true
        },
        sortPrice: Number,

        propertyPossessionTypeId: Number,
        propertyPossessionType: String,

        propertyOwnershipTypeId: Number,
        propertyOwnershipType: String,

        pincode: String,

        cityId: {
            type: Number,
            index: true
        },
        cityName: {
            type: String,
            index: true
        },

        districtId: Number,
        districtName: String,

        stateId: {
            type: Number,
            index: true
        },
        stateName: {
            type: String,
            index: true
        },

        bankId: {
            type: Number,
            index: true
        },
        bankName: {
            type: String,
            index: true
        },
        bankAddress: String,

        departmentId: Number,
        departmentName: String,

        regionalOfficeName: String,
        zonalOfficeName: String,
        headOfficeName: String,

        borrowerName: String,
        borrowerAddress: String,

        locality: String,

        propTypeOfActionId: Number,
        propTypeOfAction: String,

        facingId: Number,
        facing: String,

        area: Number,
        unitOfMeasurement: String,

        photos: [String],
        displayImage: String,

        createdOn: {
            type: Date,
            index: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        lastSeenAt: Date,
        lastSyncedAt: Date
    },
    {
        timestamps: true,
        collection: "properties"
    }
);

propertySchema.index({ isActive: 1, createdOn: -1 });
propertySchema.index({ isActive: 1, propertyPrice: 1 });

const Property = mongoose.model("Property", propertySchema);

// ===============================
// Sync Log Schema
// ===============================

const syncLogSchema = new mongoose.Schema(
    {
        syncStartedAt: Date,
        syncFinishedAt: Date,
        executionTimeMs: Number,
        status: String,
        isTestMode: Boolean,
        totalPages: Number,
        pagesProcessed: Number,
        totalFetched: Number,
        newProperties: Number,
        updatedProperties: Number,
        unchangedProperties: Number,
        failedProperties: Number,
        deactivatedProperties: Number,
        errors: Array
    },
    {
        timestamps: true,
        collection: "sync_logs"
    }
);

const SyncLog = mongoose.model("SyncLog", syncLogSchema);

// ===============================
// Helper: Build MongoDB Filter Query
// ===============================

function buildFilterQuery(queryParams) {
    const query = {};

    // Active status filter (default: show active)
    if (queryParams.activeOnly !== "false") {
        query.isActive = true;
    }

    // Keyword Search
    const search = (queryParams.q || queryParams.search || "").trim();
    if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [
            { propertyTitle: regex },
            { propertyHeading: regex },
            { propertyUniqueId: regex },
            { sourcePropertyId: regex },
            { bankName: regex },
            { cityName: regex },
            { districtName: regex },
            { stateName: regex },
            { pincode: regex },
            { locality: regex },
            { propertySubType: regex }
        ];
    }

    // State filter
    if (queryParams.state) {
        query.stateName = new RegExp(`^${queryParams.state.trim()}$`, "i");
    }

    // City filter
    if (queryParams.city) {
        query.cityName = new RegExp(`^${queryParams.city.trim()}$`, "i");
    }

    // Bank filter
    if (queryParams.bank) {
        query.bankName = new RegExp(`^${queryParams.bank.trim()}$`, "i");
    }

    // Property Type filter
    if (queryParams.type || queryParams.propertyType) {
        const t = (queryParams.type || queryParams.propertyType).trim();
        query.propertyType = new RegExp(`^${t}$`, "i");
    }

    // Property SubType filter
    if (queryParams.subType || queryParams.propertySubType) {
        const st = (queryParams.subType || queryParams.propertySubType).trim();
        query.propertySubType = new RegExp(`^${st}$`, "i");
    }

    // Possession Type filter
    if (queryParams.possessionType) {
        query.propertyPossessionType = new RegExp(queryParams.possessionType.trim(), "i");
    }

    // Price Range Filter
    const minPrice = parseFloat(queryParams.minPrice);
    const maxPrice = parseFloat(queryParams.maxPrice);

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        query.propertyPrice = {};
        if (!isNaN(minPrice)) query.propertyPrice.$gte = minPrice;
        if (!isNaN(maxPrice)) query.propertyPrice.$lte = maxPrice;
    }

    // Area Range Filter
    const minArea = parseFloat(queryParams.minArea);
    const maxArea = parseFloat(queryParams.maxArea);

    if (!isNaN(minArea) || !isNaN(maxArea)) {
        query.area = {};
        if (!isNaN(minArea)) query.area.$gte = minArea;
        if (!isNaN(maxArea)) query.area.$lte = maxArea;
    }

    return query;
}

// Helper: Build Sort Options
function buildSortOption(sortParam) {
    switch (sortParam) {
        case "price_asc":
            return { propertyPrice: 1 };
        case "price_desc":
            return { propertyPrice: -1 };
        case "area_asc":
            return { area: 1 };
        case "area_desc":
            return { area: -1 };
        case "oldest":
            return { createdOn: 1 };
        case "newest":
        default:
            return { createdOn: -1, _id: -1 };
    }
}

// ===============================
// 1. Health Check
// ===============================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Baanknet API Server is operational",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date()
    });
});

// ===============================
// 2. Get Properties (with pagination & filters)
// ===============================

app.get("/api/properties", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const query = buildFilterQuery(req.query);
        const sort = buildSortOption(req.query.sort || req.query.sortBy);

        // Fetch properties and total count concurrently
        const [properties, total] = await Promise.all([
            Property.find(query).sort(sort).skip(skip).limit(limit).lean(),
            Property.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        res.json({
            success: true,
            count: properties.length,
            data: properties,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error("GET /api/properties error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch properties",
            error: error.message
        });
    }
});

// ===============================
// 3. Search Properties
// ===============================

app.get("/api/properties/search", async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const query = buildFilterQuery(req.query);
        const sort = buildSortOption(req.query.sort || req.query.sortBy);

        const [properties, total] = await Promise.all([
            Property.find(query).sort(sort).skip(skip).limit(limit).lean(),
            Property.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit) || 1;

        res.json({
            success: true,
            query: req.query.q || req.query.search || "",
            count: properties.length,
            data: properties,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error("GET /api/properties/search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search properties",
            error: error.message
        });
    }
});

// ===============================
// 4. Property Statistics
// ===============================

app.get("/api/properties/stats", async (req, res) => {
    try {
        const [
            totalProperties,
            activeListings,
            distinctStates,
            distinctCities,
            distinctBanks,
            priceAgg
        ] = await Promise.all([
            Property.countDocuments(),
            Property.countDocuments({ isActive: true }),
            Property.distinct("stateName", { stateName: { $ne: null, $ne: "" } }),
            Property.distinct("cityName", { cityName: { $ne: null, $ne: "" } }),
            Property.distinct("bankName", { bankName: { $ne: null, $ne: "" } }),
            Property.aggregate([
                { $match: { propertyPrice: { $gt: 0 } } },
                {
                    $group: {
                        _id: null,
                        avgPrice: { $avg: "$propertyPrice" },
                        minPrice: { $min: "$propertyPrice" },
                        maxPrice: { $max: "$propertyPrice" }
                    }
                }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalProperties,
                activeListings,
                totalStates: distinctStates.length,
                totalCities: distinctCities.length,
                totalBanks: distinctBanks.length,
                states: distinctStates.sort(),
                banks: distinctBanks.sort(),
                pricing: priceAgg[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
            }
        });
    } catch (error) {
        console.error("GET /api/properties/stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch property statistics",
            error: error.message
        });
    }
});

// ===============================
// 5. Sync Status
// ===============================

app.get("/api/sync/status", async (req, res) => {
    try {
        const lastSync = await SyncLog.findOne().sort({ createdAt: -1 }).lean();

        res.json({
            success: true,
            lastSync: lastSync || {
                status: "never_run",
                message: "No synchronization records found"
            }
        });
    } catch (error) {
        console.error("GET /api/sync/status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sync status",
            error: error.message
        });
    }
});

// ===============================
// 6. Get Single Property by ID
// ===============================

app.get("/api/properties/:id", async (req, res) => {
    try {
        const id = req.params.id;

        // Search by sourcePropertyId, or propertyUniqueId, or MongoDB _id if valid
        const conditions = [
            { sourcePropertyId: id },
            { propertyUniqueId: id }
        ];

        if (mongoose.Types.ObjectId.isValid(id)) {
            conditions.push({ _id: id });
        }

        const property = await Property.findOne({ $or: conditions }).lean();

        if (!property) {
            return res.status(404).json({
                success: false,
                message: `Property '${id}' not found`
            });
        }

        res.json({
            success: true,
            data: property
        });
    } catch (error) {
        console.error("GET /api/properties/:id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch property",
            error: error.message
        });
    }
});

// ===============================
// Start Server
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`Baanknet API Server running on port ${PORT}`);
    console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`========================================`);
});