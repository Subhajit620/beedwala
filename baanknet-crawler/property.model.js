const mongoose = require("mongoose");

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
        propertyDescription: String,

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
        latitude: {
            type: Number,
            index: true
        },
        longitude: {
            type: Number,
            index: true
        },

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

        lastSeenAt: {
            type: Date,
            index: true
        },

        lastSyncedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        collection: "properties"
    }
);

// Compound indexes for high performance filtering and sorting
propertySchema.index({ isActive: 1, createdOn: -1 });
propertySchema.index({ isActive: 1, propertyPrice: 1 });
propertySchema.index({ stateName: 1, cityName: 1, bankName: 1 });

module.exports = mongoose.model("Property", propertySchema);