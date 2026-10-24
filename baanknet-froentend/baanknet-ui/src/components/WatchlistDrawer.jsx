import React from "react";
import { Link } from "react-router-dom";
import { X, Bookmark, Trash2, ArrowRight, Building2, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatINR, getCleanPropertyTitle } from "../utils/formatters";

export default function WatchlistDrawer() {
    const { savedProperties, toggleSaveProperty, clearWatchlist, isWatchlistOpen, setIsWatchlistOpen } =
        useApp();

    if (!isWatchlistOpen) return null;

    const totalValue = savedProperties.reduce((acc, p) => acc + (Number(p.propertyPrice) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setIsWatchlistOpen(false)}
            ></div>

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                <Bookmark size={18} className="fill-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Saved Properties</h2>
                                <span className="text-xs text-slate-500 font-medium">
                                    {savedProperties.length} {savedProperties.length === 1 ? "property" : "properties"} bookmarked
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsWatchlistOpen(false)}
                            className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {savedProperties.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                <div className="h-16 w-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200 mb-4">
                                    <Bookmark size={28} />
                                </div>
                                <h3 className="text-base font-bold text-slate-700">No Saved Properties</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                                    Click the bookmark icon on any property card to save and track assets here.
                                </p>
                                <Link
                                    to="/properties"
                                    onClick={() => setIsWatchlistOpen(false)}
                                    className="mt-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-amber-600 hover:to-amber-800 transition"
                                >
                                    Browse Listings
                                </Link>
                            </div>
                        ) : (
                            savedProperties.map((property) => {
                                const id = property.sourcePropertyId || property._id;
                                const cleanTitle = getCleanPropertyTitle(property);
                                const hasPhoto = property.photos && property.photos.length > 0 && property.photos[0];

                                return (
                                    <div
                                        key={id}
                                        className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-3 hover:border-amber-300 transition group relative"
                                    >
                                        {/* Image */}
                                        <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                                            {hasPhoto ? (
                                                <img
                                                    src={property.photos[0]}
                                                    alt={cleanTitle}
                                                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                    <Building2 size={20} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                {property.bankName && (
                                                    <span className="text-[10px] font-bold text-amber-700 truncate block">
                                                        {property.bankName}
                                                    </span>
                                                )}
                                                <Link
                                                    to={`/properties/${id}`}
                                                    onClick={() => setIsWatchlistOpen(false)}
                                                    className="text-xs font-bold text-slate-900 hover:text-amber-700 line-clamp-1 transition"
                                                >
                                                    {cleanTitle}
                                                </Link>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <MapPin size={11} />
                                                    <span className="truncate">{property.cityName || "India"}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <span className="text-xs font-black text-slate-900">
                                                    {formatINR(property.propertyPrice)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSaveProperty(property)}
                                                    className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                                    title="Remove from saved"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Summary */}
                    {savedProperties.length > 0 && (
                        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/70 space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Estimated Total Reserve:</span>
                                <span className="text-base font-black text-slate-900">
                                    {formatINR(totalValue)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={clearWatchlist}
                                    className="rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    Clear All
                                </button>
                                <Link
                                    to="/properties"
                                    onClick={() => setIsWatchlistOpen(false)}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 py-2.5 text-xs font-bold text-white transition"
                                >
                                    <span>Browse More</span>
                                    <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
