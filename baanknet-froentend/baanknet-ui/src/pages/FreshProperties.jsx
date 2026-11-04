import {
    BadgeCheck,
    Bath,
    BedDouble,
    Building2,
    CheckCircle2,
    Film,
    Handshake,
    Link2,
    Loader2,
    MapPin,
    Maximize2,
    MessageSquareText,
    Phone,
    PlayCircle,
    Search,
    UploadCloud,
    X
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchFreshProperties, appendFreshPropertyVideo } from "../services/freshPropertyService";
import { uploadPropertyVideo } from "../services/adminService";
import {
    VIDEO_ACCEPT,
    MAX_VIDEO_MB,
    parseVideoUrl,
    resolveMediaUrl,
    getEmbedUrl
} from "../utils/media";
import { formatINR } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import FreshEnquiryModal from "../components/FreshEnquiryModal";
import PropertyVideos from "../components/PropertyVideos";
import SoldStamp from "../components/SoldStamp";

const FRESH_TYPE_PILLS = ["All", "Apartment", "House", "Plot", "Commercial"];

function FreshPropertyCard({ property, onEnquire, onOpenVideoUploader }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [imageError, setImageError] = useState(false);
    const [mediaTab, setMediaTab] = useState("photos"); // "photos" | "video"
    const photos = Array.isArray(property.photos) ? property.photos.filter(Boolean) : [];
    const features = Array.isArray(property.features) ? property.features.filter(Boolean) : [];
    const videos = Array.isArray(property.videos) ? property.videos.filter(v => v && v.url) : [];
    const videoCount = videos.length;
    const showHeroVideo = videoCount > 0 && (mediaTab === "video" || photos.length === 0 || imageError);
    const heroVideo = videos[0];
    const heroEmbedUrl = heroVideo ? getEmbedUrl(heroVideo) : "";

    return (
        <article className={`flex flex-col overflow-hidden rounded-3xl border shadow-xs transition ${
            property.isSold
                ? "border-slate-300/90 bg-slate-50/40"
                : "border-slate-200 bg-white hover:shadow-md hover:border-emerald-300"
        }`}>
            {/* Hero Image or Video Stage */}
            <div className="relative flex h-60 items-center justify-center bg-slate-950 overflow-hidden">
                {showHeroVideo && heroVideo ? (
                    heroEmbedUrl ? (
                        <iframe
                            src={heroEmbedUrl}
                            title={heroVideo.title || property.title}
                            className="h-full w-full"
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            src={resolveMediaUrl(heroVideo.url)}
                            controls
                            preload="metadata"
                            playsInline
                            className="h-full w-full object-contain bg-slate-950"
                        />
                    )
                ) : photos.length > 0 && !imageError ? (
                    <img
                        src={photos[selectedPhoto] || photos[0]}
                        alt={property.title}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className={`h-full w-full object-cover ${property.isSold ? "grayscale contrast-125 brightness-90" : ""}`}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Building2 size={44} />
                        <button
                            type="button"
                            onClick={() => onOpenVideoUploader(property)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                        >
                            <UploadCloud size={12} />
                            <span>Upload Property Video</span>
                        </button>
                    </div>
                )}

                <span className={`absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm pointer-events-none ${
                    property.isSold
                        ? "bg-slate-900/85 border border-white/15 text-slate-300 backdrop-blur-md"
                        : "bg-emerald-600 text-white"
                }`}>
                    <BadgeCheck size={12} /> {property.isSold ? "Archived Direct Sale" : "Direct Sale · No Auction"}
                </span>

                {property.isSold && <SoldStamp variant="card" />}

                {/* Interactive Photo / Video Toggle & Quick Upload Pill */}
                <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                    {videoCount > 0 && photos.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setMediaTab(mediaTab === "video" ? "photos" : "video")}
                            className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-amber-400/40 px-3 py-1 text-[11px] font-bold text-amber-400 shadow-md transition cursor-pointer"
                        >
                            <PlayCircle size={13} />
                            <span>
                                {mediaTab === "video"
                                    ? `Show Photos (${photos.length})`
                                    : `Watch Video (${videoCount})`}
                            </span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onOpenVideoUploader(property)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-600/95 hover:bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md transition cursor-pointer"
                        title="Upload a walkthrough video for this property"
                    >
                        <UploadCloud size={12} />
                        <span>+ Video</span>
                    </button>
                </div>
            </div>

            {/* Thumbnail Strip (visible immediately if multiple photos exist) */}
            {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`View photo ${index + 1}`}
                            aria-pressed={selectedPhoto === index && mediaTab === "photos"}
                            onClick={() => {
                                setSelectedPhoto(index);
                                setImageError(false);
                                setMediaTab("photos");
                            }}
                            className={`shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                                selectedPhoto === index && mediaTab === "photos"
                                    ? property.isSold
                                        ? "border-slate-600 ring-2 ring-slate-500/20"
                                    : "border-amber-500 ring-2 ring-amber-500/20"
                                    : "border-transparent opacity-75 hover:opacity-100"
                            }`}
                        >
                            <img src={photo} alt={`Photo ${index + 1}`} loading="lazy" className={`h-11 w-14 object-cover ${property.isSold ? "grayscale" : ""}`} />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                            property.isSold
                                ? "bg-slate-100 border-slate-200 text-slate-600"
                                : "bg-amber-50 border-amber-200/70 text-amber-800"
                        }`}>
                            {property.propertyType || "Property"}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-black ${
                                property.isSold
                                    ? "text-slate-400 line-through decoration-rose-500 decoration-2"
                                    : "text-slate-950"
                            }`}>
                                {formatINR(property.price)}
                            </span>
                            {property.isSold && (
                                <span className="rounded-lg bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                                    SOLD OUT
                                </span>
                            )}
                        </div>
                    </div>

                    <h2 className={`text-xl font-bold leading-snug ${property.isSold ? "text-slate-700" : "text-slate-950"}`}>
                        {property.title}
                    </h2>

                    {/* Clear Address & Google Maps Link */}
                    <div className="space-y-2">
                        <p className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
                            <MapPin size={14} className={`mt-0.5 shrink-0 ${property.isSold ? "text-slate-400" : "text-amber-600"}`} />
                            <span>
                                {property.address ? `${property.address}, ` : ""}
                                {property.city}, {property.state}
                                {property.pincode ? ` - ${property.pincode}` : ""}
                            </span>
                        </p>

                        {property.latitude != null && property.longitude != null && !property.isSold && (
                            <a
                                href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                            >
                                <MapPin size={13} /> Open Exact Location on Google Maps
                            </a>
                        )}
                    </div>

                    {/* Key Specs Pills */}
                    {(property.area > 0 || property.bedrooms > 0 || property.bathrooms > 0) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {property.area > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    <Maximize2 size={12} className="text-slate-400" />
                                    {property.area.toLocaleString("en-IN")} sq ft
                                </span>
                            )}
                            {property.bedrooms > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    <BedDouble size={12} className="text-slate-400" />
                                    {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                                </span>
                            )}
                            {property.bathrooms > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                    <Bath size={12} className="text-slate-400" />
                                    {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {property.description && (
                        <p className="text-xs leading-relaxed text-slate-500 whitespace-pre-line">
                            {property.description}
                        </p>
                    )}

                    {/* Features Chips */}
                    {features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {features.map((feature, index) => (
                                <span
                                    key={index}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                        property.isSold
                                            ? "border-slate-200 bg-slate-100 text-slate-600"
                                            : "border-emerald-200 bg-emerald-50/70 text-emerald-800"
                                    }`}
                                >
                                    <CheckCircle2 size={11} className={property.isSold ? "text-slate-400" : "text-emerald-600"} />
                                    {feature}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Video Walkthroughs Section */}
                    {videoCount > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <PropertyVideos videos={property.videos} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {!property.isSold && (
                        <a
                            href={`tel:${String(property.contactPhone || "7439409340").replace(/\s+/g, "")}`}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-3 py-3 text-xs sm:text-sm font-black text-white transition"
                        >
                            <Phone size={15} />
                            <span>{property.contactPhone || "+91 74394 09340"}</span>
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => onEnquire(property)}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs sm:text-sm font-black cursor-pointer transition ${
                            property.isSold
                                ? "sm:col-span-2 bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-slate-950 text-amber-400 hover:bg-slate-800"
                        }`}
                    >
                        <Handshake size={16} />
                        <span>
                            {property.isSold
                                ? "Deal Closed — Request Similar Property"
                                : "I'm Interested"}
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default function FreshProperties() {
    const { addToast } = useApp();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [enquiryFor, setEnquiryFor] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [onlyWithVideo, setOnlyWithVideo] = useState(false);

    // Inline Video Upload Drawer / Modal state
    const [videoUploaderOpen, setVideoUploaderOpen] = useState(false);
    const [targetPropertyId, setTargetPropertyId] = useState("");
    const [videoCaption, setVideoCaption] = useState("");
    const [videoLinkInput, setVideoLinkInput] = useState("");
    const [uploadingProgress, setUploadingProgress] = useState(null);
    const videoFileInputRef = useRef(null);

    useEffect(() => {
        let active = true;
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        setLoading(true); setError("");
        fetchFreshProperties().then(response => {
            if (active) {
                const list = Array.isArray(response?.data) ? response.data : [];
                setProperties(list);
                setTargetPropertyId((prev) => prev || (list[0]?._id ?? ""));
            }
        })
            .catch(() => { if (active) setError("Unable to load fresh properties. Please try again."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [attempt]);

    const handleOpenVideoUploader = (property = null) => {
        if (property?._id) {
            setTargetPropertyId(property._id);
        } else if (properties.length > 0 && !targetPropertyId) {
            setTargetPropertyId(properties[0]._id);
        }
        setVideoCaption("");
        setVideoLinkInput("");
        setVideoUploaderOpen(true);
    };

    const handleUploadDeviceVideo = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const propId = targetPropertyId || properties[0]?._id;
        if (!propId) {
            addToast("Please create a Fresh Property listing first before uploading a video.", "warning");
            return;
        }
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
            addToast(`Video exceeds the ${MAX_VIDEO_MB} MB limit.`, "error");
            return;
        }

        setUploadingProgress(0);
        try {
            const targetProp = properties.find((p) => p._id === propId);
            const uploaded = await uploadPropertyVideo(file, (pct) => setUploadingProgress(pct));
            const title = videoCaption.trim() || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 120);
            const updatedRes = await appendFreshPropertyVideo(
                propId,
                {
                    url: uploaded.url,
                    source: "upload",
                    title
                },
                targetProp?.videos || []
            );
            if (updatedRes?.data) {
                setProperties((prev) => prev.map((p) => (p._id === propId ? updatedRes.data : p)));
            } else {
                setAttempt((a) => a + 1);
            }
            addToast("Walkthrough video uploaded and attached to Fresh Property!", "success");
            setVideoCaption("");
            setVideoUploaderOpen(false);
        } catch (err) {
            addToast(err?.response?.data?.message || err.message || "Failed to upload video.", "error");
        } finally {
            setUploadingProgress(null);
        }
    };

    const handleAttachVideoLink = async (e) => {
        e.preventDefault();
        const parsed = parseVideoUrl(videoLinkInput);
        if (!parsed) {
            addToast("Please paste a valid YouTube, Vimeo, or direct .mp4/.webm video URL.", "warning");
            return;
        }
        const propId = targetPropertyId || properties[0]?._id;
        if (!propId) {
            addToast("Please create a Fresh Property listing first.", "warning");
            return;
        }
        setUploadingProgress(50);
        try {
            const targetProp = properties.find((p) => p._id === propId);
            const updatedRes = await appendFreshPropertyVideo(
                propId,
                {
                    url: parsed.url,
                    source: parsed.source,
                    title: videoCaption.trim() || "Property Walkthrough"
                },
                targetProp?.videos || []
            );
            if (updatedRes?.data) {
                setProperties((prev) => prev.map((p) => (p._id === propId ? updatedRes.data : p)));
            } else {
                setAttempt((a) => a + 1);
            }
            addToast("Video walkthrough link attached to Fresh Property!", "success");
            setVideoLinkInput("");
            setVideoCaption("");
            setVideoUploaderOpen(false);
        } catch (err) {
            addToast(err?.response?.data?.message || "Failed to attach video link.", "error");
        } finally {
            setUploadingProgress(null);
        }
    };

    const filteredProperties = useMemo(() => {
        return properties.filter((prop) => {
            const matchesType =
                selectedType === "All" ||
                (prop.propertyType || "").toLowerCase() === selectedType.toLowerCase();
            if (!matchesType) return false;

            if (onlyWithVideo) {
                const vCount = Array.isArray(prop.videos) ? prop.videos.filter(v => v && v.url).length : 0;
                if (vCount === 0) return false;
            }

            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;

            return [prop.title, prop.city, prop.state, prop.address, prop.propertyType]
                .filter(Boolean)
                .some((val) => String(val).toLowerCase().includes(q));
        });
    }, [properties, searchQuery, selectedType, onlyWithVideo]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                        <BadgeCheck size={14} /> Direct from Admin · No Auction
                    </div>
                    <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Fresh Properties (Direct Buy)</h1>
                    <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
                        Verified properties uploaded directly by the <strong className="text-slate-900">Bidwallah Admin</strong> at a fixed price — <strong className="text-slate-900">no auction, no bidding, and no EMD required</strong>.
                        Watch HD walkthrough videos, check the exact GPS pin, and call or enquire directly.
                    </p>
                </div>

                {/* Upload Video Section Trigger & Admin Manage Link */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => setVideoUploaderOpen((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-4 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-red-600/20 transition cursor-pointer"
                    >
                        <Film size={16} />
                        <span>{videoUploaderOpen ? "Close Video Uploader" : "Upload Property Video"}</span>
                    </button>
                    <Link
                        to="/admin/fresh-properties"
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition"
                    >
                        <UploadCloud size={16} className="text-red-600" />
                        <span>Manage Fresh Listings</span>
                    </Link>
                </div>
            </div>

            {/* Dedicated Video Upload Section for Fresh Properties */}
            {videoUploaderOpen && (
                <section className="mt-6 rounded-3xl border border-red-200/80 bg-gradient-to-br from-white via-white to-red-50/40 p-5 sm:p-7 shadow-lg animate-scale-up">
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
                                <Film size={20} />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900">
                                    Upload Walkthrough Video to Fresh Property
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Select a Fresh Property below, then upload an MP4/MOV/WebM video from your device or paste a YouTube/Vimeo link.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setVideoUploaderOpen(false)}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {properties.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center space-y-3">
                            <p className="text-sm font-semibold text-slate-700">
                                No Fresh Properties exist yet. Create your first Fresh Property listing to attach videos.
                            </p>
                            <Link
                                to="/admin/fresh-properties"
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                            >
                                <UploadCloud size={15} />
                                <span>Add Fresh Property in Admin Panel</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className="block text-xs font-bold text-slate-700">
                                    1. Select Fresh Property *
                                    <select
                                        value={targetPropertyId}
                                        onChange={(e) => setTargetPropertyId(e.target.value)}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-red-500"
                                    >
                                        {properties.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.title} ({p.city} — {formatINR(p.price)})
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block text-xs font-bold text-slate-700">
                                    2. Video Title / Caption (optional)
                                    <input
                                        type="text"
                                        value={videoCaption}
                                        onChange={(e) => setVideoCaption(e.target.value)}
                                        placeholder="e.g. Full 3 BHK Interior Walkthrough & Balcony View"
                                        maxLength={120}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-red-500"
                                    />
                                </label>
                            </div>

                            <input
                                ref={videoFileInputRef}
                                type="file"
                                accept={`${VIDEO_ACCEPT},.mp4,.mov,.webm,.m4v,.ogv`}
                                className="hidden"
                                onChange={handleUploadDeviceVideo}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                {/* Option A: Upload File from Phone / Computer */}
                                <button
                                    type="button"
                                    disabled={uploadingProgress !== null}
                                    onClick={() => videoFileInputRef.current?.click()}
                                    className="flex items-center gap-3.5 rounded-2xl border-2 border-dashed border-red-300 bg-white hover:bg-red-50/50 hover:border-red-500 p-4 text-left transition cursor-pointer disabled:opacity-60"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 border border-red-200 text-red-600">
                                        {uploadingProgress !== null ? (
                                            <Loader2 size={22} className="animate-spin" />
                                        ) : (
                                            <UploadCloud size={22} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-black text-slate-900">
                                            {uploadingProgress !== null
                                                ? `Uploading Video (${uploadingProgress}%)…`
                                                : "Upload Video from Phone / Computer"}
                                        </span>
                                        <span className="block text-xs text-slate-500 mt-0.5">
                                            MP4, MOV, WebM up to {MAX_VIDEO_MB} MB • Chunked high-speed upload
                                        </span>
                                        {uploadingProgress !== null && (
                                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
                                                <div
                                                    className="h-full rounded-full bg-red-600 transition-all duration-200"
                                                    style={{ width: `${uploadingProgress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Option B: Paste YouTube / Vimeo / Direct MP4 Link */}
                                <form onSubmit={handleAttachVideoLink} className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-2">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Link2 size={14} className="text-red-600" />
                                        <span>Or Paste YouTube / Vimeo / Direct Video URL</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={videoLinkInput}
                                            onChange={(e) => setVideoLinkInput(e.target.value)}
                                            placeholder="https://youtu.be/... or https://.../video.mp4"
                                            className="h-10 flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!videoLinkInput.trim() || uploadingProgress !== null}
                                            className="h-10 shrink-0 rounded-xl bg-slate-950 hover:bg-slate-800 px-4 text-xs font-black text-amber-400 disabled:opacity-40 transition cursor-pointer"
                                        >
                                            Attach Video
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* How it works */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                    { icon: Building2, title: "1. Fixed-Price & Video Tours", text: "Uploaded directly by our admin with photos, HD walkthrough videos, and Google Maps pin." },
                    { icon: MessageSquareText, title: "2. Call or Click “I'm Interested”", text: "Call +91 74394 09340 or share your name and phone — no registration or EMD needed." },
                    { icon: BadgeCheck, title: "3. Direct Site Visit & Closing", text: "Our admin contacts you directly for site visit and smooth paperwork." }
                ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={20} /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                            <p className="text-xs text-slate-500">{text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Search & Property Type + Video Filter Bar */}
            {!loading && !error && properties.length > 0 && (
                <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by city, locality, or property title..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {FRESH_TYPE_PILLS.map((type) => {
                            const active = selectedType === type;
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelectedType(type)}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                        active
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setOnlyWithVideo((prev) => !prev)}
                            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                onlyWithVideo
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                        >
                            <Film size={12} />
                            <span>With Video</span>
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <p role="status" className="mt-10 text-slate-600">Loading fresh properties...</p>
            ) : error ? (
                <div role="alert" className="mt-10 rounded-xl bg-red-50 p-5 text-red-700">
                    {error}{" "}
                    <button type="button" onClick={() => setAttempt(attempt + 1)} className="font-bold underline">
                        Retry
                    </button>
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProperties.map(property => (
                        <FreshPropertyCard
                            key={property._id}
                            property={property}
                            onEnquire={setEnquiryFor}
                            onOpenVideoUploader={handleOpenVideoUploader}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
                    <Building2 size={40} className="mx-auto text-amber-600" />
                    <h2 className="mt-4 text-xl font-bold text-slate-900">
                        {properties.length > 0 ? "No matching fresh properties" : "No fresh properties listed yet"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        {properties.length > 0
                            ? "Try clearing your search or choosing 'All' property types."
                            : "Check back for new listings or contact us for property enquiries."}
                    </p>
                    {properties.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => { setSearchQuery(""); setSelectedType("All"); setOnlyWithVideo(false); }}
                            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 cursor-pointer"
                        >
                            Show All Fresh Properties
                        </button>
                    ) : (
                        <Link to="/contact" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800">
                            Contact us
                        </Link>
                    )}
                </div>
            )}

            {enquiryFor && <FreshEnquiryModal property={enquiryFor} onClose={() => setEnquiryFor(null)} />}
        </main>
    );
}
