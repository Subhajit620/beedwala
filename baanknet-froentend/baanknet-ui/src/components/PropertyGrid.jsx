import React from "react";
import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties = [], columns = 3, viewMode = "grid" }) {
    if (!properties || properties.length === 0) {
        return null;
    }

    if (viewMode === "list") {
        return (
            <div className="flex flex-col gap-4 sm:gap-5">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.sourcePropertyId || property._id || property.propertyUniqueId}
                        property={property}
                        viewMode="list"
                    />
                ))}
            </div>
        );
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
                    viewMode="grid"
                />
            ))}
        </div>
    );
}
