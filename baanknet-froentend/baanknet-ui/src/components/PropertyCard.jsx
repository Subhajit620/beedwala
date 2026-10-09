import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    MapPin,
    Building2,
    Ruler,
    ArrowRight,
    Landmark,
    Bookmark,
    Scale,
    Check,
    Flame,
    Sparkles,
    ShieldCheck
} from "lucide-react";
import {
    formatINR,
    calculatePricePerSqFt,
    getCleanPropertyTitle
} from "../utils/formatters";
import { useApp } from "../context/AppContext";

export default function PropertyCard({ property }) {
    const [imageError, setImageError] = useState(false);
    const { isSaved, toggleSaveProperty, isCompared, toggleCompareProperty } = useApp();

    if (!property) return null;

    const propertyId = property.sourcePropertyId || property._id;
    const hasPhoto = property.photos && property.photos.length > 0 && property.photos[0];
    const imageSrc = hasPhoto ? property.photos[0] : null;

    const cleanTitle = getCleanPropertyTitle(property);
    const pricePerSqFt = calculatePricePerSqFt(property.propertyPrice, property.area);
    const saved = isSaved(propertyId);
    const compared = isCompared(propertyId);

    const isPhysical = property.propertyPossessionType?.toLowerCase().includes("physical");

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1.5 flex-1">
            {/* Top Photo / Image Container */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                {!imageError && imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={cleanTitle}
                        onError={() => setImageError(true)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                ) : (
                    /* Clean Architectural Gradient Placeholder */
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 text-center relative overflow-hidden">
                        {/* Background Subtle Accent */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent"></div>
                        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-2 shadow-xs group-hover:scale-110 transition duration-300">
                            <Building2 size={26} />
                        </div>
                        <span className="relative z-10 text-xs font-bold text-slate-100">
                            {property.propertySubType || property.propertyType || "Bank Auction Asset"}
                        </span>
                        <span className="relative z-10 text-[10px] text-amber-400/90 font-medium mt-0.5">
                            {property.bankName || "Authorized Bank Notice"}
                        </span>
                    </div>
                )}

                {/* Gradient Shadow overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/30 pointer-events-none"></div>

                {/* Top Badges (Left) */}
                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 z-10">
                    <span className="rounded-xl bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-sm border border-slate-200/60">
                        {property.propertyType || "Property"}
                    </span>
                    {property.propertySubType && (
                        <span className="rounded-xl bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30 shadow-sm">
                            {property.propertySubType}
                        </span>
                    )}
                </div>

                {/* Top Quick Actions (Right: Save & Compare) */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                    {/* Compare Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCompareProperty(property);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer active:scale-90 ${
                            compared
                                ? "bg-amber-500 text-slate-950 font-black shadow-amber-500/30"
                                : "bg-white/90 text-slate-700 hover:bg-white hover:text-amber-600"
                        }`}
                        title={compared ? "In Comparison" : "Add to comparison"}
                    >
                        {compared ? <Check size={15} /> : <Scale size={15} />}
                    </button>

                    {/* Bookmark / Save Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSaveProperty(property);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl backdrop-blur-md transition-all shadow-sm cursor-pointer active:scale-90 ${
                            saved
                                ? "bg-rose-600 text-white shadow-rose-600/30"
                                : "bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600"
                        }`}
                        title={saved ? "Saved" : "Save property"}
                    >
                        <Bookmark size={15} className={saved ? "fill-white" : ""} />
                    </button>
                </div>

                {/* Bottom Overlay Badges inside image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                    {/* Possession Badge */}
                    {property.propertyPossessionType ? (
                        <span
                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black backdrop-blur-md ${
                                isPhysical
                                    ? "bg-emerald-500 text-white"
                                    : "bg-amber-500 text-slate-950"
                            }`}
                        >
                            {property.propertyPossessionType} Possession
                        </span>
                    ) : (
                        <span className="rounded-lg bg-slate-900/90 px-2 py-0.5 text-[10px] text-amber-300 font-bold backdrop-blur-md border border-amber-500/30">
                            SARFAESI Notice
                        </span>
                    )}

                    {/* Active Live Pulse */}
                    {property.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                            Live
                        </span>
                    ) : (
                        <span className="rounded-full bg-slate-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                            Closed
                        </span>
                    )}
                </div>
            </div>

            {/* Card Content Body */}
            <div className="flex flex-1 flex-col p-5">
                {/* Bank Name & Estimated Discount Tag */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    {property.bankName ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 truncate">
                            <Landmark size={14} className="shrink-0 text-amber-600" />
                            <span className="truncate">{property.bankName}</span>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        <Flame size={11} className="text-amber-600" />
                        <span>~25% Discount</span>
                    </span>
                </div>

                {/* Property Title */}
                <Link
                    to={`/properties/${propertyId}`}
                    className="group-hover:text-amber-700 transition"
                >
                    <h3 className="line-clamp-2 min-h-[44px] text-base font-extrabold text-slate-900 leading-snug">
                        {cleanTitle}
                    </h3>
                </Link>

                {/* Reserve Price & Rate per sq.ft */}
                <div className="mt-3.5 flex items-baseline justify-between gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Reserve Price (Tax Free)
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                            {formatINR(property.propertyPrice)}
                        </span>
                    </div>

                    {pricePerSqFt && (
                        <span className="rounded-xl bg-white border border-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-2xs">
                            {pricePerSqFt}
                        </span>
                    )}
                </div>

                {/* Location & Specs */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    {/* Location */}
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="shrink-0 text-amber-600" />
                        <span className="truncate text-slate-800 font-semibold">
                            {property.cityName || "Location Unspecified"}
                            {property.stateName ? `, ${property.stateName}` : ""}
                        </span>
                    </div>

                    {/* Area & Source ID */}
                    <div className="flex items-center justify-between text-slate-600">
                        {property.area ? (
                            <div className="flex items-center gap-1.5">
                                <Ruler size={14} className="shrink-0 text-slate-400" />
                                <span className="font-medium text-slate-700">
                                    {property.area} {property.unitOfMeasurement || "sq.ft"}
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-[11px]">Area in Bank Gazette</span>
                        )}

                        {property.sourcePropertyId && (
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                ID: {property.sourcePropertyId.slice(0, 8)}...
                            </span>
                        )}
                    </div>
                </div>

                {/* View Details Action Button with Arrow Slide */}
                <div className="mt-5 pt-1">
                    <Link
                        to={`/properties/${propertyId}`}
                        className="group/btn relative flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 px-4 py-3 text-xs font-black text-amber-400 border border-slate-900 shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer overflow-hidden"
                    >
                        <span>View Official Notice</span>
                        <ArrowRight size={14} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
