import React from "react";
import {
    Search,
    ChevronDown,
    RotateCcw,
    SlidersHorizontal,
    ArrowUpDown,
    IndianRupee,
    X
} from "lucide-react";
import { formatINR } from "../utils/formatters";

export default function PropertyFilters({
    filters = {},
    onChange,
    onReset,
    states = [],
    cities = [],
    types = [],
    subTypes = [],
    banks = [],
    totalCount = 0
}) {
    const handleFieldChange = (field, value) => {
        if (onChange) {
            onChange({
                ...filters,
                [field]: value
            });
        }
    };

    const pricePresets = [
        { label: "Under ₹25 Lakhs", min: "", max: "2500000" },
        { label: "₹25L - ₹50L", min: "2500000", max: "5000000" },
        { label: "₹50L - ₹1 Crore", min: "5000000", max: "10000000" },
        { label: "Above ₹1 Crore", min: "10000000", max: "" }
    ];

    const applyPricePreset = (preset) => {
        if (filters.minPrice === preset.min && filters.maxPrice === preset.max) {
            // Uncheck if already selected
            onChange({
                ...filters,
                minPrice: "",
                maxPrice: ""
            });
        } else {
            onChange({
                ...filters,
                minPrice: preset.min,
                maxPrice: preset.max
            });
        }
    };

    const hasActiveFilters = Boolean(
        filters.search ||
        filters.state ||
        filters.city ||
        filters.propertyType ||
        filters.propertySubType ||
        filters.bank ||
        filters.minPrice ||
        filters.maxPrice ||
        (filters.sortBy && filters.sortBy !== "newest")
    );

    return (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs mb-8">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                        <SlidersHorizontal size={15} />
                    </div>
                    <span>Filter & Discover Assets</span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-800 font-bold border border-amber-200">
                        {totalCount.toLocaleString("en-IN")} {totalCount === 1 ? "listing" : "listings"}
                    </span>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer"
                    >
                        <RotateCcw size={13} />
                        <span>Reset All Filters</span>
                    </button>
                )}
            </div>

            {/* Quick Price Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                    <IndianRupee size={12} className="text-amber-600" />
                    Budget:
                </span>
                {pricePresets.map((preset, idx) => {
                    const isSelected = filters.minPrice === preset.min && filters.maxPrice === preset.max;
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => applyPricePreset(preset)}
                            className={`rounded-xl px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                    ? "bg-slate-950 text-amber-400 font-black border border-amber-500/40 shadow-xs"
                                    : "bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700"
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Filter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {/* Search Keyword */}
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Search Keyword / Asset ID
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                        <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                        <input
                            type="text"
                            value={filters.search || ""}
                            onChange={(e) => handleFieldChange("search", e.target.value)}
                            placeholder="Title, Property ID, Bank, City, Pincode..."
                            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none truncate"
                        />
                        {filters.search && (
                            <button
                                type="button"
                                onClick={() => handleFieldChange("search", "")}
                                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* State */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        State
                    </label>
                    <div className="relative">
                        <select
                            value={filters.state || ""}
                            onChange={(e) => handleFieldChange("state", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="">All States</option>
                            {states.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {/* City */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        City
                    </label>
                    <div className="relative">
                        <select
                            value={filters.city || ""}
                            onChange={(e) => handleFieldChange("city", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="">All Cities</option>
                            {cities.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Property Type
                    </label>
                    <div className="relative">
                        <select
                            value={filters.propertyType || ""}
                            onChange={(e) => handleFieldChange("propertyType", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="">All Types</option>
                            {types.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {/* Property Sub Type */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Sub Type
                    </label>
                    <div className="relative">
                        <select
                            value={filters.propertySubType || ""}
                            onChange={(e) => handleFieldChange("propertySubType", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="">All Sub Types</option>
                            {subTypes.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {/* Bank */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Authorized Bank
                    </label>
                    <div className="relative">
                        <select
                            value={filters.bank || ""}
                            onChange={(e) => handleFieldChange("bank", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="">All Banks</option>
                            {banks.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {/* Sort By */}
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Sort By
                    </label>
                    <div className="relative">
                        <select
                            value={filters.sortBy || "newest"}
                            onChange={(e) => handleFieldChange("sortBy", e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                        >
                            <option value="newest">Most Recent Listings</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                        <ArrowUpDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Active Filters Tag Pills */}
            {hasActiveFilters && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active Filters:
                    </span>

                    {filters.search && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            Search: "{filters.search}"
                            <button onClick={() => handleFieldChange("search", "")} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.state && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            State: {filters.state}
                            <button onClick={() => handleFieldChange("state", "")} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.city && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            City: {filters.city}
                            <button onClick={() => handleFieldChange("city", "")} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.propertyType && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            Type: {filters.propertyType}
                            <button onClick={() => handleFieldChange("propertyType", "")} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.bank && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            Bank: {filters.bank}
                            <button onClick={() => handleFieldChange("bank", "")} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {(filters.minPrice || filters.maxPrice) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-semibold border border-amber-200">
                            Price: {filters.minPrice ? formatINR(filters.minPrice) : "₹0"} - {filters.maxPrice ? formatINR(filters.maxPrice) : "Max"}
                            <button onClick={() => { handleFieldChange("minPrice", ""); handleFieldChange("maxPrice", ""); }} className="hover:text-amber-950 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
