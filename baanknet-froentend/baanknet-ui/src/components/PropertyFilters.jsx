import React, { useState } from "react";
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
    facets = null,
    subTypes = [],
    banks = [],
    localities = [],
    totalCount = 0
}) {
    const [showAdvanced, setShowAdvanced] = useState(
        Boolean(filters.bank || filters.locality || filters.possession || filters.propertySubType)
    );

    const handleFieldChange = (field, value) => {
        if (onChange) {
            onChange({
                ...filters,
                [field]: value
            });
        }
    };

    const quickCategories = [
        { label: "All Types", type: "", subType: "" },
        { label: "Residential", type: "Residential", subType: "" },
        { label: "Flats / Apts", type: "", subType: "Flat" },
        { label: "Houses / Villas", type: "", subType: "Individual House" },
        { label: "Plots / Land", type: "", subType: "Plot" },
        { label: "Commercial / Office", type: "Commercial", subType: "" }
    ];

    const applyCategoryChip = (chip) => {
        if (!onChange) return;
        onChange({
            ...filters,
            propertyType: chip.type,
            propertySubType: chip.subType
        });
    };

    const pricePresets = [
        { label: "All Budgets", min: "", max: "" },
        { label: "Under ₹25 Lakhs", min: "", max: "2500000" },
        { label: "₹25L – ₹50L", min: "2500000", max: "5000000" },
        { label: "₹50L – ₹1 Crore", min: "5000000", max: "10000000" },
        { label: "Above ₹1 Crore", min: "10000000", max: "" }
    ];

    const applyPricePreset = (preset) => {
        if (!onChange) return;
        onChange({
            ...filters,
            minPrice: preset.min,
            maxPrice: preset.max
        });
    };

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

    const advancedFilterCount = [
        filters.bank,
        filters.locality,
        filters.possession,
        filters.propertySubType && !["Flat", "Individual House", "Plot"].includes(filters.propertySubType)
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    const facetSubTypes = facets?.propertySubTypes || [];
    const facetBanks = facets?.banks || [];
    const facetLocalities = facets?.localities || [];
    const facetPossession = facets?.possessionTypes || [];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs mb-6 space-y-4">
            {/* Row 1: Main Search Bar + Sort + More Filters Toggle */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Search Input */}
                <div className="relative flex flex-1 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                    <Search size={17} className="text-slate-400 mr-2.5 shrink-0" />
                    <input
                        type="text"
                        value={filters.search || ""}
                        onChange={(e) => handleFieldChange("search", e.target.value)}
                        placeholder="Search by city, area, bank name, or property type..."
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none"
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => handleFieldChange("search", "")}
                            className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1.5 cursor-pointer"
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Right Controls: Sort + More Filters + Reset */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Sort Order */}
                    <div className="relative flex-1 sm:flex-none">
                        <select
                            value={filters.sortBy || "newest"}
                            onChange={(e) => handleFieldChange("sortBy", e.target.value)}
                            aria-label="Sort properties"
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                        >
                            <option value="newest">Sort: Newest First</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="area_desc">Largest Area First</option>
                        </select>
                        <ArrowUpDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {/* More Filters Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                            showAdvanced || advancedFilterCount > 0
                                ? "border-slate-950 bg-slate-950 text-amber-400"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                    >
                        <SlidersHorizontal size={14} />
                        <span>More Filters</span>
                        {advancedFilterCount > 0 && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-slate-950">
                                {advancedFilterCount}
                            </span>
                        )}
                        <ChevronDown size={13} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                    </button>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        >
                            <RotateCcw size={13} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Row 2: Simple 1-Click Property Type Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Type:</span>
                    {quickCategories.map((chip) => {
                        const isActive =
                            (filters.propertyType || "") === chip.type &&
                            (filters.propertySubType || "") === chip.subType;
                        return (
                            <button
                                key={chip.label}
                                type="button"
                                onClick={() => applyCategoryChip(chip)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                    isActive
                                        ? "bg-slate-950 text-amber-400 shadow-xs"
                                        : "bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-900"
                                }`}
                            >
                                {chip.label}
                            </button>
                        );
                    })}
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-900 border border-amber-200">
                    {totalCount.toLocaleString("en-IN")} Properties Found
                </span>
            </div>

            {/* Row 3: Simple 1-Click Budget Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 mr-1 inline-flex items-center gap-0.5">
                    <IndianRupee size={12} className="text-amber-600" />
                    <span>Budget:</span>
                </span>
                {pricePresets.map((preset) => {
                    const isSelected =
                        (filters.minPrice || "") === preset.min &&
                        (filters.maxPrice || "") === preset.max;
                    return (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => applyPricePreset(preset)}
                            className={`rounded-xl px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                                isSelected
                                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800"
                            }`}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Collapsible Advanced Filters Drawer (Bank, Locality, Category, Custom Price) */}
            {showAdvanced && (
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in">
                    {/* Bank Institution */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Bank Name
                        </label>
                        <div className="relative">
                            <select
                                value={filters.bank || ""}
                                onChange={(e) => handleFieldChange("bank", e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                            >
                                <option value="">All Banks</option>
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
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Locality */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Locality / Area
                        </label>
                        <div className="relative">
                            <select
                                value={filters.locality || ""}
                                onChange={(e) => handleFieldChange("locality", e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                            >
                                <option value="">All Localities</option>
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
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Specific Subtype */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Property Sub-Category
                        </label>
                        <div className="relative">
                            <select
                                value={filters.propertySubType || ""}
                                onChange={(e) => handleFieldChange("propertySubType", e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                            >
                                <option value="">All Sub-Categories</option>
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
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Possession Status */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Possession Type
                        </label>
                        <div className="relative">
                            <select
                                value={filters.possession || ""}
                                onChange={(e) => handleFieldChange("possession", e.target.value)}
                                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                            >
                                <option value="">Any Possession</option>
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
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filter Pills Summary */}
            {hasActiveFilters && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active:
                    </span>

                    {filters.search && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>"{filters.search}"</span>
                            <button onClick={() => handleFieldChange("search", "")} className="hover:text-rose-600 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.propertyType && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>{filters.propertyType}</span>
                            <button onClick={() => handleFieldChange("propertyType", "")} className="hover:text-rose-600 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.propertySubType && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>{filters.propertySubType}</span>
                            <button onClick={() => handleFieldChange("propertySubType", "")} className="hover:text-rose-600 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.bank && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>{filters.bank}</span>
                            <button onClick={() => handleFieldChange("bank", "")} className="hover:text-rose-600 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {filters.locality && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>{filters.locality}</span>
                            <button onClick={() => handleFieldChange("locality", "")} className="hover:text-rose-600 cursor-pointer">
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    {(filters.minPrice || filters.maxPrice) && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-900 px-2.5 py-1 text-xs font-bold border border-amber-200">
                            <span>
                                {filters.minPrice ? formatINR(Number(filters.minPrice)) : "₹0"} –{" "}
                                {filters.maxPrice ? formatINR(Number(filters.maxPrice)) : "Any"}
                            </span>
                            <button
                                onClick={() => onChange({ ...filters, minPrice: "", maxPrice: "" })}
                                className="hover:text-rose-600 cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
