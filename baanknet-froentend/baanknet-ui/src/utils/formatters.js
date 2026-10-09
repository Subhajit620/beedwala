/**
 * Utility functions for Indian currency, numbers, and dates
 */

/**
 * Format number into standard Indian Rupee format
 * e.g. 1600890 -> "₹16,00,890"
 */
export function formatINR(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    const num = Number(amount);
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Format number into Indian compact notation (Lakhs and Crores)
 * e.g. 1600890 -> "₹16.01 Lakh"
 * e.g. 25000000 -> "₹2.50 Cr"
 */
export function formatCompactINR(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
    const num = Number(amount);
    
    if (num >= 10000000) {
        const cr = num / 10000000;
        return `₹${cr.toFixed(2).replace(/\.00$/, "")} Cr`;
    } else if (num >= 100000) {
        const lakh = num / 100000;
        return `₹${lakh.toFixed(2).replace(/\.00$/, "")} Lakh`;
    } else if (num >= 1000) {
        const k = num / 1000;
        return `₹${k.toFixed(1).replace(/\.0$/, "")} K`;
    }
    return formatINR(num);
}

/**
 * Format ISO date string into readable date format
 * e.g. "2026-10-05T07:22:44.000Z" -> "05 Oct 2026"
 */
export function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

/**
 * Calculate price per unit area
 */
export function calculatePricePerSqFt(price, area) {
    if (!price || !area || isNaN(price) || isNaN(area) || Number(area) <= 0) {
        return null;
    }
    const rate = Math.round(Number(price) / Number(area));
    return `₹${rate.toLocaleString("en-IN")}/sq.ft`;
}

/**
 * Get clean property display title
 */
export function getCleanPropertyTitle(property) {
    if (!property) return "Property";
    
    if (property.propertyHeading && property.propertyHeading.trim()) {
        return property.propertyHeading.trim();
    }
    
    if (property.propertyTitle && property.propertyTitle.trim()) {
        const title = property.propertyTitle.trim();
        // If it's a long legal description, give a clean summary
        if (title.length > 90) {
            return title.substring(0, 90) + "...";
        }
        return title;
    }
    
    const type = property.propertySubType || property.propertyType || "Property";
    const area = property.area ? `${property.area} ${property.unitOfMeasurement || "sq.ft"}` : "";
    const loc = property.cityName || property.districtName || "";
    
    if (area && loc) {
        return `${area} ${type} in ${loc}`;
    }
    
    return `${type} for Sale`;
}
