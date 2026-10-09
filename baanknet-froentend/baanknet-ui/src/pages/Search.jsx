import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, AlertCircle, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { fetchProperties, fetchPropertyStats } from "../services/propertyService";
import PropertyFilters from "../components/PropertyFilters";
import PropertyGrid from "../components/PropertyGrid";
import { PropertyGridSkeleton } from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Server-side pagination state
    const [page, setPage] = useState(() => {
        const p = parseInt(searchParams.get("page"), 10);
        return !isNaN(p) && p > 0 ? p : 1;
    });
    const [limit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Dynamic filter options
    const [availableStates, setAvailableStates] = useState(["West Bengal"]);
    const [availableCities, setAvailableCities] = useState(["Kolkata"]);
    const [availableBanks, setAvailableBanks] = useState([]);

    const queryParam = searchParams.get("q") || searchParams.get("search") || "";

    const [filters, setFilters] = useState(() => ({
        search: queryParam,
        state: searchParams.get("state") || "",
        city: searchParams.get("city") || "",
        propertyType: searchParams.get("type") || "",
        propertySubType: searchParams.get("subType") || "",
        bank: searchParams.get("bank") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        sortBy: searchParams.get("sort") || "newest"
    }));

    const types = useMemo(() => ["Residential", "Commercial", "Industrial", "Agricultural", "Others"], []);
    const subTypes = useMemo(() => ["Flat", "Land", "Plot", "Building", "Shop", "Office", "House", "Factory", "Godown"], []);

    // Load filter options
    useEffect(() => {
        let isMounted = true;
        fetchPropertyStats()
            .then((res) => {
                if (isMounted && res?.success && res?.data) {
                    if (res.data.states && res.data.states.length > 0) {
                        setAvailableStates(res.data.states);
                    }
                    if (res.data.banks && res.data.banks.length > 0) {
                        setAvailableBanks(res.data.banks);
                    }
                }
            })
            .catch((err) => {
                console.warn("Failed to load search filter options:", err.message);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Sync queryParam if URL changes from outside
    useEffect(() => {
        const q = searchParams.get("q") || searchParams.get("search") || "";
        setFilters((prev) => ({ ...prev, search: q }));
    }, [searchParams]);

    // Load paginated properties from backend
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
                type: filters.propertyType || undefined,
                subType: filters.propertySubType || undefined,
                bank: filters.bank || undefined,
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
            console.error("Failed to load search results:", err);
            setError("Unable to load search results. Please try again later.");
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filters]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPage(1);

        const params = new URLSearchParams();
        params.set("page", "1");
        if (newFilters.search) params.set("q", newFilters.search);
        if (newFilters.state) params.set("state", newFilters.state);
        if (newFilters.city) params.set("city", newFilters.city);
        if (newFilters.propertyType) params.set("type", newFilters.propertyType);
        if (newFilters.propertySubType) params.set("subType", newFilters.propertySubType);
        if (newFilters.bank) params.set("bank", newFilters.bank);
        if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
        if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
        if (newFilters.sortBy && newFilters.sortBy !== "newest") params.set("sort", newFilters.sortBy);

        setSearchParams(params, { replace: true });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);

        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        setSearchParams(params, { replace: true });

        window.scrollTo({ top: 120, behavior: "smooth" });
    };

    const handleResetFilters = () => {
        handleFilterChange({
            search: "",
            state: "",
            city: "",
            propertyType: "",
            propertySubType: "",
            bank: "",
            minPrice: "",
            maxPrice: "",
            sortBy: "newest"
        });
    };

    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

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
        <main className="min-h-screen bg-slate-50 py-10 sm:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Search Header Banner */}
                <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
                        <SearchIcon size={16} />
                        <span>Search Results</span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {filters.search ? (
                            <>
                                Results for <span className="text-amber-600">"{filters.search}"</span>
                            </>
                        ) : (
                            "All Bidwallah Property Search"
                        )}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Found <strong className="text-slate-900">{total.toLocaleString("en-IN")}</strong> matching properties
                    </p>
                </div>

                {/* Filter Bar */}
                <PropertyFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleResetFilters}
                    states={availableStates}
                    cities={availableCities}
                    types={types}
                    subTypes={subTypes}
                    banks={availableBanks}
                    totalCount={total}
                />

                {/* Error */}
                {error && !loading && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto my-8">
                        <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
                        <h3 className="text-base font-bold text-red-800">Unable to load properties</h3>
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                        <button
                            onClick={loadProperties}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>Retry</span>
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && <PropertyGridSkeleton count={6} />}

                {/* Empty */}
                {!loading && !error && properties.length === 0 && (
                    <EmptyState
                        title="No properties found."
                        description="Try modifying your search query or removing some filters."
                        onClearFilters={handleResetFilters}
                    />
                )}

                {/* Results Grid & Server-Side Pagination */}
                {!loading && !error && properties.length > 0 && (
                    <>
                        <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>
                                Showing <strong className="text-slate-900 font-bold">{start} – {end}</strong> of{" "}
                                <strong className="text-slate-900 font-bold">{total.toLocaleString("en-IN")}</strong> properties
                            </span>
                            <span className="hidden sm:inline-block text-slate-400">
                                Page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong>
                            </span>
                        </div>

                        <PropertyGrid properties={properties} columns={3} />

                        {totalPages > 1 && (
                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6">
                                <span className="text-xs text-slate-500 font-medium">
                                    Showing{" "}
                                    <strong className="text-slate-900 font-bold">{start} – {end}</strong> of{" "}
                                    <strong className="text-slate-900 font-bold">{total.toLocaleString("en-IN")}</strong> properties
                                </span>

                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                    {/* First Page */}
                                    <button
                                        onClick={() => handlePageChange(1)}
                                        disabled={page === 1 || loading}
                                        title="First Page"
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronsLeft size={16} />
                                    </button>

                                    {/* Previous */}
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1 || loading}
                                        className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Previous</span>
                                    </button>

                                    {/* Numbers */}
                                    <div className="flex items-center gap-1">
                                        {getVisiblePageNumbers().map((item, idx) => {
                                            if (item === "...") {
                                                return (
                                                    <span
                                                        key={`search-ellipsis-${idx}`}
                                                        className="flex h-9 w-7 items-center justify-center text-xs font-bold text-slate-400"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const pageNum = Number(item);
                                            const isActive = page === pageNum;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={loading}
                                                    className={`flex h-9 min-w-[36px] px-2.5 items-center justify-center rounded-xl text-xs font-bold transition cursor-pointer ${
                                                        isActive
                                                            ? "bg-slate-950 text-amber-400 font-black border border-amber-500/40 shadow-xs"
                                                            : "border border-slate-200 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-200"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Next */}
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages || loading}
                                        className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <span>Next</span>
                                        <ChevronRight size={16} />
                                    </button>

                                    {/* Last */}
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
