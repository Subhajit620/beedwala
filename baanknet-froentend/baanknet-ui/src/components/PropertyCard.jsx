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
    FileText,
    Calendar
} from "lucide-react";
import {
    formatINR,
    calculatePricePerSqFt,
    getCleanPropertyTitle
} from "../utils/formatters";
import { getAuctionSchedule } from "../utils/auctionScheduler";
import { useApp } from "../context/AppContext";

export default function PropertyCard({ property, viewMode = "grid" }) {
    const [imageError, setImageError] = useState(false);
    const { isSaved, toggleSaveProperty, isCompared, toggleCompareProperty } = useApp();

    if (!property) return null;

    const propertyId = property.sourcePropertyId || property.propertyUniqueId || property._id;
    const imageSrc = property.displayImage || (property.photos && property.photos.length > 0 ? property.photos[0] : null);

    const cleanTitle = getCleanPropertyTitle(property);
    const pricePerSqFt = calculatePricePerSqFt(property.propertyPrice, property.area);
    const saved = isSaved(propertyId);
    const compared = isCompared(propertyId);

    const isPhysical = property.propertyPossessionType?.toLowerCase().includes("physical");
    const schedule = getAuctionSchedule(property);

    // ==========================================
    // LIST VIEW LAYOUT (Compact, High-Density Row)
    // ==========================================
    if (viewMode === "list") {
        return (
            <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:border-amber-400/80 transition-all duration-300">
                {/* Left Image / Thumbnail */}
                <div className="relative h-48 md:h-auto md:w-64 lg:w-72 shrink-0 overflow-hidden bg-slate-950">
                    {!imageError && imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={cleanTitle}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-1.5">
                                <Building2 size={22} />
                            </div>
                            <span className="text-xs font-bold text-slate-100">
                                {property.propertySubType || property.propertyType || "Bank Auction Asset"}
                            </span>
                            <span className="text-[10px] text-amber-400 font-medium mt-0.5">
                                {property.bankName || "Authorized Bank Notice"}
                            </span>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:hidden pointer-events-none"></div>

                    {/* Possession Badge on Image */}
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                        {property.propertyPossessionType ? (
                            <span
                                className={`rounded-lg px-2 py-0.5 text-[10px] font-black backdrop-blur-md ${
                                    isPhysical
                                        ? "bg-emerald-500 text-white"
                                        : "bg-amber-500 text-slate-950"
                                }`}
                            >
                                {property.propertyPossessionType}
                            </span>
                        ) : (
                            <span className="rounded-lg bg-slate-900/90 px-2 py-0.5 text-[10px] text-amber-300 font-bold backdrop-blur-md">
                                SARFAESI
                            </span>
                        )}
                    </div>
                </div>

                {/* Middle Content Details */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                        {/* Top Bank & Property Type Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            {property.bankName && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200/80 px-2 py-0.5 text-xs font-bold text-amber-800">
                                    <Landmark size={12} className="text-amber-600" />
                                    {property.bankName}
                                </span>
                            )}
                            <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                {property.propertyType || "Property"}
                            </span>
                            {property.propertySubType && (
                                <span className="rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 text-[11px] font-semibold">
                                    {property.propertySubType}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <Link to={`/properties/${propertyId}`}>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 hover:text-amber-700 transition line-clamp-2">
                                {cleanTitle}
                            </h3>
                        </Link>

                        {/* Location & Specs */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                                <MapPin size={13} className="text-amber-600 shrink-0" />
                                <span>{property.locality ? `${property.locality}, ` : ""}{property.cityName || "Kolkata"}, {property.stateName || "WB"}</span>
                            </div>

                            {property.area ? (
                                <div className="flex items-center gap-1 text-slate-600 font-medium">
                                    <Ruler size={13} className="text-slate-400 shrink-0" />
                                    <span>{property.area} {property.unitOfMeasurement || "sq.ft"}</span>
                                </div>
                            ) : null}

                            {property.borrowerName && (
                                <div className="hidden lg:flex items-center gap-1 text-slate-500 text-[11px]">
                                    <FileText size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate max-w-xs">A/C: {property.borrowerName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Meta & Notice ID */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Notice ID: <strong className="font-mono text-slate-600">{property.sourcePropertyId || property.propertyUniqueId || property._id?.toString().slice(-8)}</strong></span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Bank Auction Asset
                        </span>
                    </div>
                </div>

                {/* Right Action & Price Panel */}
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end p-4 sm:p-5 bg-slate-50/70 border-t md:border-t-0 md:border-l border-slate-100 md:w-56 shrink-0">
                    <div className="text-left md:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Reserve Price
                        </span>
                        <div className="text-lg sm:text-xl font-black text-slate-950">
                            {formatINR(property.propertyPrice)}
                        </div>
                        <div className="flex flex-col md:items-end gap-0.5 mt-1 text-[11px] text-slate-500">
                            {pricePerSqFt && (
                                <span className="font-semibold text-amber-700">
                                    {pricePerSqFt}
                                </span>
                            )}
                            {schedule && (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[10px] mt-0.5">
                                    <Calendar size={11} className="text-amber-600" />
                                    <span>Auction: {schedule.auctionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-0 md:mt-4">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleCompareProperty(property);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                                compared
                                    ? "bg-amber-500 text-slate-950 border-amber-500"
                                    : "bg-white text-slate-600 hover:text-amber-600 border-slate-200"
                            }`}
                            title="Compare"
                        >
                            {compared ? <Check size={15} /> : <Scale size={15} />}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSaveProperty(property);
                            }}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                                saved
                                    ? "bg-rose-600 text-white border-rose-600"
                                    : "bg-white text-slate-600 hover:text-rose-600 border-slate-200"
                            }`}
                            title="Save"
                        >
                            <Bookmark size={15} className={saved ? "fill-white" : ""} />
                        </button>

                        <Link
                            to={`/properties/${propertyId}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 px-3.5 py-2 text-xs font-bold text-amber-400 transition"
                        >
                            <span>Notice</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // GRID VIEW LAYOUT (Standard Card)
    // ==========================================
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-2xl hover:border-amber-400/80 transition-all duration-300 hover:-translate-y-1.5 flex-1">
            {/* Top Photo / Image Container */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                {!imageError && imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={cleanTitle}
                        onError={() => setImageError(true)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 text-center relative overflow-hidden">
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
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Bank Name, Auction Date & Discount Tag */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                    {property.bankName ? (
                        <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 truncate min-w-0">
                            <Landmark size={14} className="shrink-0 text-amber-600" />
                            <span className="truncate">{property.bankName}</span>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                        {schedule && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                <Calendar size={11} className="text-amber-600" />
                                <span>{schedule.auctionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            <Flame size={11} className="text-amber-600" />
                            <span>~25%</span>
                        </span>
                    </div>
                </div>

                {/* Property Title */}
                <Link
                    to={`/properties/${propertyId}`}
                    className="group-hover:text-amber-700 transition"
                >
                    <h3 className="line-clamp-2 min-h-[38px] sm:min-h-[44px] text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                        {cleanTitle}
                    </h3>
                </Link>

                {/* Reserve Price & Rate per sq.ft */}
                <div className="mt-3 sm:mt-3.5 flex items-baseline justify-between gap-2 bg-slate-50/70 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Reserve Price (Tax Free)
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
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
                            {property.locality ? `${property.locality}, ` : ""}
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
