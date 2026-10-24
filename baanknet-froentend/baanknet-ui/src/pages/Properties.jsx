import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
    AlertCircle,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    LayoutGrid,
    List,
    Compass,
    SlidersHorizontal,
    Share2,
    Check
} from "lucide-react";

import {
    fetchProperties,
    fetchPropertyStats,
    fetchPropertyFacets
} from "../services/propertyService";
import PropertyFilters from "../components/PropertyFilters";
import PropertyGrid from "../components/PropertyGrid";
import LocalityExplorer from "../components/LocalityExplorer";
import { PropertyGridSkeleton } from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function Properties() {
    const [searchParams, setSearchParams] = useSearchParams();

    // View mode: 'grid' | 'list' | 'spatial'
    const [viewMode, setViewMode] = useState(() => searchParams.get("view") || "grid");

    // Data & loading states
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [shareCopied, setShareCopied] = useState(false);

    // Server-side pagination state
    const [page, setPage] = useState(() => {
        const p = parseInt(searchParams.get("page"), 10);
        return !isNaN(p) && p > 0 ? p : 1;
    });
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Dynamic facets and stats
    const [facets, setFacets] = useState(null);
    const [availableStates, setAvailableStates] = useState(["West Bengal"]);
    const [availableCities, setAvailableCities] = useState(["Kolkata"]);
    const [availableBanks, setAvailableBanks] = useState([]);

    // Filters state synchronized with searchParams
    const [filters, setFilters] = useState(() => ({
        search: searchParams.get("q") || searchParams.get("search") || "",
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        locality: searchParams.get("locality") || "",
        propertyType: searchParams.get("type") || "",
        propertySubType: searchParams.get("subType") || "",
        bank: searchParams.get("bank") || "",
        possession: searchParams.get("possession") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        sortBy: searchParams.get("sort") || "newest"
    }));

    // Property types & subtypes standard catalog
    const types = useMemo(() => ["Residential", "Commercial", "Industrial", "Other"], []);
    const subTypes = useMemo(
        () => ["Flat", "Individual House", "Plot", "Office", "Shops", "Godowns", "Hotel", "Bungalow", "Others"],
        []
    );

    // Load dynamic facets from backend on mount
    useEffect(() => {
        let isMounted = true;
        fetchPropertyFacets()
            .then((res) => {
                if (isMounted && res?.success && res?.data) {
                    setFacets(res.data);
                    if (res.data.banks && res.data.banks.length > 0) {
                        setAvailableBanks(res.data.banks.map((b) => b.name));
                    }
                }
            })
            .catch((err) => {
                console.warn("Failed to load facets:", err.message);
            });

        fetchPropertyStats()
            .then((res) => {
                if (isMounted && res?.success && res?.data) {
                    if (res.data.states && res.data.states.length > 0) {
                        setAvailableStates(res.data.states);
                    }
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, []);

    // Load paginated properties from backend with server-side pagination & filtering
    const loadProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit,
                search: filters.search || undefined,
                state: filters.state || undefined,
                city: filters.city || undefined,
                locality: filters.locality || undefined,
                type: filters.propertyType || undefined,
                subType: filters.propertySubType || undefined,
                bank: filters.bank || undefined,
                possession: filters.possession || undefined,
                minPrice: filters.minPrice || undefined,
                maxPrice: filters.maxPrice || undefined,
                sort: filters.sortBy || "newest"
            };

            const response = await fetchProperties(params);

            if (response && response.success) {
                setProperties(response.data || []);
                const serverTotal = Number(response.pagination?.total) || 0;
                const serverTotalPages = Number(response.pagination?.totalPages) || 1;
                setTotal(serverTotal);
                setTotalPages(serverTotalPages);
            } else {
                setProperties([]);
                setTotal(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error("Failed to fetch properties:", err);
            setError("Unable to load properties. Please verify backend connection and try again.");
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    // Push state changes to URL search params
    const syncUrlParams = (newFilters, newPage, newView) => {
        const params = new URLSearchParams();
        if (newPage && newPage > 1) params.set("page", newPage.toString());
        if (newView && newView !== "grid") params.set("view", newView);

        if (newFilters.search) params.set("q", newFilters.search);
        if (newFilters.state) params.set("state", newFilters.state);
        if (newFilters.city) params.set("city", newFilters.city);
        if (newFilters.locality) params.set("locality", newFilters.locality);
        if (newFilters.propertyType) params.set("type", newFilters.propertyType);
        if (newFilters.propertySubType) params.set("subType", newFilters.propertySubType);
        if (newFilters.bank) params.set("bank", newFilters.bank);
        if (newFilters.possession) params.set("possession", newFilters.possession);
        if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
        if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
        if (newFilters.sortBy && newFilters.sortBy !== "newest") params.set("sort", newFilters.sortBy);

        setSearchParams(params, { replace: true });
    };

    // Handle filter modification (resets to page 1)
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);
        syncUrlParams(newFilters, 1, viewMode);
    };

    // Handle view mode change
    const handleViewChange = (mode) => {
        setViewMode(mode);
        syncUrlParams(filters, page, mode);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
        syncUrlParams(filters, newPage, viewMode);
        window.scrollTo({ top: 140, behavior: "smooth" });
    };

    const handleResetFilters = () => {
        const cleared = {
            search: "",
            state: "",
            city: "",
            locality: "",
            propertyType: "",
            propertySubType: "",
            bank: "",
            possession: "",
            minPrice: "",
            maxPrice: "",
            sortBy: "newest"
        };
        handleFilterChange(cleared);
    };

    const handleShareSearch = () => {
        try {
            navigator.clipboard.writeText(window.location.href);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2500);
        } catch {
            // fallback
        }
    };

    // Range display calculation
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    // Smart windowed page numbers
    const getVisiblePageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        if (page <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (page >= totalPages - 3) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            pages.push(page - 1);
            pages.push(page);
            pages.push(page + 1);
            pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <main className="min-h-screen bg-slate-50 py-6 sm:py-12">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                {/* Header Title & Discovery Summary */}
                <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-xl bg-amber-100/80 px-3 py-1 text-xs font-black text-amber-900 border border-amber-200 mb-2">
                            <span>BidWallah Asset Discovery System</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                            Bank Auction Asset Marketplace
                        </h1>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-2xl">
                            Search and inspect verified SARFAESI bank auction notices across residential apartments, commercial plots, and industrial complexes in Kolkata.
                        </p>
                    </div>

                    {/* Top Action Bar (Share & Quick Summary) */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={handleShareSearch}
                            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:border-amber-300 transition cursor-pointer shadow-2xs"
                            title="Share this search URL"
                        >
                            {shareCopied ? (
                                <>
                                    <Check size={14} className="text-emerald-600" />
                                    <span className="text-emerald-700">Link Copied</span>
                                </>
                            ) : (
                                <>
                                    <Share2 size={14} className="text-slate-400" />
                                    <span>Share Search</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Filter Control Panel */}
                <PropertyFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleResetFilters}
                    facets={facets}
                    states={availableStates}
                    cities={availableCities}
                    types={types}
                    subTypes={subTypes}
                    banks={availableBanks}
                    totalCount={total}
                />

                {/* View Mode Toolbar & Count Bar */}
                <div className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <div className="text-xs text-slate-600 font-medium">
                        Showing <strong className="text-slate-950 font-black">{start} – {end}</strong> of{" "}
                        <strong className="text-slate-950 font-black">{total.toLocaleString("en-IN")}</strong> auction notices
                        {filters.locality && (
                            <span className="ml-1 text-amber-700 font-bold">in {filters.locality}</span>
                        )}
                        {filters.bank && (
                            <span className="ml-1 text-amber-700 font-bold">by {filters.bank}</span>
                        )}
                    </div>

                    {/* Segmented View Mode Toggle */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => handleViewChange("grid")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                viewMode === "grid"
                                    ? "bg-white text-slate-950 shadow-xs font-black"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <LayoutGrid size={14} />
                            <span>Grid</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleViewChange("list")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                viewMode === "list"
                                    ? "bg-white text-slate-950 shadow-xs font-black"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <List size={14} />
                            <span>List</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleViewChange("spatial")}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                viewMode === "spatial"
                                    ? "bg-white text-slate-950 shadow-xs font-black"
                                    : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            <Compass size={14} />
                            <span>Hubs & Map</span>
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && !loading && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto my-8">
                        <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
                        <h3 className="text-base font-bold text-red-800">Unable to load properties</h3>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                        <button
                            onClick={loadProperties}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>Retry Connection</span>
                        </button>
                    </div>
                )}

                {/* Loading Skeletons */}
                {loading && <PropertyGridSkeleton count={viewMode === "list" ? 6 : 9} />}

                {/* Spatial / Hub Explorer View */}
                {!loading && !error && viewMode === "spatial" && (
                    <div className="space-y-8">
                        <LocalityExplorer
                            facets={facets}
                            activeLocality={filters.locality}
                            activeBank={filters.bank}
                            onSelectLocality={(loc) => {
                                handleFilterChange({ ...filters, locality: loc });
                                setViewMode("grid");
                            }}
                            onSelectBank={(bankName) => {
                                handleFilterChange({ ...filters, bank: bankName });
                                setViewMode("grid");
                            }}
                        />

                        {properties.length > 0 && (
                            <div>
                                <h3 className="text-base font-bold text-slate-900 mb-4">
                                    Current Matching Properties ({total.toLocaleString("en-IN")})
                                </h3>
                                <PropertyGrid properties={properties} viewMode="grid" />
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && viewMode !== "spatial" && properties.length === 0 && (
                    <EmptyState
                        title="No matching property notices found."
                        description="Try widening your search terms, changing the budget slider, or selecting 'All Categories'."
                        onClearFilters={handleResetFilters}
                    />
                )}

                {/* Grid & List View Layouts */}
                {!loading && !error && viewMode !== "spatial" && properties.length > 0 && (
                    <>
                        <PropertyGrid properties={properties} viewMode={viewMode} />

                        {/* Server-Side Pagination Bar */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
                                <span className="text-xs text-slate-500 font-medium">
                                    Showing{" "}
                                    <strong className="text-slate-900 font-bold">{start} – {end}</strong> of{" "}
                                    <strong className="text-slate-900 font-bold">{total.toLocaleString("en-IN")}</strong> properties
                                </span>

                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {/* First Page button */}
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={page === 1 || loading}
                                        title="First Page"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronsLeft size={16} />
                                    </button>

                                    {/* Previous Page button */}
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1 || loading}
                                        title="Previous Page"
                                        className="flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 sm:px-3 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                        <span className="hidden xs:inline">Prev</span>
                                    </button>

                                    {/* Visible Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {getVisiblePageNumbers().map((p, idx) => {
                                            if (p === "...") {
                                                return (
                                                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            const isActive = p === page;
                                            return (
                                                <button
                                                    key={`page-${p}`}
                                                    onClick={() => handlePageChange(p)}
                                                    disabled={loading}
                                                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition cursor-pointer ${
                                                        isActive
                                                            ? "bg-slate-950 text-amber-400 font-black shadow-sm"
                                                            : "border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next Page button */}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages || loading}
                                        title="Next Page"
                                        className="flex h-9 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 sm:px-3 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <span className="hidden xs:inline">Next</span>
                                        <ChevronRight size={16} />
                                    </button>

                                    {/* Last Page button */}
                                    <button
                                        onClick={() => handlePageChange(totalPages)}
                                        disabled={page === totalPages || loading}
                                        title="Last Page"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronsRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
