import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Building2,
    Landmark,
    MapPin,
    FileText,
    Image as ImageIcon,
    Plus,
    Trash2,
    Sparkles,
    Eye,
    AlertCircle,
    CheckCircle2,
    Layers,
    Tag,
    DollarSign
} from "lucide-react";
import { fetchPropertyById } from "../../services/propertyService";
import { createProperty, updateProperty } from "../../services/adminService";
import { formatINR } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";

export default function AdminPropertyForm() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const { addToast } = useApp();

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Simple Form State with Smart Defaults
    const [formData, setFormData] = useState({
        propertyHeading: "",
        propertyTitle: "",
        propertyType: "Residential",
        propertySubType: "Flat",
        propertyPrice: "",
        propertyPossessionType: "Physical Possession",
        propertyOwnershipType: "Freehold",
        propTypeOfAction: "SARFAESI Act 2002",
        area: "",
        unitOfMeasurement: "sq.ft",
        cityName: "Kolkata",
        stateName: "West Bengal",
        locality: "",
        pincode: "700001",
        bankName: "State Bank of India",
        bankAddress: "",
        departmentName: "Stressed Assets Recovery Branch",
        borrowerName: "",
        displayImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
        photos: [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"
        ],
        isActive: true
    });

    // Quick Sample Images for 1-click selection
    const samplePhotos = [
        { label: "Modern Flat", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80" },
        { label: "Commercial Office", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80" },
        { label: "Luxury Villa", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80" },
        { label: "Industrial Plot", url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80" }
    ];

    // Load existing property data for edit mode
    useEffect(() => {
        if (!isEditMode) return;

        let isMounted = true;
        fetchPropertyById(id)
            .then((res) => {
                if (isMounted && res?.data) {
                    const p = res.data;
                    setFormData({
                        propertyHeading: p.propertyHeading || p.propertyTitle || "",
                        propertyTitle: p.propertyTitle || p.propertyHeading || "",
                        propertyType: p.propertyType || "Residential",
                        propertySubType: p.propertySubType || "Flat",
                        propertyPrice: p.propertyPrice || "",
                        propertyPossessionType: p.propertyPossessionType || "Physical Possession",
                        propertyOwnershipType: p.propertyOwnershipType || "Freehold",
                        propTypeOfAction: p.propTypeOfAction || "SARFAESI Act 2002",
                        area: p.area || "",
                        unitOfMeasurement: p.unitOfMeasurement || "sq.ft",
                        cityName: p.cityName || p.city || "Kolkata",
                        stateName: p.stateName || "West Bengal",
                        locality: p.locality || "",
                        pincode: p.pincode || "700001",
                        bankName: p.bankName || "State Bank of India",
                        bankAddress: p.bankAddress || "",
                        departmentName: p.departmentName || "Stressed Assets Recovery Branch",
                        borrowerName: p.borrowerName || "",
                        displayImage: p.displayImage || p.photos?.[0] || samplePhotos[0].url,
                        photos: p.photos && p.photos.length > 0 ? p.photos : [samplePhotos[0].url],
                        isActive: p.isActive !== undefined ? p.isActive : true
                    });
                }
            })
            .catch((err) => {
                console.error("Failed to load property:", err);
                setError("Unable to load property details.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id, isEditMode]);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // 1-Click Sample Pre-filler for Super Fast Testing
    const handleFillSample = () => {
        const timestamp = Date.now().toString().slice(-4);
        setFormData({
            propertyHeading: `3 BHK Luxury Flat in Salt Lake Sector V (#${timestamp})`,
            propertyTitle: "All that piece and parcel of residential flat measuring 1,350 sq.ft at Salt Lake Sector V under SARFAESI statutory bank auction notice.",
            propertyType: "Residential",
            propertySubType: "Flat",
            propertyPrice: 4850000,
            propertyPossessionType: "Physical Possession",
            propertyOwnershipType: "Freehold",
            propTypeOfAction: "SARFAESI Act 2002",
            area: 1350,
            unitOfMeasurement: "sq.ft",
            cityName: "Kolkata",
            stateName: "West Bengal",
            locality: "Salt Lake Sector V",
            pincode: "700091",
            bankName: "State Bank of India",
            bankAddress: "SBI SARB Branch, Middleton Street, Kolkata 700071",
            departmentName: "Stressed Assets Management Branch",
            borrowerName: "Eastern Infra Holdings Pvt Ltd",
            displayImage: samplePhotos[0].url,
            photos: [samplePhotos[0].url],
            isActive: true
        });
        addToast("Sample bank auction details filled!", "info");
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.propertyHeading.trim()) {
            setError("Please enter a property title or heading.");
            return;
        }

        if (!formData.propertyPrice || Number(formData.propertyPrice) <= 0) {
            setError("Please enter a valid reserve price in ₹.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...formData,
                propertyTitle: formData.propertyTitle || formData.propertyHeading,
                propertyPrice: Number(formData.propertyPrice) || 0,
                area: formData.area ? Number(formData.area) : undefined,
                sourcePropertyId: isEditMode ? undefined : `BW-${Date.now()}`,
                propertyUniqueId: isEditMode ? undefined : `BID-${Date.now().toString().slice(-6)}`
            };

            if (isEditMode) {
                await updateProperty(id, payload);
                addToast("Property notice updated successfully!", "success");
            } else {
                await createProperty(payload);
                addToast("New bank auction listing published!", "success");
            }

            navigate("/admin/properties");
        } catch (err) {
            console.error("Save property error:", err);
            setError(err.message || "Failed to save property listing.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24">
                <LoadingSpinner text="Loading property details..." />
            </div>
        );
    }

    const priceNumber = Number(formData.propertyPrice) || 0;

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Top Navigation & Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/properties"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                        title="Back to all properties"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {isEditMode ? "Edit Property Notice" : "Add New Property Notice"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {isEditMode
                                ? "Update listing details, reserve pricing, or active status"
                                : "Publish a verified bank auction property notice to the marketplace"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {!isEditMode && (
                        <button
                            type="button"
                            onClick={handleFillSample}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                        >
                            <Sparkles size={14} className="text-amber-600" />
                            <span>⚡ Fill Sample Notice</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 transition cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                    >
                        <Save size={15} />
                        <span>{saving ? "Saving..." : isEditMode ? "Save Changes" : "Publish Listing"}</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex items-center gap-2 animate-scale-up">
                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form & Live Preview Grid */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Simple 3-Section Form (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* SECTION 1: Basic Property Details */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                                1
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Property Overview</h3>
                                <p className="text-[11px] text-slate-400">Basic title, asset type, and reserve price</p>
                            </div>
                        </div>

                        {/* Property Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Property Title / Heading <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.propertyHeading}
                                onChange={(e) => handleFieldChange("propertyHeading", e.target.value)}
                                placeholder="e.g. 3 BHK Luxury Flat in Salt Lake Sector V"
                                required
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition"
                            />
                        </div>

                        {/* Category & Subtype */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Asset Category
                                </label>
                                <select
                                    value={formData.propertyType}
                                    onChange={(e) => handleFieldChange("propertyType", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Agricultural">Agricultural</option>
                                    <option value="Other">Other Asset</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Property Sub-Type
                                </label>
                                <input
                                    type="text"
                                    value={formData.propertySubType}
                                    onChange={(e) => handleFieldChange("propertySubType", e.target.value)}
                                    placeholder="e.g. Flat, Office, Factory, Plot"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Price & Area */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Reserve Price (INR ₹) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.propertyPrice}
                                    onChange={(e) => handleFieldChange("propertyPrice", e.target.value)}
                                    placeholder="e.g. 4500000"
                                    required
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-bold text-emerald-600 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                                {priceNumber > 0 && (
                                    <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                                        = {formatINR(priceNumber)}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Built-up Area (Sq.Ft)
                                </label>
                                <input
                                    type="number"
                                    value={formData.area}
                                    onChange={(e) => handleFieldChange("area", e.target.value)}
                                    placeholder="e.g. 1250"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Bank & Location Details */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white font-black text-xs">
                                2
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Bank & Location</h3>
                                <p className="text-[11px] text-slate-400">Lending institution and location details</p>
                            </div>
                        </div>

                        {/* Bank Selector */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Lending Bank Institution
                            </label>
                            <select
                                value={formData.bankName}
                                onChange={(e) => handleFieldChange("bankName", e.target.value)}
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                            >
                                <option value="State Bank of India">State Bank of India (SBI)</option>
                                <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                                <option value="Bank of Baroda">Bank of Baroda</option>
                                <option value="Canara Bank">Canara Bank</option>
                                <option value="Indian Bank">Indian Bank</option>
                                <option value="Union Bank of India">Union Bank of India</option>
                                <option value="Bank of India">Bank of India</option>
                                <option value="Central Bank of India">Central Bank of India</option>
                                <option value="IDBI Bank">IDBI Bank</option>
                                <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                                <option value="Other Bank">Other Financial Institution</option>
                            </select>
                        </div>

                        {/* City, State, Locality */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                                <input
                                    type="text"
                                    value={formData.cityName}
                                    onChange={(e) => handleFieldChange("cityName", e.target.value)}
                                    placeholder="e.g. Kolkata"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                                <input
                                    type="text"
                                    value={formData.stateName}
                                    onChange={(e) => handleFieldChange("stateName", e.target.value)}
                                    placeholder="e.g. West Bengal"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Locality</label>
                                <input
                                    type="text"
                                    value={formData.locality}
                                    onChange={(e) => handleFieldChange("locality", e.target.value)}
                                    placeholder="e.g. Salt Lake"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Possession Type & Borrower */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Possession Type
                                </label>
                                <select
                                    value={formData.propertyPossessionType}
                                    onChange={(e) => handleFieldChange("propertyPossessionType", e.target.value)}
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                >
                                    <option value="Physical Possession">Physical Possession</option>
                                    <option value="Symbolic Possession">Symbolic Possession</option>
                                    <option value="Constructive Possession">Constructive Possession</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Borrower Account (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.borrowerName}
                                    onChange={(e) => handleFieldChange("borrowerName", e.target.value)}
                                    placeholder="e.g. M/s XYZ Developers"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Photo & Publish Status */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs">
                                3
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Photo & Publish</h3>
                                <p className="text-[11px] text-slate-400">Main image and marketplace visibility</p>
                            </div>
                        </div>

                        {/* Image URL Input */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Main Photo URL
                            </label>
                            <input
                                type="url"
                                value={formData.displayImage}
                                onChange={(e) => {
                                    handleFieldChange("displayImage", e.target.value);
                                    handleFieldChange("photos", [e.target.value]);
                                }}
                                placeholder="Paste image link (https://...)"
                                className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                            />
                        </div>

                        {/* Quick Sample Photos Picker */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 block mb-2">
                                Or pick a quick sample photo:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {samplePhotos.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            handleFieldChange("displayImage", item.url);
                                            handleFieldChange("photos", [item.url]);
                                        }}
                                        className={`group relative overflow-hidden rounded-xl border text-left p-1.5 transition cursor-pointer ${
                                            formData.displayImage === item.url
                                                ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50"
                                                : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.label}
                                            className="h-16 w-full rounded-lg object-cover"
                                        />
                                        <span className="block text-[10px] font-bold text-slate-700 mt-1 truncate">
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                    Publish to Public Marketplace
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    {formData.isActive ? "Listing will be live immediately for buyers" : "Saved as hidden draft"}
                                </span>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleFieldChange("isActive", e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Bottom Save Action Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            to="/admin/properties"
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-900 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>{saving ? "Saving Notice..." : isEditMode ? "Save Changes" : "Publish Listing"}</span>
                        </button>
                    </div>
                </div>

                {/* Right: Live Interactive Card Preview (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="sticky top-24 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Eye size={14} className="text-amber-500" />
                                <span>Live Public Card Preview</span>
                            </span>
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase">
                                Buyer View
                            </span>
                        </div>

                        {/* Public Card Mockup */}
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                            {/* Card Image */}
                            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                {formData.displayImage ? (
                                    <img
                                        src={formData.displayImage}
                                        alt="Listing Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = samplePhotos[0].url;
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                        <ImageIcon size={32} />
                                    </div>
                                )}

                                <div className="absolute top-3 left-3">
                                    <span className="rounded-lg bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-amber-400 border border-slate-800">
                                        {formData.bankName || "SARFAESI Bank"}
                                    </span>
                                </div>

                                <div className="absolute top-3 right-3">
                                    <span
                                        className={`rounded-lg px-2 py-0.5 text-[10px] font-black uppercase shadow-xs ${
                                            formData.isActive
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-700 text-slate-300"
                                        }`}
                                    >
                                        {formData.isActive ? "Active Deal" : "Draft"}
                                    </span>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="font-semibold">{formData.propertyType}</span>
                                    <span>{formData.area ? `${formData.area} sq.ft` : "Area on request"}</span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                    {formData.propertyHeading || "Property Title Will Appear Here"}
                                </h4>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <MapPin size={13} className="text-amber-500 shrink-0" />
                                    <span className="truncate">
                                        {formData.locality ? `${formData.locality}, ` : ""}
                                        {formData.cityName || "Kolkata"}, {formData.stateName || "West Bengal"}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                            Reserve Price
                                        </span>
                                        <span className="text-base font-black text-emerald-600">
                                            {priceNumber > 0 ? formatINR(priceNumber) : "₹0"}
                                        </span>
                                    </div>

                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                                        {formData.propertyPossessionType}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                            💡 This preview updates in real-time as you type. Once published, buyers can view factsheets and submit auction inquiries.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
