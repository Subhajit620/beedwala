import React from "react";
import { Link } from "react-router-dom";
import { X, Scale, Trash2, ArrowRight, Building2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatINR, calculatePricePerSqFt, getCleanPropertyTitle } from "../utils/formatters";

export default function CompareModal() {
    const {
        comparedProperties,
        toggleCompareProperty,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen
    } = useApp();

    if (comparedProperties.length === 0) return null;

    return (
        <>
            {/* Floating Bottom Comparison Dock */}
            <aside aria-label="Compare properties dock" className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] sm:w-[94%] max-w-2xl">
                <div className="flex items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-amber-500/30 bg-slate-950/95 p-2.5 sm:p-3 sm:px-5 text-white shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-600 text-white shrink-0">
                            <Scale size={16} />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-xs font-bold block text-amber-300">
                                Compare Assets ({comparedProperties.length}/4)
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Side-by-side reserve & legal breakdown
                            </span>
                        </div>

                        {/* Property Thumbnails */}
                        <div className="hidden xs:flex items-center gap-1.5 pl-1 sm:pl-2 shrink-0">
                            {comparedProperties.map((p) => {
                                const id = p.sourcePropertyId || p._id;
                                const photo = p.displayImage || (p.photos && p.photos.length > 0 ? p.photos[0] : null);
                                return (
                                    <div
                                        key={id}
                                        className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0 group"
                                    >
                                        {photo ? (
                                            <img
                                                src={photo}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                <Building2 size={14} />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => toggleCompareProperty(p)}
                                            className="absolute inset-0 bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                                            title="Remove"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            onClick={clearCompare}
                            className="rounded-xl px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => setIsCompareModalOpen(true)}
                            className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-3 sm:px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition cursor-pointer"
                        >
                            <span>Compare ({comparedProperties.length})</span>
                            <ArrowRight size={13} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Full Comparison Matrix Modal */}
            {isCompareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
                        onClick={() => setIsCompareModalOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10 animate-scale-up">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white">
                                    <Scale size={18} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Bidwallah Property Comparison Matrix
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Evaluating {comparedProperties.length} bank auction properties
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={clearCompare}
                                    className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setIsCompareModalOpen(false)}
                                    className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Matrix Table */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
                            <div className="min-w-[650px]">
                                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                                    <tbody>
                                        {/* Row: Property Preview & Remove */}
                                        <tr className="border-b border-slate-200">
                                            <td className="p-3 font-bold text-slate-400 uppercase text-[10px] w-40 align-top">
                                                Asset
                                            </td>
                                            {comparedProperties.map((p) => {
                                                const id = p.sourcePropertyId || p._id;
                                                const title = getCleanPropertyTitle(p);
                                                const photo = p.displayImage || (p.photos && p.photos.length > 0 ? p.photos[0] : null);
                                                return (
                                                    <td key={id} className="p-3 w-64 align-top">
                                                        <div className="space-y-2">
                                                            <div className="h-32 rounded-xl overflow-hidden bg-slate-100 relative">
                                                                {photo ? (
                                                                    <img
                                                                        src={photo}
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                                        <Building2 size={24} />
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={() => toggleCompareProperty(p)}
                                                                    className="absolute top-2 right-2 rounded-lg bg-slate-900/80 text-white p-1 hover:bg-rose-600 transition cursor-pointer"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                            <Link
                                                                to={`/properties/${id}`}
                                                                onClick={() => setIsCompareModalOpen(false)}
                                                                className="font-bold text-slate-900 hover:text-amber-700 line-clamp-2 block transition text-xs"
                                                            >
                                                                {title}
                                                            </Link>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Row: Reserve Price */}
                                        <tr className="border-b border-slate-100 bg-amber-50/40">
                                            <td className="p-3 font-bold text-slate-600 text-xs">Reserve Price</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3">
                                                    <span className="text-base font-black text-amber-800">
                                                        {formatINR(p.propertyPrice)}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Rate per sq.ft */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">Est. Rate / sq.ft</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3 font-semibold text-slate-800">
                                                    {calculatePricePerSqFt(p.propertyPrice, p.area) || "—"}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Area */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">Super Area</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3 text-slate-800">
                                                    {p.area ? `${p.area} ${p.unitOfMeasurement || "sq.ft"}` : "—"}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Bank */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">Authorized Bank</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3 font-bold text-slate-900">
                                                    {p.bankName || "—"}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Possession Type */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">Possession Type</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3">
                                                    <span
                                                        className={`rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                                                            p.propertyPossessionType?.toLowerCase().includes("physical")
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-amber-50 text-amber-800 border border-amber-200"
                                                        }`}
                                                    >
                                                        {p.propertyPossessionType || "Symbolic"}
                                                    </span>
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Location */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">City & State</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3 text-slate-700">
                                                    {p.cityName ? `${p.cityName}, ${p.stateName || ""}` : "—"}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Type & Sub Type */}
                                        <tr className="border-b border-slate-100">
                                            <td className="p-3 font-semibold text-slate-500 text-xs">Category</td>
                                            {comparedProperties.map((p) => (
                                                <td key={p.sourcePropertyId || p._id} className="p-3 text-slate-700">
                                                    {p.propertyType} {p.propertySubType ? `(${p.propertySubType})` : ""}
                                                </td>
                                            ))}
                                        </tr>

                                        {/* Row: Action Button */}
                                        <tr>
                                            <td className="p-3 font-bold text-slate-400 text-xs">Action</td>
                                            {comparedProperties.map((p) => {
                                                const id = p.sourcePropertyId || p._id;
                                                return (
                                                    <td key={id} className="p-3">
                                                        <Link
                                                            to={`/properties/${id}`}
                                                            onClick={() => setIsCompareModalOpen(false)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-700 hover:text-white px-4 py-2 text-xs font-bold text-amber-400 border border-slate-900 shadow-xs transition"
                                                        >
                                                            <span>View Details</span>
                                                            <ArrowRight size={13} />
                                                        </Link>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
