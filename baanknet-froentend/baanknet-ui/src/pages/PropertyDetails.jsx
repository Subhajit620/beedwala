import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    MapPin,
    Landmark,
    FileCheck2,
    AlertCircle,
    RotateCcw,
    Phone,
    Share2,
    CheckCircle2,
    Bookmark,
    Scale,
    Printer,
    ArrowRight,
    Navigation,
    ExternalLink
} from "lucide-react";

import { fetchPropertyById, fetchPropertyRecommendations } from "../services/propertyService";
import {
    formatINR,
    formatDate,
    calculatePricePerSqFt,
    getCleanPropertyTitle
} from "../utils/formatters";
import PropertyGallery from "../components/PropertyGallery";
import PropertyVideos from "../components/PropertyVideos";
import PropertyCard from "../components/PropertyCard";
import AuctionCountdown from "../components/AuctionCountdown";
import InquiryModal from "../components/InquiryModal";
import { LoadingSpinner } from "../components/Loading";
import { useApp } from "../context/AppContext";

export default function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [inquiryOpen, setInquiryOpen] = useState(false);

    const {
        isSaved,
        toggleSaveProperty,
        isCompared,
        toggleCompareProperty,
        addToast
    } = useApp();

    const loadProperty = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [propRes, recsRes] = await Promise.allSettled([
                fetchPropertyById(id),
                fetchPropertyRecommendations(id, 3)
            ]);

            if (propRes.status === "fulfilled" && propRes.value?.data) {
                setProperty(propRes.value.data);
            } else {
                setError("Property details not found.");
            }

            if (recsRes.status === "fulfilled" && recsRes.value?.data) {
                setRecommendations(recsRes.value.data);
            }
        } catch (err) {
            console.error("Failed to load property details:", err);
            setError("Unable to load properties. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        let isMounted = true;
        async function init() {
            if (isMounted) {
                await loadProperty();
                window.scrollTo(0, 0);
            }
        }
        init();
        return () => {
            isMounted = false;
        };
    }, [loadProperty]);

    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            addToast("Listing link copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-20">
                <LoadingSpinner text="Loading property details..." />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-slate-50 py-20 px-4">
                <div className="mx-auto max-w-lg rounded-3xl border border-red-200 bg-white p-10 text-center shadow-xs">
                    <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
                    <h2 className="text-xl font-bold text-slate-900">
                        {error || "Property Not Found"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Please verify the link or try again later.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={loadProperty}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>Try Again</span>
                        </button>
                        <Link
                            to="/properties"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-xs font-bold text-slate-700 transition"
                        >
                            <ArrowLeft size={14} />
                            <span>Back to Listings</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const cleanTitle = getCleanPropertyTitle(property);
    const pricePerSqFt = calculatePricePerSqFt(property.propertyPrice, property.area);
    const createdDate = formatDate(property.createdOn || property.createdAt);
    const propertyId = property.sourcePropertyId || property._id;
    const saved = isSaved(propertyId);
    const compared = isCompared(propertyId);

    return (
        <main className="min-h-screen bg-slate-50 pt-5 sm:pt-8 pb-28 lg:pb-12">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                {/* Top Action Breadcrumb Bar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <Link
                        to="/properties"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to all properties</span>
                    </Link>

                    {/* Action Buttons: Save, Compare, Share, Print */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Compare Toggle */}
                        <button
                            onClick={() => toggleCompareProperty(property)}
                            className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                compared
                                    ? "border-amber-500 bg-amber-500 text-slate-950"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                            title={compared ? "Remove from comparison" : "Add to comparison"}
                        >
                            <Scale size={14} />
                            <span className="hidden xs:inline">{compared ? "In Comparison" : "Compare"}</span>
                        </button>

                        {/* Save to Watchlist */}
                        <button
                            onClick={() => toggleSaveProperty(property)}
                            className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                saved
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                            }`}
                            title={saved ? "Saved in watchlist" : "Save property"}
                        >
                            <Bookmark size={14} className={saved ? "fill-white" : ""} />
                            <span className="hidden xs:inline">{saved ? "Saved" : "Save"}</span>
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                            title="Share property link"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-emerald-600 hidden xs:inline">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Share2 size={14} className="text-slate-500" />
                                    <span className="hidden xs:inline">Share</span>
                                </>
                            )}
                        </button>

                        {/* Print Factsheet */}
                        <button
                            onClick={handlePrint}
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                            title="Print Property Factsheet"
                        >
                            <Printer size={14} className="text-slate-500" />
                            <span>Print</span>
                        </button>
                    </div>
                </div>

                {/* Main 12-col Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (8 cols): Gallery, Specs, Bank Info */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* 1. Image Gallery */}
                        <PropertyGallery
                            photos={
                                property.photos && property.photos.length > 0
                                    ? property.photos
                                    : (property.displayImage ? [property.displayImage] : [])
                            }
                            title={cleanTitle}
                        />

                        {/* 2. Main Title Banner */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {property.propertyType && (
                                    <span className="rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-1 text-xs font-bold text-amber-700">
                                        {property.propertyType}
                                    </span>
                                )}
                                {property.propertySubType && (
                                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                        {property.propertySubType}
                                    </span>
                                )}
                                {property.propertyPossessionType && (
                                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                                        {property.propertyPossessionType} Possession
                                    </span>
                                )}
                                {property.isActive !== undefined && (
                                    <span
                                        className={`rounded-xl px-3 py-1 text-xs font-bold ${
                                            property.isActive
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-200 text-slate-700"
                                        }`}
                                    >
                                        {property.isActive ? "Verified Active Notice" : "Closed"}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug">
                                {cleanTitle}
                            </h1>

                            {/* Full Property Description / Notes */}
                            {(property.propertyDescription || property.propertyTitle) && (
                                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Property Details & Auction Notice
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                        {property.propertyDescription || property.propertyTitle}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Interactive Auction Countdown & Calendar Sync Engine */}
                        <AuctionCountdown property={property} variant="full" />

                        {/* 3. Property Information Grid */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <Building2 size={18} className="text-amber-500" />
                                <span>Property Specifications</span>
                            </h3>

                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                {property.area ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Super Area</span>
                                        <span className="font-bold text-slate-800">
                                            {property.area} {property.unitOfMeasurement || "sq.ft"}
                                        </span>
                                    </div>
                                ) : null}

                                {property.unitOfMeasurement ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Unit of Measurement</span>
                                        <span className="font-bold text-slate-800">{property.unitOfMeasurement}</span>
                                    </div>
                                ) : null}

                                {property.propertyPossessionType ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Possession Type</span>
                                        <span className="font-bold text-slate-800">{property.propertyPossessionType}</span>
                                    </div>
                                ) : null}

                                {property.propertyOwnershipType ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Ownership Type</span>
                                        <span className="font-bold text-slate-800">{property.propertyOwnershipType}</span>
                                    </div>
                                ) : null}

                                {property.facing ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Facing</span>
                                        <span className="font-bold text-slate-800">{property.facing}</span>
                                    </div>
                                ) : null}

                                {pricePerSqFt ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Estimated Rate</span>
                                        <span className="font-bold text-amber-600">{pricePerSqFt}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* Property Videos (only rendered when the listing has videos) */}
                        <PropertyVideos videos={property.videos} />

                        {/* 4. Location & Jurisdiction Details */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <MapPin size={18} className="text-amber-500" />
                                <span>Location & Legal Jurisdiction</span>
                            </h3>

                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                {property.cityName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">City</span>
                                        <span className="font-bold text-slate-800">{property.cityName}</span>
                                    </div>
                                ) : null}

                                {property.districtName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">District</span>
                                        <span className="font-bold text-slate-800">{property.districtName}</span>
                                    </div>
                                ) : null}

                                {property.stateName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">State</span>
                                        <span className="font-bold text-slate-800">{property.stateName}</span>
                                    </div>
                                ) : null}

                                {property.pincode ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Postal Pincode</span>
                                        <span className="font-mono font-bold text-slate-800">{property.pincode}</span>
                                    </div>
                                ) : null}

                                {property.locality ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Locality</span>
                                        <span className="font-bold text-slate-800">{property.locality}</span>
                                    </div>
                                ) : null}

                                {property.latitude && property.longitude ? (
                                    <div className="rounded-2xl bg-amber-50/80 p-4 border border-amber-200/80 sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                                                <Navigation size={18} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                                        Live GPS Coordinates
                                                    </span>
                                                    <span className="rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide">
                                                        Verified Pin
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs text-slate-600 block mt-0.5">
                                                    {property.latitude}° N, {property.longitude}° E
                                                </span>
                                            </div>
                                        </div>

                                        <a
                                            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <span>Open in Google Maps</span>
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 5. Bank & Institution Branch Information */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <Landmark size={18} className="text-amber-500" />
                                <span>Authorised Banking Institution</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                {property.bankName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100 sm:col-span-2 flex items-center justify-between">
                                        <div>
                                            <span className="text-slate-400 text-xs block mb-1">Authorized Bank</span>
                                            <span className="font-bold text-slate-900 text-sm sm:text-base">{property.bankName}</span>
                                        </div>
                                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center justify-center shrink-0">
                                            <Landmark size={18} />
                                        </div>
                                    </div>
                                ) : null}

                                {property.bankAddress ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100 sm:col-span-2">
                                        <span className="text-slate-400 text-xs block mb-1">Branch Dealing Address</span>
                                        <span className="font-medium text-slate-700 leading-relaxed">{property.bankAddress}</span>
                                    </div>
                                ) : null}

                                {property.departmentName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Department</span>
                                        <span className="font-semibold text-slate-800">{property.departmentName}</span>
                                    </div>
                                ) : null}

                                {property.regionalOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Regional Office</span>
                                        <span className="font-semibold text-slate-800">{property.regionalOfficeName}</span>
                                    </div>
                                ) : null}

                                {property.zonalOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Zonal Office</span>
                                        <span className="font-semibold text-slate-800">{property.zonalOfficeName}</span>
                                    </div>
                                ) : null}

                                {property.headOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Head Office</span>
                                        <span className="font-semibold text-slate-800">{property.headOfficeName}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 6. Auction Legal Action Details */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                                <FileCheck2 size={18} className="text-amber-500" />
                                <span>Statutory Auction Notice Record</span>
                            </h3>

                            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                {property.propTypeOfAction ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Enforcement Action</span>
                                        <span className="font-bold text-amber-600">{property.propTypeOfAction}</span>
                                    </div>
                                ) : null}

                                {createdDate ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Notice Publication Date</span>
                                        <span className="font-semibold text-slate-800">{createdDate}</span>
                                    </div>
                                ) : null}

                                {property.isActive !== undefined ? (
                                    <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-100 xs:col-span-2 lg:col-span-1">
                                        <span className="text-slate-400 text-xs block mb-1">Verification Status</span>
                                        <span className="font-bold text-emerald-600">
                                            {property.isActive ? "100% Authorized Listing" : "Archived"}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (4 cols): Sticky Price Card & Inquire CTA */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl space-y-6">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-semibold block">
                                    Reserve Price (Tax Free Benchmark)
                                </span>
                                <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                                    {formatINR(property.propertyPrice)}
                                </div>
                                {pricePerSqFt && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Valuation rate: <strong className="text-slate-800">{pricePerSqFt}</strong>
                                    </p>
                                )}
                            </div>

                            {/* Property Unique ID */}
                            {property.propertyUniqueId && (
                                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs">
                                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                                        Source Property ID
                                    </span>
                                    <span className="font-mono font-bold text-slate-900">
                                        {property.propertyUniqueId}
                                    </span>
                                </div>
                            )}

                            {/* Sticky Compact Auction Countdown */}
                            <AuctionCountdown property={property} variant="compact" />

                            {/* Key Highlights List */}
                            <div className="space-y-2.5 pt-2 text-xs text-slate-600">
                                {property.bankName && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">Lending Bank</span>
                                        <span className="font-bold text-slate-800 text-right">{property.bankName}</span>
                                    </div>
                                )}
                                {property.cityName && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">City Location</span>
                                        <span className="font-bold text-slate-800">{property.cityName}</span>
                                    </div>
                                )}
                                {property.propertyPossessionType && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">Possession Status</span>
                                        <span className="font-bold text-emerald-600">{property.propertyPossessionType}</span>
                                    </div>
                                )}
                                {property.area && (
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-400 font-medium">Total Area</span>
                                        <span className="font-bold text-slate-800">
                                            {property.area} {property.unitOfMeasurement || "sq.ft"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setInquiryOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3.5 px-4 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-[0.98]"
                                >
                                    <Phone size={16} />
                                    <span>Contact Authorized Bank Desk</span>
                                </button>

                                <Link
                                    to="/contact"
                                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 py-3 px-4 text-xs font-bold text-slate-700 transition"
                                >
                                    <span>Request Tender & EMD Form</span>
                                </Link>

                                <div className="text-center pt-2">
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        All transactions governed under SARFAESI Act, 2002. No brokerage or middleman fees.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommended Similar Properties Showcase */}
                {recommendations.length > 0 && (
                    <section className="mt-16 sm:mt-20 pt-12 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                    Algorithmic Discovery
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                                    Recommended Similar Auction Assets
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Matched by category ({property.propertySubType || property.propertyType}) and comparable valuation bracket.
                                </p>
                            </div>
                            <Link
                                to={`/properties?subType=${encodeURIComponent(property.propertySubType || "")}`}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                            >
                                <span>View Category</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendations.map((p) => (
                                <div key={p.sourcePropertyId || p._id} className="flex flex-col">
                                    {p.recommendationReason && (
                                        <div className="mb-2 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/80 inline-flex items-center gap-1 self-start">
                                            <span>✨ {p.recommendationReason}</span>
                                        </div>
                                    )}
                                    <PropertyCard property={p} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Interactive Bank Officer Inquiry Modal */}
            <InquiryModal
                property={property}
                isOpen={inquiryOpen}
                onClose={() => setInquiryOpen(false)}
            />

            {/* Mobile Sticky Bottom Inquiry / Price Bar */}
            <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-lg lg:hidden">
                <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
                            Reserve Price
                        </span>
                        <div className="text-base xs:text-lg font-black text-slate-900 truncate">
                            {formatINR(property.propertyPrice)}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setInquiryOpen(true)}
                        className="shrink-0 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
                    >
                        <Phone size={14} />
                        <span>Contact Bank Desk</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
