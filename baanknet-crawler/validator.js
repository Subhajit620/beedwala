/**
 * Validates a normalized property object prior to database operations.
 * @param {Object} property - Normalized property object.
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateProperty(property) {
    if (!property || typeof property !== "object") {
        return { isValid: false, error: "Empty or invalid property record." };
    }

    if (!property.sourcePropertyId) {
        return { isValid: false, error: "Missing mandatory sourcePropertyId." };
    }

    if (property.propertyPrice !== null && property.propertyPrice !== undefined) {
        if (typeof property.propertyPrice !== "number" || isNaN(property.propertyPrice) || property.propertyPrice < 0) {
            return { isValid: false, error: `Invalid propertyPrice: ${property.propertyPrice}` };
        }
    }

    if (property.area !== null && property.area !== undefined) {
        if (typeof property.area !== "number" || isNaN(property.area) || property.area < 0) {
            return { isValid: false, error: `Invalid area: ${property.area}` };
        }
    }

    return { isValid: true };
}

module.exports = {
    validateProperty
};
