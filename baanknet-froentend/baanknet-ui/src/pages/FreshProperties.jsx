import { BadgeCheck, Building2, Film, Handshake, MapPin, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFreshProperties } from "../services/freshPropertyService";
import { formatINR } from "../utils/formatters";
import FreshEnquiryModal from "../components/FreshEnquiryModal";
import PropertyVideos from "../components/PropertyVideos";

function FreshPropertyCard({ property, onEnquire }) {
    const [selectedPhoto, setSelectedPhoto] = useState(0);
    const [imageError, setImageError] = useState(false);
    const videoCount = Array.isArray(property.videos) ? property.videos.filter(v => v && v.url).length : 0;
    return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative flex h-56 items-center justify-center bg-slate-100">
            {property.photos.length > 0 && !imageError ? <img src={property.photos[selectedPhoto]} alt={property.title} loading="lazy" onError={() => setImageError(true)} className="h-full w-full object-cover" /> : <Building2 size={48} className="text-slate-400" />}
            {videoCount > 0 && (
                <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-slate-950/85 px-2.5 py-1 text-[11px] font-bold text-amber-400">
                    <Film size={12} /> {videoCount} {videoCount === 1 ? "Video" : "Videos"}
                </span>
            )}
        </div>
        <div className="space-y-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{property.propertyType} · <span className="text-emerald-700">Direct sale · No auction</span></p>
            <h2 className="text-xl font-bold text-slate-950">{property.title}</h2>
            <p className="text-sm text-slate-600">{property.city}, {property.state}</p>
            <p className="text-2xl font-black text-slate-950">{formatINR(property.price)}</p>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {property.area > 0 && <span>{property.area.toLocaleString("en-IN")} sq ft</span>}
                {property.bedrooms > 0 && <span>{property.bedrooms} bedrooms</span>}
                {property.bathrooms > 0 && <span>{property.bathrooms} bathrooms</span>}
            </div>
            <details className="border-t border-slate-100 pt-3">
                <summary className="cursor-pointer text-sm font-bold text-amber-700">Property details and features</summary>
                <div className="mt-3 space-y-4 text-sm text-slate-600">
                    <p>{property.address}, {property.city}, {property.state}{property.pincode ? ` - ${property.pincode}` : ""}</p>
                    {property.latitude != null && property.longitude != null && (
                        <a
                            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                        >
                            <MapPin size={14} /> View exact location on Google Maps
                        </a>
                    )}
                    {property.description && <p className="whitespace-pre-line">{property.description}</p>}
                    {property.features.length > 0 && <ul className="list-disc space-y-1 pl-5">{property.features.map((feature, index) => <li key={index}>{feature}</li>)}</ul>}
                    {property.photos.length > 1 && <div className="flex flex-wrap gap-2">{property.photos.map((photo, index) => <button key={index} type="button" aria-label={`View photo ${index + 1}`} aria-pressed={selectedPhoto === index} onClick={() => { setSelectedPhoto(index); setImageError(false); }} className={`overflow-hidden rounded-lg border-2 ${selectedPhoto === index ? "border-amber-500" : "border-transparent"}`}><img src={photo} alt={`Photo ${index + 1}`} loading="lazy" className="h-12 w-16 object-cover" /></button>)}</div>}
                    {videoCount > 0 && <PropertyVideos videos={property.videos} />}
                </div>
            </details>
            <button type="button" onClick={() => onEnquire(property)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800 cursor-pointer">
                <Handshake size={16} /> I'm Interested — Contact Us
            </button>
        </div>
    </article>;
}

export default function FreshProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);
    const [enquiryFor, setEnquiryFor] = useState(null);
    useEffect(() => {
        let active = true;
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        setLoading(true); setError("");
        fetchFreshProperties().then(response => { if (active) setProperties(response.data); })
            .catch(() => { if (active) setError("Unable to load fresh properties. Please try again."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [attempt]);
    return (
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <BadgeCheck size={14} /> Direct from Admin · No Auction
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Fresh Property</h1>
            <p className="mt-4 max-w-2xl text-slate-600">
                Only properties uploaded directly by the <strong className="text-slate-900">Bidwallah Admin</strong> appear here — <strong className="text-slate-900">no auction, no bidding, no EMD</strong>, and no third-party or bank-auction listings.
                If you are interested in any property below, simply click <strong className="text-slate-900">“I'm Interested”</strong> to connect directly with our admin.
            </p>

            {/* How it works */}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                    { icon: Building2, title: "1. Admin-only listings", text: "Every property here is uploaded directly by our admin at a fixed price." },
                    { icon: MessageSquareText, title: "2. Click “I'm Interested”", text: "Share your name and phone — no registration or EMD needed." },
                    { icon: BadgeCheck, title: "3. Connect with Admin", text: "Our admin contacts you directly for details, site visit and closing." }
                ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Icon size={20} /></div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{title}</p>
                            <p className="text-xs text-slate-500">{text}</p>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? <p role="status" className="mt-10 text-slate-600">Loading fresh properties...</p> : error ? <div role="alert" className="mt-10 rounded-xl bg-red-50 p-5 text-red-700">{error} <button type="button" onClick={() => setAttempt(attempt + 1)} className="font-bold underline">Retry</button></div> : properties.length > 0 ? (
                <div className="mt-10 grid items-start gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map(property => <FreshPropertyCard key={property._id} property={property} onEnquire={setEnquiryFor} />)}</div>
            ) : <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-16 text-center">
                <Building2 size={40} className="mx-auto text-amber-600" />
                <h2 className="mt-4 text-xl font-bold text-slate-900">No fresh properties listed yet</h2>
                <p className="mt-2 text-sm text-slate-600">Check back for new listings or contact us for property enquiries.</p>
                <Link to="/contact" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-amber-400 hover:bg-slate-800">Contact us</Link>
            </div>}

            {enquiryFor && <FreshEnquiryModal property={enquiryFor} onClose={() => setEnquiryFor(null)} />}
        </main>
    );
}
