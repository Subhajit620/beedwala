import React, { useEffect, useState, useCallback, useMemo } from "react";
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
    ArrowRight
} from "lucide-react";

import { fetchPropertyById, fetchProperties } from "../services/propertyService";
import {
    formatINR,
    formatDate,
    calculatePricePerSqFt,
    getCleanPropertyTitle
} from "../utils/formatters";
import PropertyGallery from "../components/PropertyGallery";
import PropertyCard from "../components/PropertyCard";
import EmiCalculator from "../components/EmiCalculator";
import InquiryModal from "../components/InquiryModal";
import { LoadingSpinner } from "../components/Loading";
import { useApp } from "../context/AppContext";

export default function PropertyDetails() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [allProperties, setAllProperties] = useState([]);
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
            const [propRes, allRes] = await Promise.allSettled([
                fetchPropertyById(id),
                fetchProperties()
            ]);

            if (propRes.status === "fulfilled" && propRes.value?.data) {
                setProperty(propRes.value.data);
            } else {
                setError("Property details not found.");
            }

            if (allRes.status === "fulfilled" && allRes.value?.data) {
                setAllProperties(allRes.value.data);
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

    // Find similar properties (same city, bank, or property type)
    const similarProperties = useMemo(() => {
        if (!property || !allProperties.length) return [];
        const currentId = property.sourcePropertyId || property._id;
        return allProperties
            .filter((p) => {
                const pId = p.sourcePropertyId || p._id;
                if (pId === currentId) return false;
                return (
                    p.cityName === property.cityName ||
                    p.bankName === property.bankName ||
                    p.propertyType === property.propertyType
                );
            })
            .slice(0, 3);
    }, [property, allProperties]);

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
        <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                    <div className="flex items-center gap-2">
                        {/* Compare Toggle */}
                        <button
                            onClick={() => toggleCompareProperty(property)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                compared
                                    ? "border-amber-500 bg-amber-500 text-slate-950"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            <Scale size={14} />
                            <span>{compared ? "In Comparison" : "Compare"}</span>
                        </button>

                        {/* Save to Watchlist */}
                        <button
                            onClick={() => toggleSaveProperty(property)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                saved
                                    ? "border-rose-600 bg-rose-600 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                            }`}
                        >
                            <Bookmark size={14} className={saved ? "fill-white" : ""} />
                            <span>{saved ? "Saved" : "Save"}</span>
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span className="text-emerald-600">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Share2 size={14} className="text-slate-500" />
                                    <span>Share</span>
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
                    {/* Left Column (8 cols): Gallery, Specs, Bank Info, EMI Calculator */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* 1. Image Gallery */}
                        <PropertyGallery photos={property.photos || []} title={cleanTitle} />

                        {/* 2. Main Title Banner */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
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

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                                {cleanTitle}
                            </h1>

                            {/* Full Property Description */}
                            {property.propertyTitle && (
                                <div className="mt-5 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Official Bank Auction Property Notice
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {property.propertyTitle}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 3. Property Information Grid */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Building2 size={18} className="text-amber-500" />
                                <span>Property Specifications</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                                {property.area ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Super Area</span>
                                        <span className="font-bold text-slate-800">
                                            {property.area} {property.unitOfMeasurement || "sq.ft"}
                                        </span>
                                    </div>
                                ) : null}

                                {property.unitOfMeasurement ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Unit of Measurement</span>
                                        <span className="font-bold text-slate-800">{property.unitOfMeasurement}</span>
                                    </div>
                                ) : null}

                                {property.propertyPossessionType ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Possession Type</span>
                                        <span className="font-bold text-slate-800">{property.propertyPossessionType}</span>
                                    </div>
                                ) : null}

                                {property.propertyOwnershipType ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Ownership Type</span>
                                        <span className="font-bold text-slate-800">{property.propertyOwnershipType}</span>
                                    </div>
                                ) : null}

                                {property.facing ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Facing</span>
                                        <span className="font-bold text-slate-800">{property.facing}</span>
                                    </div>
                                ) : null}

                                {pricePerSqFt ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Estimated Rate</span>
                                        <span className="font-bold text-amber-600">{pricePerSqFt}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 4. Location & Jurisdiction Details */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <MapPin size={18} className="text-amber-500" />
                                <span>Location & Legal Jurisdiction</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                                {property.cityName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">City</span>
                                        <span className="font-bold text-slate-800">{property.cityName}</span>
                                    </div>
                                ) : null}

                                {property.districtName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">District</span>
                                        <span className="font-bold text-slate-800">{property.districtName}</span>
                                    </div>
                                ) : null}

                                {property.stateName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">State</span>
                                        <span className="font-bold text-slate-800">{property.stateName}</span>
                                    </div>
                                ) : null}

                                {property.pincode ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Postal Pincode</span>
                                        <span className="font-mono font-bold text-slate-800">{property.pincode}</span>
                                    </div>
                                ) : null}

                                {property.locality ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Locality</span>
                                        <span className="font-bold text-slate-800">{property.locality}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 5. Bank & Institution Branch Information */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Landmark size={18} className="text-amber-500" />
                                <span>Authorised Banking Institution</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                                {property.bankName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2 flex items-center justify-between">
                                        <div>
                                            <span className="text-slate-400 text-xs block mb-1">Authorized Bank</span>
                                            <span className="font-bold text-slate-900 text-base">{property.bankName}</span>
                                        </div>
                                        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center justify-center">
                                            <Landmark size={20} />
                                        </div>
                                    </div>
                                ) : null}

                                {property.bankAddress ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 sm:col-span-2">
                                        <span className="text-slate-400 text-xs block mb-1">Branch Dealing Address</span>
                                        <span className="font-medium text-slate-700 leading-relaxed">{property.bankAddress}</span>
                                    </div>
                                ) : null}

                                {property.departmentName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Department</span>
                                        <span className="font-semibold text-slate-800">{property.departmentName}</span>
                                    </div>
                                ) : null}

                                {property.regionalOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Regional Office</span>
                                        <span className="font-semibold text-slate-800">{property.regionalOfficeName}</span>
                                    </div>
                                ) : null}

                                {property.zonalOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Zonal Office</span>
                                        <span className="font-semibold text-slate-800">{property.zonalOfficeName}</span>
                                    </div>
                                ) : null}

                                {property.headOfficeName ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Head Office</span>
                                        <span className="font-semibold text-slate-800">{property.headOfficeName}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 6. Auction Legal Action Details */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <FileCheck2 size={18} className="text-amber-500" />
                                <span>Statutory Auction Notice Record</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                                {property.propTypeOfAction ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Enforcement Action</span>
                                        <span className="font-bold text-amber-600">{property.propTypeOfAction}</span>
                                    </div>
                                ) : null}

                                {createdDate ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Notice Publication Date</span>
                                        <span className="font-semibold text-slate-800">{createdDate}</span>
                                    </div>
                                ) : null}

                                {property.isActive !== undefined ? (
                                    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                        <span className="text-slate-400 text-xs block mb-1">Verification Status</span>
                                        <span className="font-bold text-emerald-600">
                                            {property.isActive ? "100% Authorized Listing" : "Archived"}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* 7. Interactive EMI Calculator Component (Pre-loaded with this property price) */}
                        <EmiCalculator defaultPrice={property.propertyPrice} />
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

                {/* Similar Properties Showcase */}
                {similarProperties.length > 0 && (
                    <section className="mt-16 sm:mt-20 pt-12 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                    Related Deals
                                </span>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                                    Similar Bank Properties in Region
                                </h3>
                            </div>
                            <Link
                                to="/properties"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
                            >
                                <span>View All</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {similarProperties.map((p) => (
                                <PropertyCard key={p.sourcePropertyId || p._id} property={p} />
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
        </main>
    );
}
