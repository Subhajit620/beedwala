import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Search, MapPin, RefreshCw, Radio, Crosshair } from "lucide-react";

// Professional animated map pin icon with multi-ring sonar pulse waves
const customPinIcon = L.divIcon({
    className: "pro-map-marker-root",
    html: `
        <div style="position: relative; width: 40px; height: 46px; pointer-events: none;">
            <!-- Expanding Radar Sonar Waves -->
            <div class="sonar-ring ring-1"></div>
            <div class="sonar-ring ring-2"></div>
            <div class="sonar-ring ring-3"></div>

            <!-- Pin Marker Body -->
            <div class="pin-drop-anim" style="position: relative; width: 34px; height: 34px; left: 3px; top: 0;">
                <div style="width: 34px; height: 34px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border: 3px solid #0f172a; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 22px rgba(15, 23, 42, 0.45);">
                    <div style="width: 10px; height: 10px; background: #0f172a; border-radius: 50%; transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
                        <div style="width: 4px; height: 4px; background: #fef08a; border-radius: 50%; box-shadow: 0 0 6px #fef08a;"></div>
                    </div>
                </div>
            </div>

            <!-- Ground Contact Point & Shadow -->
            <div style="position: absolute; bottom: 2px; left: 20px; width: 14px; height: 5px; background: rgba(15,23,42,0.45); border-radius: 50%; transform: translateX(-50%); filter: blur(1.5px);"></div>
        </div>
    `,
    iconSize: [40, 46],
    iconAnchor: [20, 42]
});

// Default fallback coordinates (Kolkata, WB)
const DEFAULT_CENTER = [22.5726, 88.3639];

// ---------- Reverse geocoding (coordinates → address) with a backup provider ----------
const fetchJson = async (url, ms = 8000, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
};

const cleanPincode = (pc) => {
    const m = String(pc || "").replace(/\s+/g, "").match(/\d{6}/);
    return m ? m[0] : "";
};

// Provider 1: OpenStreetMap Nominatim
async function lookupNominatim(lat, lng) {
    const data = await fetchJson(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        8000,
        { headers: { "Accept-Language": "en" } }
    );
    const a = data?.address || {};
    return {
        city: a.city || a.town || a.municipality || a.city_district || a.village || a.county || a.state_district || a.district || "",
        state: a.state || a.union_territory || "",
        locality: a.suburb || a.neighbourhood || a.quarter || a.residential || a.hamlet || a.village || a.road || "",
        pincode: cleanPincode(a.postcode)
    };
}

// Provider 2 (backup): BigDataCloud free client-side reverse geocoding — no API key needed
async function lookupBigDataCloud(lat, lng) {
    const d = await fetchJson(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    const admin = d?.localityInfo?.administrative || [];
    const byOrder = (n) => admin.find((x) => x.adminLevel === n)?.name || "";
    return {
        city: d?.city || byOrder(5) || byOrder(6) || "",
        state: d?.principalSubdivision || byOrder(4) || "",
        locality: d?.locality && d.locality !== d.city ? d.locality : byOrder(8) || byOrder(7) || "",
        pincode: cleanPincode(d?.postcode)
    };
}

/**
 * Tries Nominatim first; if it fails or is missing city/state/pincode, asks the backup
 * provider and merges the results (first non-empty value wins). Returns null if both fail.
 */
async function lookupAddress(lat, lng) {
    let primary = null;
    try {
        primary = await lookupNominatim(lat, lng);
    } catch (err) {
        console.warn("Nominatim reverse geocode failed:", err.message);
    }
    const complete = primary && primary.city && primary.state && primary.pincode && primary.locality;
    if (complete) return primary;

    let backup = null;
    try {
        backup = await lookupBigDataCloud(lat, lng);
    } catch (err) {
        console.warn("Backup reverse geocode failed:", err.message);
    }
    if (!primary && !backup) return null;

    const merged = {};
    for (const key of ["city", "state", "locality", "pincode"]) {
        merged[key] = primary?.[key] || backup?.[key] || "";
    }
    return merged.city || merged.state ? merged : null;
}

// Browser geolocation as a Promise
const getPosition = (options) =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));

export default function LocationPickerMap({
    latitude,
    longitude,
    cityName, // used to bias the map search box
    onLocationChange,
    onToast
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [accuracy, setAccuracy] = useState(null);
    const [resolvedAddress, setResolvedAddress] = useState("");

    // Latest callbacks in refs: the Leaflet click/drag handlers are bound once on mount,
    // so they must never call a stale version of these props.
    const onLocationChangeRef = useRef(onLocationChange);
    const onToastRef = useRef(onToast);
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
        onToastRef.current = onToast;
    }, [onLocationChange, onToast]);
    const lookupIdRef = useRef(0);

    // Initial Coordinates Resolver
    const initialLat = latitude && !isNaN(Number(latitude)) ? Number(latitude) : DEFAULT_CENTER[0];
    const initialLng = longitude && !isNaN(Number(longitude)) ? Number(longitude) : DEFAULT_CENTER[1];
    const hasInitialCoords = Boolean(latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude)));

    /**
     * Sets the coordinates immediately, then looks up the address and auto-fills
     * City / State / Locality / Pincode. Old values (e.g. default "Kolkata" / "700001")
     * are replaced — never silently kept — when an address is found.
     */
    const reverseGeocode = useCallback(async (lat, lng, shouldNotify = true) => {
        const requestId = ++lookupIdRef.current; // only the latest lookup may write to the form
        const coords = { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) };
        const notify = (msg, type) => shouldNotify && onToastRef.current && onToastRef.current(msg, type);

        onLocationChangeRef.current?.(coords, { autoFilled: ["latitude", "longitude"] });
        setResolving(true);
        setResolvedAddress("");

        const address = await lookupAddress(lat, lng);
        if (requestId !== lookupIdRef.current) return; // a newer pin position superseded this one
        setResolving(false);

        if (!address) {
            // Don't leave an address from a previous pin next to the new coordinates
            onLocationChangeRef.current?.({ ...coords, cityName: "", stateName: "", locality: "", pincode: "" });
            notify("Location pinned, but the address couldn't be looked up (network issue). Please type City, State and Pincode.", "warning");
            return;
        }

        onLocationChangeRef.current?.(
            {
                ...coords,
                cityName: address.city,
                stateName: address.state,
                locality: address.locality,
                pincode: address.pincode
            },
            { autoFilled: ["latitude", "longitude", "cityName", "stateName", "locality", "pincode"] }
        );

        const summary = [address.locality, address.city, address.state].filter(Boolean).join(", ");
        setResolvedAddress(summary + (address.pincode ? ` (${address.pincode})` : ""));
        const missing = [!address.locality && "Locality", !address.pincode && "Pincode"].filter(Boolean);
        if (missing.length) {
            notify(`📍 ${summary} — please add ${missing.join(" & ")} manually.`, "warning");
        } else {
            notify(`📍 Address filled: ${summary} (${address.pincode})`, "success");
        }
    }, []);

    // Initialize Leaflet Map Instance
    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [initialLat, initialLng],
            zoom: hasInitialCoords ? 15 : 12,
            zoomControl: false,
            attributionControl: false
        });

        // Crisp OpenStreetMap Tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors"
        }).addTo(map);

        // Add custom Zoom Controls to bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Add Animated Custom Marker
        const marker = L.marker([initialLat, initialLng], {
            icon: customPinIcon,
            draggable: true
        }).addTo(map);

        markerRef.current = marker;
        mapInstanceRef.current = map;

        // On Marker Drag End
        marker.on("dragend", (e) => {
            const { lat, lng } = e.target.getLatLng();
            reverseGeocode(lat, lng, true);
        });

        // On Map Click -> Smooth move marker & reverse geocode
        map.on("click", (e) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            reverseGeocode(lat, lng, true);
        });

        // Invalidate map size after render to prevent gray box
        setTimeout(() => {
            map.invalidateSize();
        }, 250);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync external coordinate changes into map marker
    useEffect(() => {
        if (!mapInstanceRef.current || !markerRef.current) return;
        if (latitude && longitude && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
            const lat = Number(latitude);
            const lng = Number(longitude);
            const currentPos = markerRef.current.getLatLng();
            if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
                markerRef.current.setLatLng([lat, lng]);
                mapInstanceRef.current.panTo([lat, lng]);
            }
        }
    }, [latitude, longitude]);

    // "Use Current Location": GPS fix → move pin → auto-fill the address fields
    const handleUseCurrentLocation = async () => {
        const toast = (msg, type) => onToastRef.current && onToastRef.current(msg, type);

        if (!navigator.geolocation) {
            toast("Your browser doesn't support location. Please click on the map or type the address.", "error");
            return;
        }
        // Browsers only allow location on HTTPS or localhost (opening the site as http://192.168.x.x fails silently)
        if (!window.isSecureContext) {
            toast("Location needs a secure (https://) connection. Open the site with https:// or on localhost, or click your location on the map.", "error");
            return;
        }

        setDetecting(true);
        setAccuracy(null);

        let pos;
        try {
            // 1st try: precise GPS
            pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
        } catch (err) {
            if (err.code === 1) {
                setDetecting(false);
                toast("Location permission is blocked. Click the 🔒 icon in the address bar → Site settings → allow Location, then try again.", "error");
                return;
            }
            try {
                // 2nd try: faster network / Wi-Fi based location (works indoors & on desktops without GPS)
                pos = await getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 });
            } catch (err2) {
                setDetecting(false);
                console.error("Geolocation error:", err2);
                toast(
                    err2.code === 1
                        ? "Location permission is blocked. Allow Location for this site in your browser settings."
                        : "Couldn't get your location. Turn on device Location / Wi-Fi and try again, or click your spot on the map.",
                    "error"
                );
                return;
            }
        }

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setAccuracy(acc);
        setDetecting(false);

        if (mapInstanceRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapInstanceRef.current.flyTo([lat, lng], acc > 1000 ? 14 : 17, { animate: true, duration: 1.4, easeLinearity: 0.25 });
        }

        if (acc > 1000) {
            toast(`Approximate location only (±${(acc / 1000).toFixed(1)} km). Drag the pin to the exact property spot.`, "warning");
        }
        reverseGeocode(lat, lng, true);
    };

    // Handle Search Location input (e.g. "Salt Lake, Kolkata")
    const handleSearchLocation = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setSearching(true);
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery + (cityName ? `, ${cityName}` : "")
                )}&limit=1`,
                { headers: { "Accept-Language": "en" } }
            );

            if (res.ok) {
                const results = await res.json();
                if (results && results.length > 0) {
                    const lat = parseFloat(results[0].lat);
                    const lng = parseFloat(results[0].lon);

                    if (mapInstanceRef.current && markerRef.current) {
                        markerRef.current.setLatLng([lat, lng]);
                        mapInstanceRef.current.flyTo([lat, lng], 15, {
                            animate: true,
                            duration: 1.4,
                            easeLinearity: 0.25
                        });
                    }

                    reverseGeocode(lat, lng, true);
                } else if (onToast) {
                    onToast("No exact location match found. Try a broader city or landmark.", "info");
                }
            }
        } catch (err) {
            console.error("Map search error:", err);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0 transition">
            {/* Embedded Professional CSS Animations for Radar & Markers */}
            <style>{`
                @keyframes pro-sonar-expand {
                    0% {
                        transform: translate(-50%, -50%) scale(0.3);
                        opacity: 0.95;
                    }
                    60% {
                        transform: translate(-50%, -50%) scale(2.2);
                        opacity: 0.3;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(3.2);
                        opacity: 0;
                    }
                }

                @keyframes radar-sweep {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes radar-pulse-glow {
                    0%, 100% {
                        opacity: 0.35;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.85;
                        transform: scale(1.05);
                    }
                }

                @keyframes pin-drop-soft {
                    0% {
                        transform: translateY(-24px) scale(0.85);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(0) scale(1.08);
                        opacity: 1;
                    }
                    80% {
                        transform: translateY(-4px) scale(0.96);
                    }
                    100% {
                        transform: translateY(0) scale(1);
                    }
                }

                .sonar-ring {
                    position: absolute;
                    top: 40px;
                    left: 20px;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(245, 158, 11, 0) 75%);
                    border: 1.5px solid rgba(245, 158, 11, 0.85);
                    animation: pro-sonar-expand 2.4s infinite cubic-bezier(0.1, 0.2, 0.4, 1);
                    pointer-events: none;
                }

                .sonar-ring.ring-2 {
                    animation-delay: 0.8s;
                }

                .sonar-ring.ring-3 {
                    animation-delay: 1.6s;
                }

                .pin-drop-anim {
                    animation: pin-drop-soft 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                .radar-sweeper {
                    animation: radar-sweep 2s linear infinite;
                }
            `}</style>

            {/* Top Toolbar / Quick Search & Current Location */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Search in Map — a <div>, not a <form>: this component lives inside the
                    property form, and a nested form would also submit (save) the parent form */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault(); // stop Enter from submitting the parent property form
                                handleSearchLocation();
                            }
                        }}
                        placeholder="Search landmark, sector, or area on map..."
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-14 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                    />
                    <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <button
                        type="button"
                        onClick={() => handleSearchLocation()}
                        disabled={searching || !searchQuery.trim()}
                        className="absolute right-1.5 top-1.5 h-6 px-2.5 rounded-lg bg-slate-900 text-amber-400 text-[10px] font-bold hover:bg-slate-800 disabled:opacity-40 transition cursor-pointer"
                    >
                        {searching ? "..." : "Search"}
                    </button>
                </div>

                {/* 1-Click Use Current Location Button */}
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={detecting}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs shrink-0 ${
                        detecting
                            ? "border-amber-400 bg-amber-500 text-slate-950 font-black animate-pulse"
                            : "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900"
                    }`}
                    title="Move pin to your current GPS position"
                >
                    {detecting ? (
                        <>
                            <Radio size={14} className="animate-spin text-slate-950" />
                            <span>Triangulating GPS...</span>
                        </>
                    ) : (
                        <>
                            <LocateFixed size={14} className="text-amber-700" />
                            <span>📍 Use Current Location</span>
                        </>
                    )}
                </button>
            </div>

            {/* Interactive Leaflet Map Canvas */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-100 overflow-hidden">
                <div ref={mapContainerRef} className="h-full w-full z-0" />

                {/* Professional GPS Radar Sweep Overlay when Acquiring Location */}
                {detecting && (
                    <div className="absolute inset-0 z-[500] bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white transition-all duration-300">
                        {/* Radar Reticle Graphic */}
                        <div className="relative h-32 w-32 flex items-center justify-center mb-3">
                            {/* Outer Radar Rings */}
                            <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-25"></div>
                            <div className="absolute inset-2 rounded-full border border-amber-400/40"></div>
                            <div className="absolute inset-6 rounded-full border border-amber-400/50"></div>
                            <div className="absolute inset-10 rounded-full border border-dashed border-amber-400/70"></div>

                            {/* Rotating Sweeper Cone */}
                            <div
                                className="absolute inset-0 rounded-full radar-sweeper"
                                style={{
                                    background: "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(245, 158, 11, 0.45) 360deg)"
                                }}
                            ></div>

                            {/* Center Crosshair Core */}
                            <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50">
                                <Crosshair size={18} className="animate-spin" />
                            </div>
                        </div>

                        <div className="text-center px-4">
                            <span className="block text-xs font-black tracking-wide text-amber-400 uppercase">
                                Acquiring Satellite GPS Fix
                            </span>
                            <span className="block text-[11px] text-slate-300 mt-0.5">
                                Calibrating high-precision device coordinates...
                            </span>
                        </div>
                    </div>
                )}

                {/* User-friendly floating tip banner at the bottom */}
                <div className="absolute bottom-2 left-3 right-12 z-[400] pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-white shadow-md border border-white/10 max-w-full">
                        <MapPin size={13} className="text-amber-400 shrink-0" />
                        <span className="truncate">
                            {resolving
                                ? "Filling address from location…"
                                : resolvedAddress
                                ? `Pinned: ${resolvedAddress}`
                                : "Click anywhere on map or drag pin to auto-set address"}
                        </span>
                        {resolving && <RefreshCw size={11} className="text-amber-400 animate-spin shrink-0" />}
                        {accuracy ? (
                            <span className="rounded bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                                ±{accuracy}m
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
