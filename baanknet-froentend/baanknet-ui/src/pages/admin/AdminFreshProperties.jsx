import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, X, UploadCloud, MessageSquareText, MapPin } from "lucide-react";
import { fetchFreshProperties, saveFreshProperty, deleteFreshProperty } from "../../services/freshPropertyService";
import { formatINR } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import LocationPickerMap from "../../components/admin/LocationPickerMap";
import PropertyVideoManager from "../../components/admin/PropertyVideoManager";

const emptyForm = { title: "", description: "", price: "", propertyType: "Apartment", address: "", city: "", state: "", pincode: "", latitude: "", longitude: "", area: "", bedrooms: "", bathrooms: "", features: "", photos: "", uploads: [], videos: [], contactPhone: "", isPublished: true };
const inputClass = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const errorMessage = error => error.response?.data?.message || "Unable to connect. Please try again.";
const MAX_PHOTOS = 15;

// Resize + compress a device photo to a JPEG data URL (max 1280px, ~150-300 KB)
const compressImage = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
            const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = () => resolve(null);
        img.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
});

export default function AdminFreshProperties() {
    const { addToast } = useApp();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(null);
    const [busy, setBusy] = useState(false);
    const [videoUploading, setVideoUploading] = useState(false);
    const [autoFilledFields, setAutoFilledFields] = useState([]);
    const autoFillTimerRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => () => clearTimeout(autoFillTimerRef.current), []);

    async function load() {
        setLoading(true);
        try { setProperties((await fetchFreshProperties(true)).data); }
        catch (err) { setError(errorMessage(err)); }
        finally { setLoading(false); }
    }
    // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
    useEffect(() => { load(); }, []);

    function openForm(property) {
        setError(""); setNotice("");
        setEditing(property?._id || null);
        const photos = property?.photos || [];
        setForm(property
            ? {
                ...emptyForm,
                ...property,
                pincode: property.pincode || "",
                latitude: property.latitude ?? "",
                longitude: property.longitude ?? "",
                contactPhone: property.contactPhone || "",
                features: (property.features || []).join("\n"),
                // URLs stay editable as text; device-uploaded photos are shown as thumbnails
                photos: photos.filter(p => !p.startsWith("data:")).join("\n"),
                uploads: photos.filter(p => p.startsWith("data:")),
                videos: Array.isArray(property.videos) ? property.videos.filter(v => v && v.url) : []
            }
            : { ...emptyForm });
    }
    async function handlePhotoFiles(fileList) {
        const files = Array.from(fileList || []).filter(f => f.type.startsWith("image/"));
        const urlCount = form.photos.split("\n").filter(l => l.trim()).length;
        const room = MAX_PHOTOS - form.uploads.length - urlCount;
        if (files.length > room) setError(`Only ${MAX_PHOTOS} photos are allowed per property — extra photos were skipped.`);
        const compressed = (await Promise.all(files.slice(0, Math.max(room, 0)).map(compressImage))).filter(Boolean);
        setForm(prev => ({ ...prev, uploads: [...prev.uploads, ...compressed] }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
    async function submit(event) {
        event.preventDefault();
        if (videoUploading) {
            setError("Please wait until all videos finish uploading before saving.");
            return;
        }
        setBusy(true); setError(""); setNotice("");
        const lines = value => value.split("\n").map(line => line.trim()).filter(Boolean);
        const { uploads, ...rest } = form;
        const data = {
            ...rest,
            features: lines(form.features),
            photos: [...uploads, ...lines(form.photos)],
            videos: Array.isArray(form.videos) ? form.videos.map(v => ({ url: v.url, source: v.source || "link", title: (v.title || "").trim() })) : [],
            contactPhone: form.contactPhone.trim(),
            pincode: (form.pincode || "").trim()
        };
        for (const field of ["price", "area", "bedrooms", "bathrooms", "latitude", "longitude"]) {
            data[field] = form[field] === "" || form[field] == null ? null : Number(form[field]);
        }
        try {
            await saveFreshProperty(editing, data);
            setForm(null); setEditing(null);
            setNotice("Fresh property saved successfully.");
            await load();
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }
    async function remove(property) {
        if (!window.confirm(`Delete "${property.title}"? This cannot be undone.`)) return;
        setBusy(true); setError(""); setNotice("");
        try {
            await deleteFreshProperty(property._id);
            setNotice("Fresh property deleted.");
            await load();
        } catch (err) { setError(errorMessage(err)); }
        finally { setBusy(false); }
    }
    function field(name, label, type = "text", required = false, maxLength) {
        const isAutoFilled = autoFilledFields.includes(name);
        return <label className="block text-sm font-semibold text-slate-700">{label}{required && " *"}
            <input className={`${inputClass} transition-all duration-500 ${isAutoFilled ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : ""}`} type={type} required={required} maxLength={maxLength} min={type === "number" ? (name === "price" ? 1 : 0) : undefined} step={type === "number" ? (["bedrooms", "bathrooms"].includes(name) ? "1" : "any") : undefined}
                value={form[name] ?? ""} onChange={event => setForm({ ...form, [name]: event.target.value })} />
        </label>;
    }
    function handleMapLocationChange(loc, meta) {
        setForm(prev => {
            if (!prev) return prev;
            const next = { ...prev };
            if (loc.latitude !== undefined) next.latitude = loc.latitude;
            if (loc.longitude !== undefined) next.longitude = loc.longitude;
            if (loc.cityName !== undefined && loc.cityName !== "") next.city = loc.cityName;
            if (loc.stateName !== undefined && loc.stateName !== "") next.state = loc.stateName;
            if (loc.pincode !== undefined && loc.pincode !== "") next.pincode = loc.pincode;
            if (loc.locality || loc.cityName || loc.pincode) {
                const parts = [loc.locality, loc.cityName || next.city, loc.pincode || next.pincode].filter(Boolean);
                if (parts.length > 0) next.address = parts.join(", ");
            }
            return next;
        });
        if (meta?.autoFilled?.length) {
            const mapped = [];
            if (meta.autoFilled.includes("cityName")) mapped.push("city");
            if (meta.autoFilled.includes("stateName")) mapped.push("state");
            if (meta.autoFilled.includes("pincode")) mapped.push("pincode");
            if (meta.autoFilled.includes("locality") || meta.autoFilled.includes("cityName")) mapped.push("address");
            setAutoFilledFields(mapped);
            clearTimeout(autoFillTimerRef.current);
            autoFillTimerRef.current = setTimeout(() => setAutoFilledFields([]), 2500);
        }
    }
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-950">Fresh Properties (Direct Sale · No Auction)</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Properties created here appear <strong>only</strong> on the public <strong>Fresh Property</strong> list (<Link to="/admin/properties" className="font-semibold text-amber-700 hover:underline">manage Auction Properties separately →</Link>).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/fresh-properties" className="text-sm font-semibold text-amber-700 hover:underline">View public page</Link>
                    <button disabled={busy} onClick={() => openForm(null)} className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-amber-400 disabled:opacity-50"><Plus size={16} />Add Fresh Property</button>
                </div>
            </div>
            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button type="button" onClick={() => { setError(""); load(); }} className="underline">Retry loading listings</button></div>}
            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</p>}
            {form && <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">{editing ? "Edit Fresh Property" : "Add Fresh Property"}</h2><button type="button" disabled={busy} onClick={() => setForm(null)} aria-label="Close form"><X size={20} /></button></div>
                <fieldset disabled={busy} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        {field("title", "Property title", "text", true, 200)}
                        <label className="block text-sm font-semibold text-slate-700">Property type *<select value={form.propertyType} onChange={event => setForm({ ...form, propertyType: event.target.value })} className={inputClass}>{["Apartment", "House", "Plot", "Commercial", "Industrial", "Other"].map(type => <option key={type}>{type}</option>)}</select></label>
                        {field("price", "Asking price (INR)", "number", true)}
                        {field("area", "Area (sq ft)", "number")}
                        {field("bedrooms", "Bedrooms", "number")}{field("bathrooms", "Bathrooms", "number")}
                    </div>

                    {/* Interactive Location Picker Map with "Use Current Location" */}
                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                <MapPin size={16} className="text-amber-600" />
                                Property Location & Current GPS Auto-Fill
                            </span>
                            <span className="text-xs text-slate-500">
                                Click <strong>Use Current Location</strong>, search, or click on the map to auto-fill Address, City, State & Pincode
                            </span>
                        </div>
                        <LocationPickerMap
                            latitude={form.latitude !== "" && !isNaN(Number(form.latitude)) ? form.latitude : ""}
                            longitude={form.longitude !== "" && !isNaN(Number(form.longitude)) ? form.longitude : ""}
                            cityName={form.city}
                            stateName={form.state}
                            locality={form.address}
                            pincode={form.pincode}
                            onLocationChange={handleMapLocationChange}
                            onToast={(msg, type) => addToast(msg, type)}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            {field("address", "Address / Locality", "text", true, 500)}
                            {field("city", "City", "text", true, 100)}
                            {field("state", "State", "text", true, 100)}
                            {field("pincode", "Pincode", "text", false, 20)}
                        </div>
                    </div>
                    <label className="block text-sm font-semibold text-slate-700">Description<textarea rows={4} maxLength={10000} className={inputClass} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">Features and amenities<textarea rows={4} placeholder={"Parking\nLift\n24-hour water supply"} className={inputClass} value={form.features} onChange={event => setForm({ ...form, features: event.target.value })} /><span className="text-xs font-normal text-slate-500">Enter one feature per line.</span></label>
                        <label className="block text-sm font-semibold text-slate-700">Photo URLs <span className="font-normal text-slate-400">(optional)</span><textarea rows={4} placeholder="https://example.com/property.jpg" className={inputClass} value={form.photos} onChange={event => setForm({ ...form, photos: event.target.value })} /><span className="text-xs font-normal text-slate-500">Or paste image links, one per line.</span></label>
                    </div>

                    {/* Photos uploaded from the admin's device */}
                    <div>
                        <span className="block text-sm font-semibold text-slate-700">Property photos</span>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={event => handlePhotoFiles(event.target.files)} />
                        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
                            {form.uploads.map((src, index) => (
                                <div key={index} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                    <img src={src} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                                    {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-slate-950">Cover</span>}
                                    <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setForm(prev => ({ ...prev, uploads: prev.uploads.filter((_, i) => i !== index) }))} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100"><X size={13} /></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-amber-500 hover:text-amber-700">
                                <UploadCloud size={22} />
                                <span className="text-xs font-bold">Upload photos</span>
                            </button>
                        </div>
                        <span className="mt-1 block text-xs text-slate-500">JPG / PNG / WEBP from your phone or computer — resized automatically. The first photo is the cover. Max {MAX_PHOTOS} photos.</span>
                    </div>

                    {/* Property Videos (upload MP4/WebM/OGG/MOV from device or paste YouTube / Vimeo / video link) */}
                    <PropertyVideoManager
                        videos={form.videos || []}
                        onChange={(updater) =>
                            setForm((prev) => ({
                                ...prev,
                                videos: updater(Array.isArray(prev.videos) ? prev.videos : [])
                            }))
                        }
                        onToast={(msg, type) => addToast(msg, type)}
                        onUploadingChange={setVideoUploading}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="block text-sm font-semibold text-slate-700">Contact phone for buyers <span className="font-normal text-slate-400">(optional)</span>
                            <input className={inputClass} type="tel" maxLength={18} placeholder="e.g. 98300 12345" value={form.contactPhone} onChange={event => setForm({ ...form, contactPhone: event.target.value })} />
                            <span className="text-xs font-normal text-slate-500">Shows “Call” and “WhatsApp” buttons. Enquiries always arrive in Buyer Inquiries.</span>
                        </label>
                    </div>
                    <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.isPublished} onChange={event => setForm({ ...form, isPublished: event.target.checked })} className="h-4 w-4 accent-amber-600" />Publish on the Fresh Property page</label>
                    <div className="flex gap-3"><button type="submit" disabled={busy || videoUploading} className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{busy ? "Saving..." : videoUploading ? "Uploading video..." : "Save Property"}</button><button type="button" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold" onClick={() => setForm(null)}>Cancel</button></div>
                </fieldset>
            </form>}
            {loading ? <p role="status" className="p-6 text-slate-500">Loading fresh properties...</p> : !error && properties.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">No fresh properties yet. Select Add Fresh Property to create your first listing.</div> : (
                <div className="space-y-3">{properties.map(property => <div key={property._id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <div><h2 className="font-bold text-slate-950">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.city}, {property.state} · {formatINR(property.price)}</p><span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-bold ${property.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{property.isPublished ? "Published" : "Draft"}</span></div>
                    <div className="flex gap-2"><Link to="/admin/inquiries" title="Enquiries for fresh properties appear in Buyer Inquiries with a FRESH badge" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"><MessageSquareText size={15} />Enquiries</Link><button disabled={busy} onClick={() => openForm(property)} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"><Pencil size={15} />Edit</button><button disabled={busy} onClick={() => remove(property)} className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"><Trash2 size={15} />Delete</button></div>
                </div>)}</div>
            )}
        </div>
    );
}
