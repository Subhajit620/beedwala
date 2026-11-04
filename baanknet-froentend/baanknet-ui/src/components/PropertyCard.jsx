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
    FileText,
    Calendar,
    Phone,
    Share2
} from "lucide-react";
import { MarketActivityIcon } from "./BrandIcons";
import {
    formatINR,
    calculatePricePerSqFt,
    getCleanPropertyTitle
} from "../utils/formatters";
import { getAuctionSchedule } from "../utils/auctionScheduler";
import { useApp } from "../context/AppContext";
import InquiryModal from "./InquiryModal";
import SoldStamp from "./SoldStamp";

export default function PropertyCard({ property, viewMode = "grid" }) {
    const [imageError, setImageError] = useState(false);
    const [inquiryOpen, setInquiryOpen] = useState(false);
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
    const directPhone = String(property.contactPhone || "7439409340").trim();
    const directTelHref = `tel:${directPhone.replace(/\s+/g, "")}`;

    // 1-Click Share on WhatsApp to drive organic referral traffic to the site
    const handleShareWhatsApp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const shareUrl = `${window.location.origin}/properties/${propertyId}`;
        const text = encodeURIComponent(
            `🏛️ *Verified Bank Auction Property on Bidwallah*\n\n` +
            `*${cleanTitle}*\n` +
            `💰 *Reserve Price:* ${formatINR(property.propertyPrice)}\n` +
            (schedule ? `📅 *EMD Submission Date:* ${schedule.emdSubmissionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n` : "") +
            `📍 *Location:* ${property.locality ? `${property.locality}, ` : ""}${property.cityName || "India"}\n` +
            `🏦 *Bank:* ${property.bankName || "Authorized Bank"}\n\n` +
            `👉 View full details & photos on Bidwallah:\n${shareUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    // ==========================================
    // LIST VIEW LAYOUT (Compact, High-Density Row)
    // ==========================================
    if (viewMode === "list") {
        return (
            <>
                <div className={`group relative flex flex-col md:flex-row overflow-hidden rounded-2xl sm:rounded-3xl border shadow-xs transition-all duration-300 ${
                    property.isSold
                        ? "border-slate-300/90 bg-slate-50/40"
                        : "border-slate-200/90 bg-white hover:shadow-xl hover:border-amber-400/80"
                }`}>
                    {/* Left Image / Thumbnail */}
                    <div className="relative h-48 md:h-auto md:w-64 lg:w-72 shrink-0 overflow-hidden bg-slate-950">
                        {!imageError && imageSrc ? (
                            <img
                                src={imageSrc}
                                alt={cleanTitle}
                                onError={() => setImageError(true)}
                                loading="lazy"
                                className={`h-full w-full object-cover transition-transform duration-500 ${
                                    property.isSold
                                        ? "grayscale contrast-125 brightness-90"
                                        : "group-hover:scale-105"
                                }`}
                            />
                        ) : (
                            <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 text-center ${property.isSold ? "grayscale" : ""}`}>
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

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:hidden pointer-events-none" />

                        {/* SOLD OUT Circular Seal Overlay (List View) */}
                        {property.isSold && <SoldStamp variant="compact" />}

                        {/* Possession Badge on Image */}
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                            {property.isSold ? (
                                <span className="rounded-lg bg-slate-900/90 border border-white/15 px-2 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                                    Archived Listing
                                </span>
                            ) : property.propertyPossessionType ? (
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
                                    <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-bold ${
                                        property.isSold
                                            ? "bg-slate-100 border-slate-200 text-slate-600"
                                            : "bg-amber-50 border-amber-200/80 text-amber-800"
                                    }`}>
                                        <Landmark size={12} className={property.isSold ? "text-slate-500" : "text-amber-600"} />
                                        {property.bankName}
                                    </span>
                                )}
                                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                    {property.propertyType || "Property"}
                                </span>
                                {property.propertySubType && (
                                    <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                                        property.isSold
                                            ? "bg-slate-100 border-slate-200 text-slate-500"
                                            : "bg-amber-50 text-amber-900 border-amber-200/60"
                                    }`}>
                                        {property.propertySubType}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <Link to={`/properties/${propertyId}`}>
                                <h3 className={`text-sm sm:text-base font-extrabold transition line-clamp-2 ${
                                    property.isSold
                                        ? "text-slate-700 hover:text-slate-950"
                                        : "text-slate-900 hover:text-amber-700"
                                }`}>
                                    {cleanTitle}
                                </h3>
                            </Link>

                            {/* Location & Specs */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1 text-slate-600 font-medium">
                                    <MapPin size={13} className={`shrink-0 ${property.isSold ? "text-slate-400" : "text-amber-600"}`} />
                                    <span>
                                        {property.locality ? `${property.locality}, ` : ""}
                                        {property.cityName || "Kolkata"}, {property.stateName || "WB"}
                                    </span>
                                </div>

                                {property.area ? (
                                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                                        <Ruler size={13} className="text-slate-400 shrink-0" />
                                        <span>
                                            {property.area} {property.unitOfMeasurement || "sq.ft"}
                                        </span>
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
                        <div className="mt-3 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                                Notice ID:{" "}
                                <strong className="font-mono text-slate-600">
                                    {property.sourcePropertyId || property.propertyUniqueId || property._id?.toString().slice(-8)}
                                </strong>
                            </span>
                            {property.isSold ? (
                                <span className="text-rose-700 font-black bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 uppercase tracking-wider text-[10px]">
                                    Deal Closed • Sold
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Bank Auction Asset
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right Action & Price Panel */}
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end p-4 sm:p-5 bg-slate-100/60 border-t md:border-t-0 md:border-l border-slate-200/80 md:w-64 shrink-0">
                        <div className="text-left md:text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                {property.isSold ? "Last Reserve Price" : "Reserve Price"}
                            </span>
                            <div className="flex items-center md:justify-end gap-1.5">
                                <span className={`text-lg sm:text-xl font-black ${
                                    property.isSold
                                        ? "text-slate-400 line-through decoration-rose-500 decoration-2"
                                        : "text-slate-950"
                                }`}>
                                    {formatINR(property.propertyPrice)}
                                </span>
                                {property.isSold && (
                                    <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                                        SOLD
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col md:items-end gap-0.5 mt-1 text-[11px] text-slate-500">
                                {pricePerSqFt && (
                                    <span className={`font-semibold ${property.isSold ? "text-slate-500" : "text-amber-700"}`}>
                                        {pricePerSqFt}
                                    </span>
                                )}
                                {property.isSold ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded text-[10px] mt-1">
                                        Auction Concluded
                                    </span>
                                ) : (
                                    schedule && (
                                        <>
                                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded text-[10px] mt-0.5">
                                                <Calendar size={11} className="text-rose-600" />
                                                <span>
                                                    EMD Date: {schedule.emdSubmissionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[10px] mt-0.5">
                                                <Calendar size={11} className="text-amber-600" />
                                                <span>
                                                    Auction: {schedule.auctionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                            </span>
                                        </>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-1.5 mt-0 md:mt-4">
                            {!property.isSold && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleShareWhatsApp}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                                        title="Share on WhatsApp"
                                    >
                                        <Share2 size={14} />
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
                                </>
                            )}

                            {property.isSold ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setInquiryOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    <Phone size={13} />
                                    <span>Find Similar</span>
                                </button>
                            ) : (
                                <a
                                    href={directTelHref}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950"
                                    title={`Call ${directPhone}`}
                                >
                                    <Phone size={13} />
                                    <span>{directPhone}</span>
                                </a>
                            )}

                            <Link
                                to={`/properties/${propertyId}`}
                                className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                    property.isSold
                                        ? "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300"
                                        : "bg-slate-950 hover:bg-slate-800 text-amber-400"
                                }`}
                            >
                                <span>{property.isSold ? "Record" : "Details"}</span>
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>

                <InquiryModal
                    property={property}
                    isOpen={inquiryOpen}
                    onClose={() => setInquiryOpen(false)}
                />
            </>
        );
    }

    // ==========================================
    // GRID VIEW LAYOUT (Standard Card)
    // ==========================================
    return (
        <>
            <div className={`group relative flex flex-col overflow-hidden rounded-3xl border shadow-xs transition-all duration-300 flex-1 ${
                property.isSold
                    ? "border-slate-300/90 bg-slate-50/40"
                    : "border-slate-200/90 bg-white hover:shadow-2xl hover:border-amber-400/80 hover:-translate-y-1.5"
            }`}>
                {/* Top Photo / Image Container */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-950">
                    {!imageError && imageSrc ? (
                        <img
                            src={imageSrc}
                            alt={cleanTitle}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            className={`h-full w-full object-cover transition-transform duration-700 ${
                                property.isSold
                                    ? "grayscale contrast-125 brightness-90"
                                    : "group-hover:scale-108"
                            }`}
                        />
                    ) : (
                        <div className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 text-center relative overflow-hidden ${property.isSold ? "grayscale" : ""}`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/30 pointer-events-none" />

                    {/* SOLD OUT Circular Seal Overlay (Grid View) */}
                    {property.isSold && <SoldStamp variant="card" />}

                    {/* Top Badges (Left) */}
                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 z-10">
                        <span className={`rounded-xl backdrop-blur-md px-2.5 py-1 text-[11px] font-black shadow-sm border ${
                            property.isSold
                                ? "bg-slate-900/80 text-slate-200 border-white/15"
                                : "bg-white/95 text-slate-950 border-slate-200/60"
                        }`}>
                            {property.propertyType || "Property"}
                        </span>
                        {property.propertySubType && (
                            <span className={`rounded-xl backdrop-blur-md px-2.5 py-1 text-[11px] font-bold border shadow-sm ${
                                property.isSold
                                    ? "bg-slate-900/80 text-slate-300 border-white/15"
                                    : "bg-slate-950/85 text-amber-300 border-amber-400/30"
                            }`}>
                                {property.propertySubType}
                            </span>
                        )}
                    </div>

                    {/* Top Quick Actions (Right: Share on WhatsApp, Compare, Save) */}
                    {property.isSold ? (
                        <div className="absolute right-3 top-3 z-10">
                            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                                Archived
                            </span>
                        </div>
                    ) : (
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 z-10">
                            <button
                                type="button"
                                onClick={handleShareWhatsApp}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/95 hover:bg-emerald-500 text-white backdrop-blur-md transition-all shadow-sm cursor-pointer active:scale-90"
                                title="Share Property on WhatsApp"
                            >
                                <Share2 size={14} />
                            </button>

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
                    )}

                    {/* Bottom Overlay Badges inside image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
                        {property.isSold ? (
                            <span className="rounded-lg bg-slate-900/85 border border-white/15 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                                {property.propertyPossessionType
                                    ? `${property.propertyPossessionType} Possession`
                                    : "SARFAESI Notice"}
                            </span>
                        ) : property.propertyPossessionType ? (
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

                        {property.isSold ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/90 border border-rose-500/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                SOLD OUT
                            </span>
                        ) : property.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
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
                            <div className={`flex items-center gap-1.5 text-xs font-black truncate min-w-0 ${
                                property.isSold ? "text-slate-500" : "text-amber-700"
                            }`}>
                                <Landmark size={14} className={`shrink-0 ${property.isSold ? "text-slate-400" : "text-amber-600"}`} />
                                <span className="truncate">{property.bankName}</span>
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                            {property.isSold ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                                    Deal Closed
                                </span>
                            ) : (
                                <>
                                    {schedule && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/60 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                            <Calendar size={11} className="text-amber-600" />
                                            <span>{schedule.auctionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                        <MarketActivityIcon size={11} className="text-amber-600" />
                                        <span>~25%</span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Property Title */}
                    <Link
                        to={`/properties/${propertyId}`}
                        className={property.isSold ? "hover:text-slate-950 transition" : "group-hover:text-amber-700 transition"}
                    >
                        <h3 className={`line-clamp-2 min-h-[38px] sm:min-h-[44px] text-sm sm:text-base font-extrabold leading-snug ${
                            property.isSold ? "text-slate-700" : "text-slate-900"
                        }`}>
                            {cleanTitle}
                        </h3>
                    </Link>

                    {/* Reserve Price & Rate per sq.ft */}
                    <div
                        className={`mt-3 sm:mt-3.5 flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl border ${
                            property.isSold
                                ? "bg-slate-100/90 border-slate-200/90"
                                : "bg-slate-50/70 border-slate-100"
                        }`}
                    >
                        <div>
                            <span
                                className={`text-[10px] uppercase font-bold block tracking-wider ${
                                    property.isSold ? "text-slate-500" : "text-slate-400"
                                }`}
                            >
                                {property.isSold ? "Last Reserve Price" : "Reserve Price (Tax Free)"}
                            </span>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-lg sm:text-2xl font-black tracking-tight ${
                                        property.isSold
                                            ? "text-slate-400 line-through decoration-rose-500 decoration-2"
                                            : "text-slate-950"
                                    }`}
                                >
                                    {formatINR(property.propertyPrice)}
                                </span>
                            </div>
                        </div>

                        {property.isSold ? (
                            <span className="rounded-xl bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                                SOLD OUT
                            </span>
                        ) : (
                            pricePerSqFt && (
                                <span className="rounded-xl bg-white border border-slate-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-2xs">
                                    {pricePerSqFt}
                                </span>
                            )
                        )}
                    </div>

                    {/* Location & Specs */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-col gap-2 text-xs text-slate-500">
                        {/* Location */}
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} className={`shrink-0 ${property.isSold ? "text-slate-400" : "text-amber-600"}`} />
                            <span className={`truncate font-semibold ${property.isSold ? "text-slate-600" : "text-slate-800"}`}>
                                {property.locality ? `${property.locality}, ` : ""}
                                {property.cityName || "Location Unspecified"}
                                {property.stateName ? `, ${property.stateName}` : ""}
                            </span>
                        </div>

                        {/* Area & EMD Submission Date */}
                        <div className="flex items-center justify-between gap-2 text-slate-600">
                            {property.area ? (
                                <div className="flex items-center gap-1.5">
                                    <Ruler size={14} className="shrink-0 text-slate-400" />
                                    <span className={`font-medium ${property.isSold ? "text-slate-500" : "text-slate-700"}`}>
                                        {property.area} {property.unitOfMeasurement || "sq.ft"}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-[11px]">Area in Bank Gazette</span>
                            )}

                            {property.isSold ? (
                                <span className="inline-flex items-center rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
                                    Auction Concluded
                                </span>
                            ) : schedule ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 shrink-0">
                                    <Calendar size={11} className="text-rose-600" />
                                    <span>
                                        EMD: {schedule.emdSubmissionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </span>
                                </span>
                            ) : property.sourcePropertyId ? (
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                    ID: {property.sourcePropertyId.slice(0, 8)}...
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Dual Action Row */}
                    <div className="mt-4 pt-1 grid grid-cols-2 gap-2">
                        {property.isSold ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setInquiryOpen(true);
                                }}
                                className="flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-black shadow-sm transition cursor-pointer active:scale-[0.98] bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                <Phone size={13} />
                                <span>Find Similar</span>
                            </button>
                        ) : (
                            <a
                                href={directTelHref}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-black shadow-sm transition cursor-pointer active:scale-[0.98] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950"
                                title={`Call ${directPhone}`}
                            >
                                <Phone size={13} />
                                <span>{directPhone}</span>
                            </a>
                        )}

                        <Link
                            to={`/properties/${propertyId}`}
                            className={`group/btn flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-black border shadow-sm transition active:scale-[0.98] ${
                                property.isSold
                                    ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                                    : "bg-slate-950 hover:bg-slate-800 text-amber-400 border-slate-900"
                            }`}
                        >
                            <span>{property.isSold ? "View Record" : "View Details"}</span>
                            <ArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </div>

            <InquiryModal
                property={property}
                isOpen={inquiryOpen}
                onClose={() => setInquiryOpen(false)}
            />
        </>
    );
}
