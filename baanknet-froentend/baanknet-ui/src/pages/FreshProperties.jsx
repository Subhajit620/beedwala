import { BadgeCheck, Bath, BedDouble, Building2, CheckCircle2, Film, Handshake, MapPin, Maximize2, MessageSquareText, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchFreshProperties } from "../services/freshPropertyService";
import { formatINR } from "../utils/formatters";
import FreshEnquiryModal from "../components/FreshEnquiryModal";
import PropertyVideos from "../components/PropertyVideos";

const FRESH_TYPE_PILLS = ["All", "Apartment", "House", "Plot", "Commercial"];

function FreshPropertyCard({ property, onEnquire }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [imageError, setImageError] = useState(false);
    const photos = Array.isArray(property.photos) ? property.photos.filter(Boolean) : [];
    const features = Array.isArray(property.features) ? property.features.filter(Boolean) : [];
    const videoCount = Array.isArray(property.videos) ? property.videos.filter(v => v && v.url).length : 0;

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition">
            {/* Hero Image */}
            <div className="relative flex h-56 items-center justify-center bg-slate-100">
                {photos.length > 0 && !imageError ? (
                    <img
                        src={photos[selectedPhoto] || photos[0]}
                        alt={property.title}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <Building2 size={48} className="text-slate-400" />
                )}

                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-extrabold text-white shadow-sm">
                    <BadgeCheck size={12} /> Direct Sale · No Auction
                </span>

                {videoCount > 0 && (
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                        <Film size={12} /> {videoCount} {videoCount === 1 ? "Video" : "Videos"}
                    </span>
                )}
            </div>

            {/* Thumbnail Strip (visible immediately if multiple photos exist) */}
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                    {photos.map((photo, index) => (
                        <button
                            key={index}
                            type="button"
                            aria-label={`View photo ${index + 1}`}
                            aria-pressed={selectedPhoto === index}
                            onClick={() => {
                                setSelectedPhoto(index);
                                setImageError(false);
                            }}
                            className={`shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                                selectedPhoto === index
                                    ? "border-amber-500 ring-2 ring-amber-500/20"
                                    : "border-transparent opacity-75 hover:opacity-100"
                            }`}
                        >
                            <img src={photo} alt={`Photo ${index + 1}`} loading="lazy" className="h-11 w-14 object-cover" />
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                            {property.propertyType || "Property"}
                        </span>
                        <span className="text-2xl font-black text-slate-950">{formatINR(property.price)}</span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-950 leading-snug">{property.title}</h2>

                    {/* Clear Address & Google Maps Link */}
                    <div className="space-y-2">
                        <p className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-amber-600" />
                            <span>
                                {property.address ? `${property.address}, ` : ""}
                                {property.city}, {property.state}
                                {property.pincode ? ` - ${property.pincode}` : ""}
                            </span>
                        </p>

                        {property.latitude != null && property.longitude != null && (
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
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    <Maximize2 size={12} className="text-slate-500" />
                                    {property.area.toLocaleString("en-IN")} sq ft
                                </span>
                            )}
                            {property.bedrooms > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    <BedDouble size={12} className="text-slate-500" />
                                    {property.bedrooms} {property.bedrooms === 1 ? "Bed" : "Beds"}
                                </span>
                            )}
                            {property.bathrooms > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                    <Bath size={12} className="text-slate-500" />
                                    {property.bathrooms} {property.bathrooms === 1 ? "Bath" : "Baths"}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {property.description && (
                        <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-line">
                            {property.description}
                        </p>
                    )}

                    {/* Features Chips */}
                    {features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {features.map((feature, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800"
                                >
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    {feature}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Video Walkthroughs */}
                    {videoCount > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <PropertyVideos videos={property.videos} />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onEnquire(property)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 cursor-pointer transition"
                >
                    <Handshake size={16} /> I'm Interested — Contact Us
                </button>
            </div>
        </article>
    );
}

export default function FreshProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [enquiryFor, setEnquiryFor] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");

    useEffect(() => {
        let active = true;
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        setLoading(true); setError("");
        fetchFreshProperties().then(response => { if (active) setProperties(Array.isArray(response?.data) ? response.data : []); })
            .catch(() => { if (active) setError("Unable to load fresh properties. Please try again."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [attempt]);

    const filteredProperties = useMemo(() => {
        return properties.filter((prop) => {
            const matchesType =
                selectedType === "All" ||
                (prop.propertyType || "").toLowerCase() === selectedType.toLowerCase();
            if (!matchesType) return false;

            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;

            return [prop.title, prop.city, prop.state, prop.address, prop.propertyType]
                .filter(Boolean)
                .some((val) => String(val).toLowerCase().includes(q));
        });
    }, [properties, searchQuery, selectedType]);

    return (
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <BadgeCheck size={14} /> Direct from Admin · No Auction
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Fresh Properties (Direct Buy)</h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
                Verified properties uploaded directly by the <strong className="text-slate-900">Bidwallah Admin</strong> at a fixed price — <strong className="text-slate-900">no auction, no bidding, and no EMD required</strong>.
                Click <strong className="text-slate-900">“I'm Interested”</strong> on any property to book a site visit or talk directly with our team.
            </p>

            {/* How it works */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                    { icon: Building2, title: "1. Fixed-Price Listings", text: "Uploaded directly by our admin with photos, videos, and Google Maps pin." },
                    { icon: MessageSquareText, title: "2. Click “I'm Interested”", text: "Share your name and phone — no registration or EMD needed." },
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

            {/* Simple Search & Property Type Filter Bar */}
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
                        <FreshPropertyCard key={property._id} property={property} onEnquire={setEnquiryFor} />
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
                            onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
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
