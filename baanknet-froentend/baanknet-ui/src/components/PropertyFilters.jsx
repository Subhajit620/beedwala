import React, { useState } from "react";
import {
    Search,
    ChevronDown,
    RotateCcw,
    SlidersHorizontal,
    ArrowUpDown,
    IndianRupee,
    X,
    MapPin,
    ShieldCheck,
    Building2,
    Landmark
} from "lucide-react";
import { formatINR } from "../utils/formatters";

export default function PropertyFilters({
    filters = {},
    onChange,
    onReset,
    facets = null,
    states = [],
    cities = [],
    types = [],
    subTypes = [],
    banks = [],
    localities = [],
    totalCount = 0
}) {
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [customPriceOpen, setCustomPriceOpen] = useState(Boolean(filters.minPrice || filters.maxPrice));

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
        { label: "₹25L – ₹50L", min: "2500000", max: "5000000" },
        { label: "₹50L – ₹1 Crore", min: "5000000", max: "10000000" },
        { label: "Above ₹1 Crore", min: "10000000", max: "" }
    ];

    const applyPricePreset = (preset) => {
        if (filters.minPrice === preset.min && filters.maxPrice === preset.max) {
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

    // Calculate active filters count
    const activeFilterCount = [
        filters.search,
        filters.state,
        filters.city,
        filters.locality,
        filters.propertyType,
        filters.propertySubType,
        filters.bank,
        filters.possession,
        filters.minPrice || filters.maxPrice,
        filters.sortBy && filters.sortBy !== "newest"
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    // Extract facets if available
    const facetTypes = facets?.propertyTypes || [];
    const facetSubTypes = facets?.propertySubTypes || [];
    const facetBanks = facets?.banks || [];
    const facetLocalities = facets?.localities || [];
    const facetPossession = facets?.possessionTypes || [];

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs mb-6 sm:mb-8 transition-all">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-2 pb-3 sm:pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
                        <SlidersHorizontal size={14} />
                    </div>
                    <span className="truncate">Discovery Filters</span>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] sm:text-xs text-amber-800 font-black border border-amber-200">
                        {totalCount.toLocaleString("en-IN")} <span className="hidden xs:inline">{totalCount === 1 ? "listing" : "notices"}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-600 hover:text-rose-700 transition cursor-pointer px-2.5 py-1 rounded-lg hover:bg-rose-50"
                        >
                            <RotateCcw size={12} />
                            <span>Reset All</span>
                        </button>
                    )}

                    {/* Mobile Expand / Collapse Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileExpanded(!isMobileExpanded)}
                        className={`sm:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                            isMobileExpanded
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-500 font-black shadow-xs"
                        }`}
                        aria-expanded={isMobileExpanded}
                    >
                        <span>{isMobileExpanded ? "Close" : "Filter Options"}</span>
                        {activeFilterCount > 0 && !isMobileExpanded && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-amber-400 text-[10px] font-black">
                                {activeFilterCount}
                            </span>
                        )}
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isMobileExpanded ? "rotate-180" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Collapsible Section on Mobile, Always Visible on sm+ */}
            <div className={`${isMobileExpanded ? "block pt-3" : "hidden sm:block sm:pt-4"}`}>
                {/* Budget Quick Presets */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-1.5">
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

                    <button
                        type="button"
                        onClick={() => setCustomPriceOpen(!customPriceOpen)}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline underline-offset-2 cursor-pointer"
                    >
                        {customPriceOpen ? "Hide Custom Range" : "Custom Price Range"}
                    </button>
                </div>

                {/* Custom Dual Price Slider / Inputs */}
                {customPriceOpen && (
                    <div className="mb-4 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Min Reserve Price (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="100000"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => handleFieldChange("minPrice", e.target.value)}
                                    placeholder="e.g. 1500000"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                                />
                            </div>
                            {filters.minPrice && (
                                <span className="text-[10px] font-bold text-amber-800 mt-1 block">
                                    {formatINR(Number(filters.minPrice))}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                                Max Reserve Price (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="100000"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => handleFieldChange("maxPrice", e.target.value)}
                                    placeholder="e.g. 7500000"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-7 pr-3 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                                />
                            </div>
                            {filters.maxPrice && (
                                <span className="text-[10px] font-bold text-amber-800 mt-1 block">
                                    {formatINR(Number(filters.maxPrice))}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Filter Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {/* Search Keyword */}
                    <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Search Keyword / Notice ID / Borrower
                        </label>
                        <div className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                            <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                value={filters.search || ""}
                                onChange={(e) => handleFieldChange("search", e.target.value)}
                                placeholder="Title, Property ID, Bank, Locality..."
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

                    {/* Property Type */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Property Sector
                        </label>
                        <div className="relative">
                            <select
                                value={filters.propertyType || ""}
                                onChange={(e) => handleFieldChange("propertyType", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="">All Sectors</option>
                                {facetTypes.length > 0
                                    ? facetTypes.map((t) => (
                                          <option key={t.name} value={t.name}>
                                              {t.name} ({t.count})
                                          </option>
                                      ))
                                    : types.map((t) => (
                                          <option key={t} value={t}>
                                              {t}
                                          </option>
                                      ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Sub Type */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Category / Subtype
                        </label>
                        <div className="relative">
                            <select
                                value={filters.propertySubType || ""}
                                onChange={(e) => handleFieldChange("propertySubType", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="">All Categories</option>
                                {facetSubTypes.length > 0
                                    ? facetSubTypes.map((st) => (
                                          <option key={st.name} value={st.name}>
                                              {st.name} ({st.count})
                                          </option>
                                      ))
                                    : subTypes.map((st) => (
                                          <option key={st} value={st}>
                                              {st}
                                          </option>
                                      ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Bank Institution */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Lending Institution / Bank
                        </label>
                        <div className="relative">
                            <select
                                value={filters.bank || ""}
                                onChange={(e) => handleFieldChange("bank", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="">All 13 Partner Banks</option>
                                {facetBanks.length > 0
                                    ? facetBanks.map((b) => (
                                          <option key={b.name} value={b.name}>
                                              {b.name} ({b.count})
                                          </option>
                                      ))
                                    : banks.map((b) => (
                                          <option key={b} value={b}>
                                              {b}
                                          </option>
                                      ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Locality */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Locality / Neighborhood
                        </label>
                        <div className="relative">
                            <select
                                value={filters.locality || ""}
                                onChange={(e) => handleFieldChange("locality", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="">All Localities (Kolkata)</option>
                                {facetLocalities.length > 0
                                    ? facetLocalities.map((loc) => (
                                          <option key={loc.name} value={loc.name}>
                                              {loc.name} ({loc.count})
                                          </option>
                                      ))
                                    : localities.map((l) => (
                                          <option key={l} value={l}>
                                              {l}
                                          </option>
                                      ))}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Possession Type */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Possession Status
                        </label>
                        <div className="relative">
                            <select
                                value={filters.possession || ""}
                                onChange={(e) => handleFieldChange("possession", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="">All Possession Types</option>
                                {facetPossession.length > 0
                                    ? facetPossession.map((p) => (
                                          <option key={p.name} value={p.name}>
                                              {p.name} ({p.count})
                                          </option>
                                      ))
                                    : [
                                          <option key="physical" value="Physical">
                                              Physical Possession
                                          </option>,
                                          <option key="symbolic" value="Symbolic">
                                              Symbolic Possession
                                          </option>
                                      ]}
                            </select>
                            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Sort Order
                        </label>
                        <div className="relative">
                            <select
                                value={filters.sortBy || "newest"}
                                onChange={(e) => handleFieldChange("sortBy", e.target.value)}
                                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition cursor-pointer"
                            >
                                <option value="newest">Most Recent Notices</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="area_desc">Largest Area First</option>
                                <option value="oldest">Earliest Notices</option>
                            </select>
                            <ArrowUpDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Active Filters Tag Pills */}
                {hasActiveFilters && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Active Filters:
                        </span>

                        {filters.search && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Search: "{filters.search}"</span>
                                <button
                                    onClick={() => handleFieldChange("search", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                    title="Remove filter"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {filters.propertyType && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Sector: {filters.propertyType}</span>
                                <button
                                    onClick={() => handleFieldChange("propertyType", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {filters.propertySubType && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Category: {filters.propertySubType}</span>
                                <button
                                    onClick={() => handleFieldChange("propertySubType", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {filters.bank && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Bank: {filters.bank}</span>
                                <button
                                    onClick={() => handleFieldChange("bank", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {filters.locality && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Locality: {filters.locality}</span>
                                <button
                                    onClick={() => handleFieldChange("locality", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {filters.possession && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>Possession: {filters.possession}</span>
                                <button
                                    onClick={() => handleFieldChange("possession", "")}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {(filters.minPrice || filters.maxPrice) && (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-900 px-3 py-1 text-xs font-bold border border-amber-200/80 shadow-2xs">
                                <span>
                                    Price: {filters.minPrice ? formatINR(Number(filters.minPrice)) : "₹0"} –{" "}
                                    {filters.maxPrice ? formatINR(Number(filters.maxPrice)) : "Any"}
                                </span>
                                <button
                                    onClick={() => {
                                        handleFieldChange("minPrice", "");
                                        handleFieldChange("maxPrice", "");
                                    }}
                                    className="hover:text-rose-600 transition cursor-pointer p-0.5 rounded-full hover:bg-amber-100"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={onReset}
                            className="text-xs font-extrabold text-rose-600 hover:text-rose-700 underline underline-offset-2 ml-1 cursor-pointer"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
