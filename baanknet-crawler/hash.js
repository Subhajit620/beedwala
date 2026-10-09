const crypto = require("crypto");

/**
 * Generates a deterministic SHA-256 content hash for property change detection.
 * Only meaningful fields that signify content changes are included.
 * @param {Object} property - Normalized property object.
 * @returns {string} SHA-256 hex string.
 */
function calculateContentHash(property) {
    if (!property) return "";

    const payload = {
        propertyUniqueId: property.propertyUniqueId || "",
        propertyTitle: (property.propertyTitle || "").trim(),
        propertyHeading: (property.propertyHeading || "").trim(),
        propertyPrice: Number(property.propertyPrice) || 0,
        sortPrice: Number(property.sortPrice) || 0,
        propertyType: property.propertyType || "",
        propertySubType: property.propertySubType || "",
        specificPropSubType: property.specificPropSubType || "",
        propertyPossessionType: property.propertyPossessionType || "",
        propertyOwnershipType: property.propertyOwnershipType || "",
        area: Number(property.area) || 0,
        unitOfMeasurement: property.unitOfMeasurement || "",
        pincode: property.pincode || "",
        cityName: property.cityName || "",
        districtName: property.districtName || "",
        stateName: property.stateName || "",
        bankName: property.bankName || "",
        bankAddress: (property.bankAddress || "").trim(),
        borrowerName: (property.borrowerName || "").trim(),
        propTypeOfAction: property.propTypeOfAction || "",
        photos: Array.isArray(property.photos) ? [...property.photos].sort() : []
    };

    const jsonString = JSON.stringify(payload);
    return crypto.createHash("sha256").update(jsonString, "utf8").digest("hex");
}

module.exports = {
    calculateContentHash
};
