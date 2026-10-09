import React from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties = [], columns = 3 }) {
    if (!properties || properties.length === 0) {
        return null;
    }

    const gridClass =
        columns === 4
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

    return (
        <div className={gridClass}>
            {properties.map((property) => (
                <PropertyCard
                    key={property.sourcePropertyId || property._id || property.propertyUniqueId}
                    property={property}
                />
            ))}
        </div>
    );
}
