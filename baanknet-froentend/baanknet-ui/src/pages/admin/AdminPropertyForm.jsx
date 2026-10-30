import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    MapPin,
    UploadCloud,
    Image as ImageIcon,
    Trash2,
    Sparkles,
    Eye,
    AlertCircle,
    CheckCircle2,
    Camera,
    FileText,
    Star,
    Plus,
    Landmark,
    Phone
} from "lucide-react";
import { fetchPropertyById } from "../../services/propertyService";
import { createProperty, updateProperty } from "../../services/adminService";
import { saveFreshProperty } from "../../services/freshPropertyService";
import { formatINR } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";
import LocationPickerMap from "../../components/admin/LocationPickerMap";
import PropertyVideoManager from "../../components/admin/PropertyVideoManager";

// High quality sample gallery photos for testing (static — defined once at module level)
const sampleGallery = [
    { label: "Living Hall", url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80" },
    { label: "Master Bedroom", url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&auto=format&fit=crop&q=80" },
    { label: "Modular Kitchen", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80" },
    { label: "Balcony / Exterior", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80" }
];

export default function AdminPropertyForm() {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useApp();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    // Listing destination when creating a property: "auction" (/properties) or "fresh" (/fresh-properties)
    const [listingMode, setListingMode] = useState(() =>
        !isEditMode && searchParams.get("mode") === "fresh" ? "fresh" : "auction"
    );
    const isFreshMode = !isEditMode && listingMode === "fresh";

    // Clean, structured form state
    const [formData, setFormData] = useState({
        propertyHeading: "",
        propertyDescription: "",
        propertyTitle: "",
        propertyType: "Residential",
        propertySubType: "Flat",
        propertyPrice: "",
        propertyPossessionType: "Physical Possession",
        propertyOwnershipType: "Freehold",
        propTypeOfAction: "SARFAESI Act 2002",
        area: "",
        bedrooms: "",
        bathrooms: "",
        contactPhone: "",
        unitOfMeasurement: "sq.ft",
        cityName: "Kolkata",
        stateName: "West Bengal",
        locality: "",
        pincode: "700001",
        latitude: "",
        longitude: "",
        bankName: "State Bank of India",
        bankAddress: "",
        departmentName: "Stressed Assets Recovery Branch",
        borrowerName: "",
        displayImage: sampleGallery[0].url,
        photos: [sampleGallery[0].url, sampleGallery[1].url, sampleGallery[2].url],
        videos: [],
        isActive: true
    });
    const [videoUploading, setVideoUploading] = useState(false);
    // Fields just filled by "Use Current Location" / map pin (for a short highlight)
    const [autoFilledFields, setAutoFilledFields] = useState([]);
    const autoFillTimerRef = useRef(null);
    useEffect(() => () => clearTimeout(autoFillTimerRef.current), []);
    const addressInputClass = (field, extra = "") =>
        `w-full h-10 rounded-xl border px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white transition-all duration-500 ${extra} ${
            autoFilledFields.includes(field)
                ? "border-emerald-400 bg-emerald-50 ring-4 ring-emerald-500/15"
                : "border-slate-200 bg-slate-50"
        }`;

    // Load existing property data for edit mode
    useEffect(() => {
        if (!isEditMode) return;

        let isMounted = true;
        fetchPropertyById(id)
            .then((res) => {
                if (isMounted && res?.data) {
                    const p = res.data;
                    const loadedPhotos = Array.isArray(p.photos) && p.photos.length > 0
                        ? p.photos
                        : (p.displayImage ? [p.displayImage] : [sampleGallery[0].url]);

                    setFormData({
                        propertyHeading: p.propertyHeading || p.propertyTitle || "",
                        propertyDescription: p.propertyDescription || p.propertyTitle || "",
                        propertyTitle: p.propertyTitle || p.propertyDescription || p.propertyHeading || "",
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
                        latitude: p.latitude !== undefined && p.latitude !== null ? p.latitude : "",
                        longitude: p.longitude !== undefined && p.longitude !== null ? p.longitude : "",
                        bankName: p.bankName || "State Bank of India",
                        bankAddress: p.bankAddress || "",
                        departmentName: p.departmentName || "Stressed Assets Recovery Branch",
                        borrowerName: p.borrowerName || "",
                        displayImage: p.displayImage || loadedPhotos[0] || sampleGallery[0].url,
                        photos: loadedPhotos,
                        videos: Array.isArray(p.videos) ? p.videos.filter((v) => v && v.url) : [],
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

    // 1-Click Sample Pre-filler with full gallery
    const handleFillSample = () => {
        const timestamp = Date.now().toString().slice(-4);
        const sampleDesc = `Spacious and well-ventilated 3 BHK residential apartment situated in the heart of Salt Lake Sector V. Features 3 bedrooms, 2 balconies, a modern modular kitchen, and 1 dedicated covered car parking space. Located in a secured gated community with 24/7 power backup, dual passenger elevators, and CCTV surveillance. Excellent connectivity to major IT parks, metro stations, and public transit. Statutory auction sale under SARFAESI Act 2002.`;

        const samplePics = sampleGallery.map((item) => item.url);

        setFormData({
            propertyHeading: `3 BHK Luxury Flat in Salt Lake Sector V (#${timestamp})`,
            propertyDescription: sampleDesc,
            propertyTitle: sampleDesc,
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
            latitude: 22.5867,
            longitude: 88.4178,
            bankName: "State Bank of India",
            bankAddress: "SBI SARB Branch, Middleton Street, Kolkata 700071",
            departmentName: "Stressed Assets Management Branch",
            borrowerName: "Eastern Infra Holdings Pvt Ltd",
            displayImage: samplePics[0],
            photos: samplePics,
            videos: [],
            isActive: true
        });
        addToast("Sample property & 4-photo gallery filled!", "info");
    };

    // Device Image Upload Processor (Multiple Files with Canvas Compression)
    const processImageFiles = async (files) => {
        if (!files || files.length === 0) return;

        const validFiles = Array.from(files).filter((file) => {
            if (!file.type.startsWith("image/")) {
                addToast(`Skipped ${file.name}: Not an image file.`, "error");
                return false;
            }
            if (file.size > 20 * 1024 * 1024) {
                addToast(`Skipped ${file.name}: File is larger than 20MB.`, "error");
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const compressPromise = (file) =>
            new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                        const maxDim = 1000;
                        let width = img.width;
                        let height = img.height;

                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round((height * maxDim) / width);
                                width = maxDim;
                            } else {
                                width = Math.round((width * maxDim) / height);
                                height = maxDim;
                            }
                        }

                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, width, height);

                        const compressed = canvas.toDataURL("image/jpeg", 0.75);
                        resolve(compressed);
                    };
                    img.onerror = () => resolve(null);
                    img.src = event.target.result;
                };
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });

        try {
            const results = await Promise.all(validFiles.map(compressPromise));
            const newPhotos = results.filter(Boolean);

            if (newPhotos.length > 0) {
                setFormData((prev) => {
                    const currentPhotos = Array.isArray(prev.photos) ? prev.photos : [];
                    const combined = [...currentPhotos, ...newPhotos];
                    return {
                        ...prev,
                        photos: combined,
                        displayImage: prev.displayImage || combined[0] || ""
                    };
                });
                addToast(
                    `Added ${newPhotos.length} photo${newPhotos.length > 1 ? "s" : ""} to property gallery!`,
                    "success"
                );
            }
        } catch (err) {
            console.error("Gallery processing error:", err);
            addToast("Failed to process some gallery photos.", "error");
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processImageFiles(files);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processImageFiles(files);
        }
    };

    // Designate Primary Cover Image
    const handleSetCoverImage = (photoUrl) => {
        setFormData((prev) => ({
            ...prev,
            displayImage: photoUrl
        }));
        addToast("Updated primary cover photo!", "info");
    };

    // Delete single photo from gallery
    const handleRemovePhoto = (indexToRemove) => {
        setFormData((prev) => {
            const currentPhotos = Array.isArray(prev.photos) ? prev.photos : [];
            const updated = currentPhotos.filter((_, idx) => idx !== indexToRemove);
            const removedUrl = currentPhotos[indexToRemove];
            let nextCover = prev.displayImage;

            if (prev.displayImage === removedUrl) {
                nextCover = updated.length > 0 ? updated[0] : "";
            }

            return {
                ...prev,
                photos: updated,
                displayImage: nextCover
            };
        });
        addToast("Photo removed from gallery.", "info");
    };

    // Clear entire gallery
    const handleClearAllPhotos = () => {
        setFormData((prev) => ({
            ...prev,
            photos: [],
            displayImage: ""
        }));
        addToast("All gallery photos cleared.", "info");
    };

    // Add preset sample photo to gallery
    const handleAddSamplePhoto = (url) => {
        setFormData((prev) => {
            const existing = Array.isArray(prev.photos) ? prev.photos : [];
            if (existing.includes(url)) {
                addToast("Photo already in gallery.", "info");
                return prev;
            }
            const updated = [...existing, url];
            return {
                ...prev,
                photos: updated,
                displayImage: prev.displayImage || updated[0]
            };
        });
        addToast("Sample photo added to gallery!", "success");
    };

    // ---------- Manual GPS Coordinates (Latitude / Longitude) ----------
    // Returns an error string for an out-of-range / malformed value, or "" when valid/empty.
    const getCoordError = (value, kind) => {
        if (value === "" || value === null || value === undefined) return "";
        const num = Number(value);
        if (String(value).trim() === "" || isNaN(num)) return `Enter a valid ${kind} in decimal degrees.`;
        const limit = kind === "latitude" ? 90 : 180;
        if (num < -limit || num > limit) return `${kind === "latitude" ? "Latitude" : "Longitude"} must be between -${limit} and ${limit}.`;
        return "";
    };

    const latError = getCoordError(formData.latitude, "latitude");
    const lngError = getCoordError(formData.longitude, "longitude");
    const hasValidCoords =
        formData.latitude !== "" && formData.longitude !== "" && !latError && !lngError;

    // Allow only characters that can form a decimal coordinate while typing
    const handleCoordInput = (field, raw) => {
        const cleaned = raw.replace(/[^0-9.-]/g, "");
        handleFieldChange(field, cleaned);
    };

    // Pasting "22.586700, 88.417800" (Google Maps format) into either box fills both
    const handleCoordPaste = (e) => {
        const text = e.clipboardData.getData("text");
        const match = text.match(/(-?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:\.\d+)?)/);
        if (match) {
            e.preventDefault();
            setFormData((prev) => ({ ...prev, latitude: match[1], longitude: match[2] }));
            addToast("Latitude & longitude filled from pasted coordinates.", "success");
        }
    };

    const handleClearCoords = () => {
        setFormData((prev) => ({ ...prev, latitude: "", longitude: "" }));
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

        if (latError || lngError) {
            setError(latError || lngError);
            return;
        }

        if (videoUploading) {
            setError("Please wait until all videos finish uploading before saving.");
            return;
        }

        if ((formData.latitude === "") !== (formData.longitude === "")) {
            setError("Please enter both latitude and longitude to pin the exact location.");
            return;
        }

        try {
            setSaving(true);
            const manualText = formData.propertyDescription?.trim() || "";
            const currentPhotos = Array.isArray(formData.photos) ? formData.photos.filter(Boolean) : [];
            const coverImage = formData.displayImage || (currentPhotos.length > 0 ? currentPhotos[0] : "");

            // If creating a Fresh Property (Direct Sale · No Auction), save to FreshProperty collection
            if (isFreshMode) {
                const orderedPhotos = coverImage
                    ? [coverImage, ...currentPhotos.filter((p) => p !== coverImage)]
                    : currentPhotos;
                const mapType = (cat, sub) => {
                    const s = `${cat || ""} ${sub || ""}`.toLowerCase();
                    if (s.includes("house") || s.includes("villa") || s.includes("bungalow")) return "House";
                    if (s.includes("plot") || s.includes("land")) return "Plot";
                    if (s.includes("commercial") || s.includes("office") || s.includes("shop")) return "Commercial";
                    if (s.includes("industrial") || s.includes("factory") || s.includes("godown")) return "Industrial";
                    if (s.includes("residential") || s.includes("flat") || s.includes("apartment")) return "Apartment";
                    return "Other";
                };
                const features = manualText
                    .split("\n")
                    .map((l) => l.replace(/^[•*-]\s*/, "").trim())
                    .filter((l) => l && l.length <= 150)
                    .slice(0, 15);
                const freshPayload = {
                    title: formData.propertyHeading.trim().slice(0, 200),
                    description: manualText.slice(0, 10000),
                    price: Number(formData.propertyPrice),
                    propertyType: mapType(formData.propertyType, formData.propertySubType),
                    address: [formData.locality, formData.cityName, formData.pincode].filter(Boolean).join(", ") || formData.cityName || "Kolkata",
                    city: (formData.cityName || "Kolkata").trim(),
                    state: (formData.stateName || "West Bengal").trim(),
                    area: formData.area ? Number(formData.area) : null,
                    bedrooms: formData.bedrooms !== "" ? Math.max(0, Math.round(Number(formData.bedrooms))) : null,
                    bathrooms: formData.bathrooms !== "" ? Math.max(0, Math.round(Number(formData.bathrooms))) : null,
                    features,
                    photos: orderedPhotos.slice(0, 15),
                    videos: Array.isArray(formData.videos)
                        ? formData.videos.map((v) => ({ url: v.url, source: v.source || "link", title: (v.title || "").trim() }))
                        : [],
                    contactPhone: (formData.contactPhone || "").trim(),
                    isPublished: Boolean(formData.isActive)
                };
                await saveFreshProperty(null, freshPayload);
                addToast("Fresh Property published to the Fresh Property list!", "success");
                navigate("/admin/fresh-properties");
                return;
            }

            const payload = {
                ...formData,
                propertyHeading: formData.propertyHeading.trim(),
                propertyDescription: manualText,
                propertyTitle: manualText || formData.propertyHeading.trim(),
                propertyPrice: Number(formData.propertyPrice) || 0,
                area: formData.area ? Number(formData.area) : undefined,
                displayImage: coverImage,
                photos: currentPhotos.length > 0 ? currentPhotos : (coverImage ? [coverImage] : []),
                videos: Array.isArray(formData.videos)
                    ? formData.videos.map((v) => ({ ...v, title: (v.title || "").trim() }))
                    : [],
                // Empty → "" in edit mode so the server clears a previously saved pin
                latitude: formData.latitude !== "" && !isNaN(Number(formData.latitude)) ? Number(formData.latitude) : (isEditMode ? "" : undefined),
                longitude: formData.longitude !== "" && !isNaN(Number(formData.longitude)) ? Number(formData.longitude) : (isEditMode ? "" : undefined),
                sourcePropertyId: isEditMode ? undefined : `BW-${Date.now()}`,
                propertyUniqueId: isEditMode ? undefined : `BID-${Date.now().toString().slice(-6)}`
            };

            if (isEditMode) {
                await updateProperty(id, payload);
                addToast("Auction property notice updated successfully!", "success");
            } else {
                await createProperty(payload);
                addToast("New auction property published to Auction Property list!", "success");
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
    const coverPhoto = formData.displayImage || (formData.photos && formData.photos.length > 0 ? formData.photos[0] : "");

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
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
                            {isEditMode
                                ? "Edit Auction Property Notice"
                                : isFreshMode
                                ? "Add New Fresh Property (Direct Sale)"
                                : "Add New Auction Property Notice"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {isEditMode
                                ? "Update listing details, reserve pricing, photo gallery, or active status"
                                : isFreshMode
                                ? "Publish a direct-sale property to the Fresh Property list (no auction, no bidding, no EMD)"
                                : "Publish a verified bank auction property notice to the Auction Property list"}
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
                            <span>⚡ Fill Sample</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving || videoUploading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 transition cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                    >
                        <Save size={15} />
                        <span>
                            {saving
                                ? "Saving..."
                                : isEditMode
                                ? "Save Changes"
                                : isFreshMode
                                ? "Publish to Fresh Property"
                                : "Publish to Auction Property"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Listing Type Selector (Fresh Property vs Auction Property) when creating */}
            {!isEditMode && (
                <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Where should this property be listed?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setListingMode("auction")}
                            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition cursor-pointer ${
                                listingMode === "auction"
                                    ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                            }`}
                        >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${listingMode === "auction" ? "bg-slate-950 text-amber-400" : "bg-slate-200 text-slate-600"}`}>
                                <Landmark size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-black text-slate-900">
                                    Auction Property List
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    Bank SARFAESI auction listing with reserve price & bank details. Shown on the <strong>Auction Property</strong> page.
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setListingMode("fresh")}
                            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition cursor-pointer ${
                                listingMode === "fresh"
                                    ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                            }`}
                        >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${listingMode === "fresh" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <span className="block text-sm font-black text-slate-900">
                                    Fresh Property List (Direct Sale · No Auction)
                                </span>
                                <span className="mt-0.5 block text-xs text-slate-500">
                                    Admin direct-sale property at a fixed asking price — no auction, no EMD. Shown only on the <strong>Fresh Property</strong> page.
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 flex items-center gap-2 animate-scale-up">
                    <AlertCircle size={16} className="text-rose-500 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Form & Live Preview Grid */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Streamlined Form (7 Columns) */}
                <div className="lg:col-span-7 space-y-5">
                    {/* SECTION 1: Basic Property Details */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                                1
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Property Overview</h3>
                                <p className="text-[11px] text-slate-400">Basic title, category, and reserve pricing</p>
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
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Agricultural">Agricultural</option>
                                    <option value="Land/Plot">Land / Plot</option>
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
                                    placeholder="e.g. Flat, Office, Shop, Villa, Factory"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Price, Area & Possession / Rooms */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {isFreshMode ? "Asking Price (INR ₹)" : "Reserve Price (INR ₹)"} <span className="text-rose-500">*</span>
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
                                    <span className="text-[10px] font-bold text-emerald-600 mt-1 block truncate">
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

                            {isFreshMode ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Bedrooms</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={formData.bedrooms}
                                            onChange={(e) => handleFieldChange("bedrooms", e.target.value)}
                                            placeholder="e.g. 3"
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Bathrooms</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={formData.bathrooms}
                                            onChange={(e) => handleFieldChange("bathrooms", e.target.value)}
                                            placeholder="e.g. 2"
                                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Possession Type
                                    </label>
                                    <select
                                        value={formData.propertyPossessionType}
                                        onChange={(e) => handleFieldChange("propertyPossessionType", e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                                    >
                                        <option value="Physical Possession">Physical Possession</option>
                                        <option value="Symbolic Possession">Symbolic Possession</option>
                                        <option value="Constructive Possession">Constructive Possession</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION 2: Manual Property Description */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Property Description & Notes</h3>
                                    <p className="text-[11px] text-slate-400">Write custom notes, property features, road access, or auction terms</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                {formData.propertyDescription?.length || 0} chars
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                    <FileText size={14} className="text-indigo-600" />
                                    <span>About This Property</span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">Multi-paragraph supported</span>
                            </label>
                            <textarea
                                rows={5}
                                value={formData.propertyDescription}
                                onChange={(e) => {
                                    handleFieldChange("propertyDescription", e.target.value);
                                    handleFieldChange("propertyTitle", e.target.value);
                                }}
                                placeholder="Write custom details about this property... e.g.:
• Floor level, orientation, and layout highlights
• Furnishing status and room measurements
• Key amenities: 24/7 water, elevator, covered parking, gated security
• Proximity to major metro stations, highways, and commercial hubs
• Inspection dates, token EMD deposit, or auction process notes"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 transition leading-relaxed resize-y"
                            />
                        </div>

                        {/* Quick Insert Suggestion Chips */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                                Quick Insert Highlights:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    "Clear Freehold Title",
                                    "Immediate Physical Possession",
                                    "Lift & Covered Parking",
                                    "24/7 Gated Security",
                                    "Wide Road Facing",
                                    "Prime Metro Connectivity",
                                    "Direct Bank Auction",
                                    "High Rental Yield"
                                ].map((chip) => (
                                    <button
                                        key={chip}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.propertyDescription ? formData.propertyDescription.trim() : "";
                                            const newText = current ? `${current}\n• ${chip}` : `• ${chip}`;
                                            handleFieldChange("propertyDescription", newText);
                                            handleFieldChange("propertyTitle", newText);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-900 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition cursor-pointer active:scale-95"
                                    >
                                        <span className="text-indigo-600 font-bold">+</span>
                                        <span>{chip}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Bank & Location Details */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
                                3
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    {isFreshMode ? "Admin Contact & Location" : "Bank & Location"}
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    {isFreshMode
                                        ? "Direct contact number for buyers and interactive property map"
                                        : "Lending institution and interactive property map"}
                                </p>
                            </div>
                        </div>

                        {/* Bank Selector & Borrower (Auction) OR Admin Contact Phone (Fresh) */}
                        {isFreshMode ? (
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <Phone size={13} className="text-emerald-600" />
                                    <span>Admin Contact Phone for Buyers (Optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    maxLength={18}
                                    value={formData.contactPhone}
                                    onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                                    placeholder="e.g. 98300 12345"
                                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white transition"
                                />
                                <span className="mt-1 block text-[11px] text-slate-400">
                                    Shows direct Call & WhatsApp buttons on the Fresh Property page. Buyer enquiries always arrive in Buyer Inquiries.
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Lending Bank Institution
                                    </label>
                                    <select
                                        value={formData.bankName}
                                        onChange={(e) => handleFieldChange("bankName", e.target.value)}
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
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

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Borrower Account (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.borrowerName}
                                        onChange={(e) => handleFieldChange("borrowerName", e.target.value)}
                                        placeholder="e.g. M/s XYZ Developers"
                                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Interactive Location Picker Map with Professional GPS Animation */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <MapPin size={13} className="text-amber-500" />
                                    <span>Interactive Property Location Map</span>
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    Click map, drag pin, or use GPS to auto-set address
                                </span>
                            </div>

                            <LocationPickerMap
                                latitude={hasValidCoords ? formData.latitude : ""}
                                longitude={hasValidCoords ? formData.longitude : ""}
                                cityName={formData.cityName}
                                stateName={formData.stateName}
                                locality={formData.locality}
                                pincode={formData.pincode}
                                onLocationChange={(loc, meta) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        ...loc
                                    }));
                                    // Briefly highlight the fields that were filled automatically
                                    if (meta?.autoFilled?.length) {
                                        setAutoFilledFields(meta.autoFilled);
                                        clearTimeout(autoFillTimerRef.current);
                                        autoFillTimerRef.current = setTimeout(() => setAutoFilledFields([]), 2500);
                                    }
                                }}
                                onToast={(msg, type) => addToast(msg, type)}
                            />
                        </div>

                        {/* Exact GPS Coordinates — manual entry, synced both ways with the map pin */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <MapPin size={13} className="text-amber-500" />
                                        <span>Exact GPS Coordinates</span>
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Type or paste (e.g. <span className="font-mono">22.586700, 88.417800</span>) — the map pin moves to the exact spot.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasValidCoords && (
                                        <a
                                            href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                                        >
                                            <Eye size={12} />
                                            Verify on Google Maps
                                        </a>
                                    )}
                                    {(formData.latitude !== "" || formData.longitude !== "") && (
                                        <button
                                            type="button"
                                            onClick={handleClearCoords}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 transition cursor-pointer"
                                        >
                                            <Trash2 size={12} />
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="property-latitude" className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Latitude <span className="font-normal text-slate-400">(-90 to 90)</span>
                                    </label>
                                    <input
                                        id="property-latitude"
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        value={formData.latitude}
                                        onChange={(e) => handleCoordInput("latitude", e.target.value)}
                                        onPaste={handleCoordPaste}
                                        placeholder="e.g. 22.586700"
                                        aria-invalid={Boolean(latError)}
                                        className={`w-full h-11 rounded-xl border bg-white px-3.5 text-xs font-mono font-semibold outline-none transition ${
                                            latError
                                                ? "border-red-400 focus:border-red-500"
                                                : "border-slate-200 focus:border-amber-500"
                                        }`}
                                    />
                                    {latError && <p className="mt-1 text-[11px] font-medium text-red-600">{latError}</p>}
                                </div>

                                <div>
                                    <label htmlFor="property-longitude" className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Longitude <span className="font-normal text-slate-400">(-180 to 180)</span>
                                    </label>
                                    <input
                                        id="property-longitude"
                                        type="text"
                                        inputMode="decimal"
                                        autoComplete="off"
                                        value={formData.longitude}
                                        onChange={(e) => handleCoordInput("longitude", e.target.value)}
                                        onPaste={handleCoordPaste}
                                        placeholder="e.g. 88.417800"
                                        aria-invalid={Boolean(lngError)}
                                        className={`w-full h-11 rounded-xl border bg-white px-3.5 text-xs font-mono font-semibold outline-none transition ${
                                            lngError
                                                ? "border-red-400 focus:border-red-500"
                                                : "border-slate-200 focus:border-amber-500"
                                        }`}
                                    />
                                    {lngError && <p className="mt-1 text-[11px] font-medium text-red-600">{lngError}</p>}
                                </div>
                            </div>

                            {hasValidCoords && (
                                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                                    <CheckCircle2 size={12} />
                                    Location pinned at {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                                </p>
                            )}
                        </div>

                        {/* Auto-filled Address Fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                                <input
                                    type="text"
                                    value={formData.cityName}
                                    onChange={(e) => handleFieldChange("cityName", e.target.value)}
                                    placeholder="City"
                                    className={addressInputClass("cityName")}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                                <input
                                    type="text"
                                    value={formData.stateName}
                                    onChange={(e) => handleFieldChange("stateName", e.target.value)}
                                    placeholder="State"
                                    className={addressInputClass("stateName")}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Locality</label>
                                <input
                                    type="text"
                                    value={formData.locality}
                                    onChange={(e) => handleFieldChange("locality", e.target.value)}
                                    placeholder="Locality / Area"
                                    className={addressInputClass("locality")}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Postal Pincode</label>
                                <input
                                    type="text"
                                    value={formData.pincode}
                                    onChange={(e) => handleFieldChange("pincode", e.target.value)}
                                    placeholder="Pincode"
                                    className={addressInputClass("pincode", "font-mono")}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Property Photo Gallery (Multi-Image Upload + Cover Selector) */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Property Photo & Video Gallery</h3>
                                    <p className="text-[11px] text-slate-400">
                                        Upload property photos (hall, bedrooms, exterior, layout), set cover & add walkthrough videos
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                    <Camera size={12} className="text-emerald-600" />
                                    <span>{formData.photos?.length || 0} Photos in Gallery</span>
                                </span>
                                {formData.photos && formData.photos.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleClearAllPhotos}
                                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Hidden Native File Input (supports multiple file selection) */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Gallery Grid or Empty Dropzone */}
                        {formData.photos && formData.photos.length > 0 ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {formData.photos.map((photoUrl, index) => {
                                        const isCover =
                                            formData.displayImage === photoUrl ||
                                            (!formData.displayImage && index === 0);

                                        return (
                                            <div
                                                key={index}
                                                className={`group relative overflow-hidden rounded-2xl border bg-slate-900 transition shadow-xs ${
                                                    isCover
                                                        ? "border-amber-500 ring-3 ring-amber-500/25"
                                                        : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                {/* Photo Thumbnail */}
                                                <div className="relative h-36 w-full overflow-hidden">
                                                    <img
                                                        src={photoUrl}
                                                        alt={`Gallery photo ${index + 1}`}
                                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                    />

                                                    {/* Top Badges */}
                                                    <div className="absolute top-2 left-2 flex items-center gap-1">
                                                        <span className="rounded-md bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono font-bold text-white border border-white/10">
                                                            #{index + 1}
                                                        </span>
                                                        {isCover && (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-xs">
                                                                <Star size={11} className="fill-slate-950" />
                                                                <span>Cover</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Remove Button */}
                                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePhoto(index)}
                                                            className="h-7 w-7 rounded-lg bg-rose-600/90 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 hover:bg-rose-700 transition cursor-pointer shadow-xs"
                                                            title="Delete photo from gallery"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>

                                                    {/* Bottom Action: Set as Primary Cover */}
                                                    {!isCover && (
                                                        <div className="absolute inset-x-2 bottom-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetCoverImage(photoUrl)}
                                                                className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-slate-950/85 backdrop-blur-md py-1 text-[10px] font-bold text-amber-400 border border-amber-400/30 hover:bg-slate-950 opacity-90 group-hover:opacity-100 transition cursor-pointer"
                                                            >
                                                                <Star size={11} />
                                                                <span>Set as Cover</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* "+ Add More Photos" Trigger Card */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 p-4 transition cursor-pointer group text-center gap-2"
                                    >
                                        <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition shadow-2xs">
                                            <Plus size={20} />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-800">
                                                + Add Photos
                                            </span>
                                            <span className="block text-[10px] text-slate-400 mt-0.5">
                                                Browse from device
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty Gallery Dropzone */
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`rounded-2xl border-2 border-dashed p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                                    isDragging
                                        ? "border-amber-500 bg-amber-50/60 ring-4 ring-amber-500/10"
                                        : "border-slate-300 bg-slate-50 hover:bg-amber-50/40 hover:border-amber-400"
                                }`}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                                    <UploadCloud size={28} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        Upload Property Photo Gallery
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Drag & drop multiple property photos here or click to browse
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 shadow-xs hover:bg-slate-900 transition">
                                    <Camera size={14} />
                                    <span>Browse Multiple Photos from Device</span>
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Supports multiple JPG, PNG, WEBP (up to 20MB each) • Auto-scaled on canvas
                                </span>
                            </div>
                        )}

                        {/* Quick Stock Sample Photos to populate gallery */}
                        <div className="pt-2 border-t border-slate-100">
                            <span className="text-[11px] font-bold text-slate-400 block mb-2">
                                Or add quick sample photos to gallery:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {sampleGallery.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAddSamplePhoto(item.url)}
                                        className="group relative overflow-hidden rounded-xl border border-slate-200 hover:border-amber-400 text-left p-1.5 transition cursor-pointer bg-white"
                                    >
                                        <img
                                            src={item.url}
                                            alt={item.label}
                                            className="h-14 w-full rounded-lg object-cover group-hover:scale-105 transition"
                                        />
                                        <div className="flex items-center justify-between mt-1 px-0.5">
                                            <span className="text-[10px] font-bold text-slate-700 truncate">
                                                {item.label}
                                            </span>
                                            <span className="text-[10px] font-black text-amber-600">
                                                + Add
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Property Videos (file upload or YouTube / Vimeo / MP4 link) */}
                        <PropertyVideoManager
                            videos={formData.videos || []}
                            onChange={(updater) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    videos: updater(Array.isArray(prev.videos) ? prev.videos : [])
                                }))
                            }
                            onToast={(msg, type) => addToast(msg, type)}
                            onUploadingChange={setVideoUploading}
                        />

                        {/* Status Toggle Switch */}
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div>
                                <span className="text-xs font-bold text-slate-900 block">
                                    {isFreshMode
                                        ? "Publish to Fresh Property List (/fresh-properties)"
                                        : "Publish to Auction Property List (/properties)"}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    {formData.isActive
                                        ? isFreshMode
                                            ? "Listing will be live immediately on the Fresh Property page"
                                            : "Listing will be live immediately on the Auction Property page"
                                        : "Saved as hidden draft"}
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
                            to={isFreshMode ? "/admin/fresh-properties" : "/admin/properties"}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving || videoUploading}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-900 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>
                                {saving
                                    ? "Saving..."
                                    : isEditMode
                                    ? "Save Changes"
                                    : isFreshMode
                                    ? "Publish to Fresh Property"
                                    : "Publish to Auction Property"}
                            </span>
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
                                {coverPhoto ? (
                                    <img
                                        src={coverPhoto}
                                        alt="Listing Preview"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.target.src = sampleGallery[0].url;
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                                        <ImageIcon size={32} />
                                    </div>
                                )}

                                <div className="absolute top-3 left-3">
                                    <span className="rounded-lg bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-amber-400 border border-slate-800">
                                        {isFreshMode ? "Direct Sale · No Auction" : (formData.bankName || "SARFAESI Bank")}
                                    </span>
                                </div>

                                <div className="absolute top-3 right-3 flex items-center gap-1.5">
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

                                {/* Gallery Photo Count Pill */}
                                {formData.photos && formData.photos.length > 1 && (
                                    <div className="absolute bottom-3 right-3">
                                        <span className="rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-white/10 flex items-center gap-1">
                                            <Camera size={11} />
                                            <span>{formData.photos.length} Photos in Gallery</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Mini Gallery Reel Preview */}
                            {formData.photos && formData.photos.length > 1 && (
                                <div className="px-5 pt-3 flex items-center gap-2 overflow-x-auto pb-1">
                                    {formData.photos.slice(0, 5).map((pic, idx) => (
                                        <img
                                            key={idx}
                                            src={pic}
                                            alt="thumb"
                                            className={`h-11 w-11 rounded-lg object-cover shrink-0 border transition ${
                                                pic === coverPhoto
                                                    ? "border-amber-500 ring-2 ring-amber-500/30"
                                                    : "border-slate-200 opacity-70"
                                            }`}
                                        />
                                    ))}
                                    {formData.photos.length > 5 && (
                                        <span className="h-11 px-2 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                                            +{formData.photos.length - 5}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Card Details */}
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="font-semibold">{formData.propertyType}</span>
                                    <span>{formData.area ? `${formData.area} sq.ft` : "Area on request"}</span>
                                </div>

                                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                    {formData.propertyHeading || "Property Title Will Appear Here"}
                                </h4>

                                {/* Live Preview of Admin's Manual Description */}
                                {formData.propertyDescription && (
                                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] text-slate-600 line-clamp-3 leading-relaxed italic">
                                        "{formData.propertyDescription}"
                                    </div>
                                )}

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
                                            {isFreshMode ? "Asking Price" : "Reserve Price"}
                                        </span>
                                        <span className="text-base font-black text-emerald-600">
                                            {priceNumber > 0 ? formatINR(priceNumber) : "₹0"}
                                        </span>
                                    </div>

                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                                        {isFreshMode ? "Fresh Property" : formData.propertyPossessionType}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                            💡 This preview updates in real-time. Buyers will see your complete image gallery with interactive thumbnail reel.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
