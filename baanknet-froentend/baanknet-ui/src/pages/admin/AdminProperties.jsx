import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Download,
    Layers,
    ChevronLeft,
    ChevronRight,
    Building2,
    AlertCircle,
    CheckCircle2,
    X,
    Filter,
    Table as TableIcon,
    LayoutGrid,
    Landmark,
    MapPin,
    Calendar,
    ExternalLink,
    Sparkles
} from "lucide-react";
import {
    fetchAdminProperties,
    togglePropertyStatus,
    deleteProperty,
    bulkPropertyAction,
    exportPropertiesData
} from "../../services/adminService";
import { fetchPropertyStats } from "../../services/propertyService";
import { formatINR, getCleanPropertyTitle } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";

export default function AdminProperties() {
    const { addToast } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    // Data & state
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // View Mode: 'table' or 'grid'
    const [viewMode, setViewMode] = useState("table");

    // Pagination
    const [page, setPage] = useState(() => parseInt(searchParams.get("page"), 10) || 1);
    const [limit] = useState(24);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [search, setSearch] = useState(() => searchParams.get("search") || "");
    const [bank, setBank] = useState(() => searchParams.get("bank") || "");
    const [propertyType, setPropertyType] = useState(() => searchParams.get("type") || "");
    const [status, setStatus] = useState(() => searchParams.get("status") || "all");
    const [sort, setSort] = useState(() => searchParams.get("sort") || "newest");

    // Dynamic bank and type lists
    const [availableBanks, setAvailableBanks] = useState([]);

    // Selection & Bulk Actions
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Modals
    const [previewProperty, setPreviewProperty] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Load filter options
    useEffect(() => {
        fetchPropertyStats()
            .then((res) => {
                if (res?.success && res?.data?.banks) {
                    setAvailableBanks(res.data.banks);
                }
            })
            .catch(() => {});
    }, []);

    const loadProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit,
                search: search || undefined,
                bank: bank || undefined,
                type: propertyType || undefined,
                status: status !== "all" ? status : undefined,
                sort
            };

            const res = await fetchAdminProperties(params);
            if (res.success) {
                setProperties(res.data || []);
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            } else {
                setProperties([]);
            }
        } catch (err) {
            console.error("Failed to load admin properties:", err);
            setError("Failed to load properties list.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, bank, propertyType, status, sort]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    // Update URL query params
    const updateQueryParams = (newParams) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([k, v]) => {
            if (v && v !== "all" && v !== "newest") {
                next.set(k, v);
            } else {
                next.delete(k);
            }
        });
        setSearchParams(next, { replace: true });
    };

    const handleFilterApply = (e) => {
        if (e) e.preventDefault();
        setPage(1);
        setSelectedIds([]);
        updateQueryParams({ page: "1", search, bank, type: propertyType, status, sort });
    };

    const handleResetFilters = () => {
        setSearch("");
        setBank("");
        setPropertyType("");
        setStatus("all");
        setSort("newest");
        setPage(1);
        setSelectedIds([]);
        setSearchParams({}, { replace: true });
    };

    // Quick Preset Filter Handlers
    const applyQuickPreset = (preset) => {
        setPage(1);
        setSelectedIds([]);
        if (preset === "all") {
            handleResetFilters();
        } else if (preset === "active") {
            setStatus("active");
            updateQueryParams({ status: "active", page: "1" });
        } else if (preset === "sbi") {
            setBank("State Bank of India");
            updateQueryParams({ bank: "State Bank of India", page: "1" });
        } else if (preset === "pnb") {
            setBank("Punjab National Bank");
            updateQueryParams({ bank: "Punjab National Bank", page: "1" });
        } else if (preset === "residential") {
            setPropertyType("Residential");
            updateQueryParams({ type: "Residential", page: "1" });
        } else if (preset === "commercial") {
            setPropertyType("Commercial");
            updateQueryParams({ type: "Commercial", page: "1" });
        }
    };

    // Toggle Active Status
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const nextStatus = !currentStatus;
            const res = await togglePropertyStatus(id, nextStatus);
            if (res.success) {
                setProperties((prev) =>
                    prev.map((p) => {
                        const pId = p.sourcePropertyId || p._id;
                        if (pId === id) return { ...p, isActive: nextStatus };
                        return p;
                    })
                );
                addToast(`Listing status updated to ${nextStatus ? "Active" : "Inactive"}`, "success");
            }
        } catch {
            addToast("Failed to update status", "error");
        }
    };

    // Delete single property
    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        try {
            setDeleting(true);
            const id = deleteCandidate.sourcePropertyId || deleteCandidate._id;
            await deleteProperty(id);
            addToast("Property listing deleted permanently", "success");
            setDeleteCandidate(null);
            loadProperties();
        } catch (err) {
            console.error("Delete error:", err);
            addToast("Failed to delete property", "error");
        } finally {
            setDeleting(false);
        }
    };

    // Bulk selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = properties.map((p) => p.sourcePropertyId || p._id);
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        try {
            setBulkLoading(true);
            const res = await bulkPropertyAction(action, selectedIds);
            if (res.success) {
                addToast(res.message, "success");
                setSelectedIds([]);
                loadProperties();
            }
        } catch (err) {
            console.error("Bulk action failed:", err);
            addToast("Bulk operation failed", "error");
        } finally {
            setBulkLoading(false);
        }
    };

    // Export Handler
    const handleExport = async (format) => {
        try {
            addToast(`Exporting properties data as ${format.toUpperCase()}...`, "info");
            await exportPropertiesData(format);
            addToast(`Data export initiated!`, "success");
        } catch {
            addToast("Export failed", "error");
        }
    };

    // Active filters count
    const hasActiveFilters = Boolean(search || bank || propertyType || (status && status !== "all"));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Building2 className="text-amber-500" size={26} />
                        <span>Property Listings Directory</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Manage, edit, publish, and audit verified bank auction properties across India.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Table vs Grid */}
                    <div className="flex items-center rounded-xl bg-slate-200/80 p-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <TableIcon size={14} />
                            <span>Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <LayoutGrid size={14} />
                            <span>Cards</span>
                        </button>
                    </div>

                    {/* Export Options */}
                    <button
                        onClick={() => handleExport("csv")}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs"
                    >
                        <Download size={14} className="text-slate-500" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    {/* Add New Listing Button */}
                    <Link
                        to="/admin/properties/new"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 transition cursor-pointer active:scale-95 shadow-md"
                    >
                        <Plus size={16} />
                        <span>Add Listing</span>
                    </Link>
                </div>
            </div>

            {/* Quick Preset Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-1">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter size={13} />
                    <span>Quick:</span>
                </span>
                <button
                    onClick={() => applyQuickPreset("all")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        !hasActiveFilters ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    All ({total.toLocaleString("en-IN")})
                </button>
                <button
                    onClick={() => applyQuickPreset("active")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        status === "active" ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    🟢 Active Only
                </button>
                <button
                    onClick={() => applyQuickPreset("sbi")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        bank === "State Bank of India" ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    SBI Notices
                </button>
                <button
                    onClick={() => applyQuickPreset("pnb")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        bank === "Punjab National Bank" ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    PNB Notices
                </button>
                <button
                    onClick={() => applyQuickPreset("residential")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        propertyType === "Residential" ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    Residential
                </button>
                <button
                    onClick={() => applyQuickPreset("commercial")}
                    className={`rounded-xl px-3 py-1 text-xs font-bold transition cursor-pointer ${
                        propertyType === "Commercial" ? "bg-slate-950 text-amber-400 shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                >
                    Commercial
                </button>
            </div>

            {/* Filter & Search Console */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <form onSubmit={handleFilterApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    {/* Keyword Search */}
                    <div className="lg:col-span-2 relative">
                        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, ID, bank, borrower..."
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition"
                        />
                    </div>

                    {/* Bank Selector */}
                    <div>
                        <select
                            value={bank}
                            onChange={(e) => setBank(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                        >
                            <option value="">All Lending Banks</option>
                            {availableBanks.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Property Type */}
                    <div>
                        <select
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                        >
                            <option value="">All Asset Types</option>
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Industrial">Industrial</option>
                            <option value="Agricultural">Agricultural</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="price_asc">Price: Low to High</option>
                        </select>
                    </div>
                </form>

                {/* Filter Actions and Active Tags Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleFilterApply}
                            className="rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold px-4 py-2 transition cursor-pointer active:scale-95"
                        >
                            Apply Filters
                        </button>
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold px-4 py-2 transition cursor-pointer"
                            >
                                Reset All
                            </button>
                        )}
                    </div>

                    <div className="text-slate-500 font-medium">
                        Found <strong className="text-slate-900 font-bold">{total.toLocaleString("en-IN")}</strong> matching properties
                    </div>
                </div>
            </div>

            {/* Bulk Selection Toolbar */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3.5 text-xs text-amber-950 animate-scale-up">
                    <div className="flex items-center gap-2 font-bold">
                        <Layers size={16} className="text-amber-700" />
                        <span>{selectedIds.length} properties selected</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleBulkAction("activate")}
                            disabled={bulkLoading}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            Activate Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction("deactivate")}
                            disabled={bulkLoading}
                            className="rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            Deactivate Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction("delete")}
                            disabled={bulkLoading}
                            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                            Delete Permanently
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-slate-600 hover:text-slate-900 font-bold ml-2"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span>{error}</span>
                </div>
            )}

            {/* Content Display: Loading, Empty, Table or Grid */}
            {loading ? (
                <div className="py-24">
                    <LoadingSpinner text="Fetching properties..." />
                </div>
            ) : properties.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center space-y-3">
                    <Building2 size={40} className="mx-auto text-slate-300" />
                    <h3 className="text-base font-bold text-slate-700">No properties match your filter</h3>
                    <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or resetting filters.
                    </p>
                    <button
                        onClick={handleResetFilters}
                        className="mt-2 rounded-xl bg-slate-950 text-white px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : viewMode === "grid" ? (
                /* GRID / CARD VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {properties.map((prop) => {
                        const id = prop.sourcePropertyId || prop._id;
                        const isSelected = selectedIds.includes(id);

                        return (
                            <div
                                key={id}
                                className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs hover:shadow-md transition ${
                                    isSelected ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20" : "border-slate-200"
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(id)}
                                                className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400 font-mono">
                                                ID: {id}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleToggleStatus(id, prop.isActive)}
                                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase transition cursor-pointer ${
                                                prop.isActive
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                            }`}
                                        >
                                            {prop.isActive ? "● Active" : "○ Inactive"}
                                        </button>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                        {prop.propertyHeading || prop.propertyTitle || "SARFAESI Bank Auction Asset"}
                                    </h3>

                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                        <Landmark size={13} className="text-amber-500 shrink-0" />
                                        <span className="truncate font-semibold">{prop.bankName || "SARFAESI Bank"}</span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin size={13} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{prop.city || "India"}</span>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                                Reserve Price
                                            </span>
                                            <span className="text-base font-black text-emerald-600">
                                                ₹{(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                            {prop.propertyType || "Asset"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => setPreviewProperty(prop)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                                    >
                                        <Eye size={14} />
                                        <span>Preview</span>
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            to={`/admin/properties/edit/${id}`}
                                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition"
                                            title="Edit listing"
                                        >
                                            <Edit size={14} />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteCandidate(prop)}
                                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                            title="Delete listing"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="p-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={
                                                properties.length > 0 &&
                                                selectedIds.length === properties.length
                                            }
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4">Property / Title</th>
                                    <th className="p-4">Bank & Location</th>
                                    <th className="p-4">Asset Type</th>
                                    <th className="p-4">Reserve Price</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {properties.map((prop) => {
                                    const id = prop.sourcePropertyId || prop._id;
                                    const isSelected = selectedIds.includes(id);

                                    return (
                                        <tr
                                            key={id}
                                            className={`hover:bg-slate-50/70 transition ${
                                                isSelected ? "bg-amber-50/30" : ""
                                            }`}
                                        >
                                            {/* Select Checkbox */}
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectRow(id)}
                                                    className="h-4 w-4 rounded accent-amber-500 cursor-pointer"
                                                />
                                            </td>

                                            {/* Title & ID */}
                                            <td className="p-4 max-w-sm">
                                                <div className="font-bold text-slate-900 truncate" title={prop.propertyHeading || prop.propertyTitle}>
                                                    {prop.propertyHeading || prop.propertyTitle || "SARFAESI Auction Notice"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                    ID: {id}
                                                </div>
                                            </td>

                                            {/* Bank & City */}
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-800">{prop.bankName || "SARFAESI Bank"}</div>
                                                <div className="text-[11px] text-slate-500">{prop.city || "India"}</div>
                                            </td>

                                            {/* Asset Type */}
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                                    {prop.propertyType || "Asset"}
                                                </span>
                                            </td>

                                            {/* Reserve Price */}
                                            <td className="p-4 whitespace-nowrap font-black text-emerald-600">
                                                ₹{(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                            </td>

                                            {/* Status Switch */}
                                            <td className="p-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleToggleStatus(id, prop.isActive)}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase transition cursor-pointer ${
                                                        prop.isActive
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-500 border border-slate-200"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            prop.isActive ? "bg-emerald-500" : "bg-slate-400"
                                                        }`}
                                                    ></span>
                                                    <span>{prop.isActive ? "Active" : "Inactive"}</span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setPreviewProperty(prop)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                                                        title="Inspect factsheet"
                                                    >
                                                        <Eye size={15} />
                                                    </button>
                                                    <Link
                                                        to={`/admin/properties/edit/${id}`}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
                                                        title="Edit listing"
                                                    >
                                                        <Edit size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteCandidate(prop)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                        title="Delete listing"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold text-slate-600 shadow-xs">
                    <div>
                        Showing <strong className="text-slate-900">{properties.length}</strong> of{" "}
                        <strong className="text-slate-900">{total.toLocaleString("en-IN")}</strong> properties
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const prev = Math.max(1, page - 1);
                                setPage(prev);
                                updateQueryParams({ page: String(prev) });
                            }}
                            disabled={page === 1}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                        </button>

                        <span className="font-bold text-slate-900 px-2">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => {
                                const next = Math.min(totalPages, page + 1);
                                setPage(next);
                                updateQueryParams({ page: String(next) });
                            }}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Factsheet Preview Modal */}
            {previewProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                                    SARFAESI Factsheet Preview
                                </span>
                                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                                    {previewProperty.propertyHeading || previewProperty.propertyTitle}
                                </h3>
                            </div>
                            <button
                                onClick={() => setPreviewProperty(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50">
                                <span className="text-slate-400 text-[10px] block font-bold uppercase">Reserve Price</span>
                                <span className="font-black text-emerald-600 text-sm">
                                    ₹{(previewProperty.propertyPrice || 0).toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50">
                                <span className="text-slate-400 text-[10px] block font-bold uppercase">Lending Bank</span>
                                <span className="font-bold text-slate-800">{previewProperty.bankName || "SARFAESI"}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50">
                                <span className="text-slate-400 text-[10px] block font-bold uppercase">City & State</span>
                                <span className="font-bold text-slate-800">{previewProperty.city || "Kolkata"}, {previewProperty.stateName || "WB"}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50">
                                <span className="text-slate-400 text-[10px] block font-bold uppercase">Possession</span>
                                <span className="font-bold text-slate-800">{previewProperty.propertyPossessionType || "Physical"}</span>
                            </div>
                        </div>

                        {previewProperty.borrowerName && (
                            <div className="rounded-xl bg-slate-50 p-3.5 text-xs">
                                <span className="text-slate-400 text-[10px] block font-bold uppercase">Borrower Account</span>
                                <span className="font-bold text-slate-800">{previewProperty.borrowerName}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setPreviewProperty(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                Close Preview
                            </button>
                            <Link
                                to={`/admin/properties/edit/${previewProperty.sourcePropertyId || previewProperty._id}`}
                                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 cursor-pointer"
                            >
                                Edit Notice
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-scale-up">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                                <Trash2 size={20} />
                            </div>
                            <h3 className="font-black text-base text-slate-900">Confirm Deletion</h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            Are you sure you want to permanently delete listing{" "}
                            <strong className="text-slate-900 font-bold">
                                "{deleteCandidate.propertyHeading || deleteCandidate.propertyTitle || deleteCandidate.sourcePropertyId}"
                            </strong>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => setDeleteCandidate(null)}
                                disabled={deleting}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete Permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
