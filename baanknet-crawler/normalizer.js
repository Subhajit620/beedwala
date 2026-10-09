/**
 * Normalizes raw BAANKNET API records (_source) into a clean, typed MongoDB object.
 * @param {Object} source - Raw _source object from API response.
 * @returns {Object} Normalized property object.
 */
function normalizeProperty(source) {
    if (!source || typeof source !== "object") {
        return null;
    }

    // Determine stable source property ID (propertyDetailId is the primary numeric/string ID)
    const sourcePropertyId = source.propertyDetailId !== undefined && source.propertyDetailId !== null
        ? String(source.propertyDetailId).trim()
        : (source.propertyUniqueId ? String(source.propertyUniqueId).trim() : null);

    const propertyUniqueId = source.propertyUniqueId ? String(source.propertyUniqueId).trim() : sourcePropertyId;

    // Photos array
    let photos = [];
    if (Array.isArray(source.photos)) {
        photos = source.photos.filter((url) => typeof url === "string" && url.trim().length > 0);
    } else if (typeof source.photos === "string" && source.photos.trim().length > 0) {
        photos = [source.photos.trim()];
    }

    const displayImage = photos.length > 0 ? photos[0] : (source.displayImage || "");

    // Numbers with safe fallback
    const propertyPrice = typeof source.propertyPrice === "number" ? source.propertyPrice : (parseFloat(source.propertyPrice) || 0);
    const sortPrice = typeof source.sortPrice === "number" ? source.sortPrice : (parseFloat(source.sortPrice) || propertyPrice);
    const area = typeof source.area === "number" ? source.area : (parseFloat(source.area) || 0);

    // CreatedOn Date parsing
    let createdOn = null;
    if (source.createdOn) {
        const parsed = new Date(source.createdOn);
        if (!isNaN(parsed.getTime())) {
            createdOn = parsed;
        }
    }

    return {
        sourcePropertyId,
        propertyUniqueId,

        propertyTypeId: source.propertyTypeId ? Number(source.propertyTypeId) : null,
        propertyType: source.propertyType ? String(source.propertyType).trim() : "",

        propertyTitle: source.propertyTitle ? String(source.propertyTitle).trim() : "",
        propertyHeading: source.propertyHeading ? String(source.propertyHeading).trim() : "",

        propertySubTypeId: source.propertySubTypeId ? Number(source.propertySubTypeId) : null,
        propertySubType: source.propertySubType ? String(source.propertySubType).trim() : "",
        specificPropSubType: source.specificPropSubType ? String(source.specificPropSubType).trim() : "",

        propertyPrice,
        sortPrice,

        propertyPossessionTypeId: source.propertyPossessionTypeId ? Number(source.propertyPossessionTypeId) : null,
        propertyPossessionType: source.propertyPossessionType ? String(source.propertyPossessionType).trim() : "",

        propertyOwnershipTypeId: source.propertyOwnershipTypeId ? Number(source.propertyOwnershipTypeId) : null,
        propertyOwnershipType: source.propertyOwnershipType ? String(source.propertyOwnershipType).trim() : "",

        pincode: source.pincode ? String(source.pincode).trim() : "",

        cityId: source.cityId ? Number(source.cityId) : null,
        cityName: source.cityName ? String(source.cityName).trim() : "",

        districtId: source.districtId ? Number(source.districtId) : null,
        districtName: source.districtName ? String(source.districtName).trim() : "",

        stateId: source.stateId ? Number(source.stateId) : null,
        stateName: source.stateName ? String(source.stateName).trim() : "",

        bankId: source.bankId ? Number(source.bankId) : null,
        bankName: source.bankName ? String(source.bankName).trim() : "",
        bankAddress: source.bankAddress ? String(source.bankAddress).trim() : "",

        departmentId: source.departmentId ? Number(source.departmentId) : null,
        departmentName: source.departmentName ? String(source.departmentName).trim() : "",

        regionalOfficeName: source.regionalOfficeName ? String(source.regionalOfficeName).trim() : "",
        zonalOfficeName: source.zonalOfficeName ? String(source.zonalOfficeName).trim() : "",
        headOfficeName: source.headOfficeName ? String(source.headOfficeName).trim() : "",

        borrowerName: source.borrowerName ? String(source.borrowerName).trim() : "",
        borrowerAddress: source.borrowerAddress ? String(source.borrowerAddress).trim() : "",

        locality: source.locality ? String(source.locality).trim() : "",

        propTypeOfActionId: source.propTypeOfActionId ? Number(source.propTypeOfActionId) : null,
        propTypeOfAction: source.propTypeOfAction ? String(source.propTypeOfAction).trim() : "",

        facingId: source.facingId ? Number(source.facingId) : null,
        facing: source.facing ? String(source.facing).trim() : "",

        area,
        unitOfMeasurement: source.unitOfMeasurement ? String(source.unitOfMeasurement).trim() : "sq.ft",

        photos,
        displayImage,

        createdOn
    };
}

module.exports = {
    normalizeProperty
};
