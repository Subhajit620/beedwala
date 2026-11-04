import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Landmark,
    Search,
    TrendingUp,
    Building2,
    ArrowUpRight,
    MapPin,
    Layers,
    ChevronRight,
    Download,
    RefreshCw,
    CheckCircle2,
    Info,
    X
} from "lucide-react";
import { fetchBanksDirectory } from "../../services/adminService";
import { useApp } from "../../context/AppContext";

export default function AdminBanks() {
    const navigate = useNavigate();
    const { addToast } = useApp();
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("listings_desc");
    const [selectedBank, setSelectedBank] = useState(null);

    const loadBanks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchBanksDirectory();
            if (res.success && Array.isArray(res.data)) {
                const list = [...res.data];
                if (!list.some((b) => b._id && b._id.toLowerCase() === "hdfc bank")) {
                    list.push({
                        _id: "HDFC Bank",
                        totalListings: 0,
                        activeListings: 0,
                        totalValuation: 0,
                        avgPrice: 0,
                        branches: ["HDFC Bank Retail & Stressed Assets Recovery Branch, Kolkata"],
                        departments: ["SARFAESI Retail & Commercial Asset Recovery Cell"],
                        propertyTypes: ["Residential", "Commercial"]
                    });
                }
                setBanks(list);
            }
        } catch (err) {
            console.error("Failed to load banks directory:", err);
            addToast("Failed to fetch banks directory from server", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        loadBanks();
    }, [loadBanks]);

    // Aggregated Overview Metrics
    const totalInstitutions = banks.length;
    const totalListings = banks.reduce((acc, b) => acc + (b.totalListings || 0), 0);
    const totalValuation = banks.reduce((acc, b) => acc + (b.totalValuation || 0), 0);
    const avgValuationPerBank = totalInstitutions > 0 ? totalValuation / totalInstitutions : 0;

    // Filter and Sort
    const filteredBanks = banks
        .filter((b) => b._id && b._id.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === "listings_desc") return (b.totalListings || 0) - (a.totalListings || 0);
            if (sortBy === "listings_asc") return (a.totalListings || 0) - (b.totalListings || 0);
            if (sortBy === "valuation_desc") return (b.totalValuation || 0) - (a.totalValuation || 0);
            if (sortBy === "valuation_asc") return (a.totalValuation || 0) - (b.totalValuation || 0);
            if (sortBy === "name_asc") return a._id.localeCompare(b._id);
            return 0;
        });

    const formatINR = (amount) => {
        if (!amount || isNaN(amount)) return "₹0";
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    const handleExportCSV = () => {
        if (banks.length === 0) return;
        const headers = ["Bank Name", "Total Listings", "Active Listings", "Total Valuation (INR)", "Average Price (INR)", "Branch Count"];
        const rows = banks.map((b) => [
            `"${b._id}"`,
            b.totalListings || 0,
            b.activeListings || 0,
            b.totalValuation || 0,
            Math.round(b.avgPrice || 0),
            (b.branches || []).filter(Boolean).length
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bidwallah_partner_banks_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Bank institutional portfolio exported to CSV", "success");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-200/70 text-red-600 shrink-0">
                            <Landmark size={17} />
                        </div>
                        <span>Partner Bank Institutions</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Directory of authorized SARFAESI lending institutions, asset recovery branches, and auction portfolio volumes.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadBanks}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-gray-500"} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Total Institutions</span>
                        <div className="rounded-lg bg-red-100/80 p-2 text-red-600">
                            <Landmark size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
                        {loading ? "..." : totalInstitutions}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Public &amp; Private Sector Banks
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Indexed Properties</span>
                        <div className="rounded-lg bg-gray-200/80 p-2 text-gray-700">
                            <Building2 size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
                        {loading ? "..." : totalListings.toLocaleString("en-IN")}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>Verified SARFAESI Notices</span>
                    </p>
                </div>

                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Total Portfolio Value</span>
                        <div className="rounded-lg bg-red-100/80 p-2 text-red-600">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-600 tabular-nums">
                        {loading ? "..." : formatINR(totalValuation)}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Cumulative Reserve Pricing
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Avg Bank Portfolio</span>
                        <div className="rounded-lg bg-gray-200/80 p-2 text-gray-700">
                            <Layers size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
                        {loading ? "..." : formatINR(avgValuationPerBank)}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Per Financial Institution
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl border border-gray-200/80 bg-white/55 backdrop-blur-md p-4 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter bank by name (e.g., State Bank of India, HDFC Bank, Baroda, Canara)..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 shrink-0">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 transition"
                    >
                        <option value="listings_desc">Most Listings First</option>
                        <option value="listings_asc">Least Listings First</option>
                        <option value="valuation_desc">Highest Valuation First</option>
                        <option value="valuation_asc">Lowest Valuation First</option>
                        <option value="name_asc">Bank Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Banks Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-56 rounded-xl bg-white border border-slate-200 animate-pulse p-6" />
                    ))}
                </div>
            ) : filteredBanks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
                    <Landmark size={40} className="mx-auto text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">No partner banks found</h3>
                    <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBanks.map((bank) => {
                        const cleanBranches = (bank.branches || []).filter(Boolean);

                        return (
                            <div
                                key={bank._id}
                                className="group relative flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white/55 backdrop-blur-md p-5 sm:p-6 shadow-2xs hover:border-red-300 hover:shadow-md transition duration-200"
                            >
                                <div>
                                    {/* Bank Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 border border-red-200/80 font-bold text-sm text-red-700">
                                                {bank._id.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition leading-snug">
                                                    {bank._id}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 mt-0.5">
                                                    <CheckCircle2 size={10} className="text-red-600" />
                                                    <span>Active SARFAESI Feed</span>
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedBank(bank)}
                                            title="Inspect Branch Details"
                                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                        >
                                            <Info size={16} />
                                        </button>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs">
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                                Total Notices
                                            </span>
                                            <span className="text-base font-bold text-slate-900 tabular-nums">
                                                {bank.totalListings}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                                Portfolio Value
                                            </span>
                                            <span className="text-base font-bold text-emerald-600 tabular-nums">
                                                {formatINR(bank.totalValuation)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                                Avg Asset Price
                                            </span>
                                            <span className="font-semibold text-slate-700 tabular-nums">
                                                {formatINR(bank.avgPrice)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                                                Branches Active
                                            </span>
                                            <span className="font-semibold text-slate-700">
                                                {cleanBranches.length > 0 ? `${cleanBranches.length} Branches` : "Multiple"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Property Types */}
                                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                                        {(bank.propertyTypes || []).filter(Boolean).map((t, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Card Footer CTA */}
                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedBank(bank)}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>View Details</span>
                                        <ChevronRight size={14} />
                                    </button>

                                    <Link
                                        to={`/admin/properties?bank=${encodeURIComponent(bank._id)}`}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                    >
                                        <span>Browse Properties ({bank.totalListings})</span>
                                        <ArrowUpRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bank Inspection Detail Modal */}
            {selectedBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 border border-red-200/80 text-red-600">
                                    <Landmark size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{selectedBank._id}</h3>
                                    <p className="text-xs text-gray-500">
                                        Institutional Profile &amp; Recovery Branch Network
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedBank(null)}
                                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-800 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-3 gap-3 rounded-xl bg-red-50/50 border border-red-200/60 p-4 text-center">
                                <div>
                                    <div className="text-[10px] font-semibold uppercase text-red-700">Total Listings</div>
                                    <div className="text-lg font-bold text-gray-900 tabular-nums">{selectedBank.totalListings}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold uppercase text-red-700">Total Portfolio</div>
                                    <div className="text-lg font-bold text-red-700 tabular-nums">
                                        {formatINR(selectedBank.totalValuation)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-semibold uppercase text-red-700">Average Asset Price</div>
                                    <div className="text-lg font-bold text-gray-900 tabular-nums">{formatINR(selectedBank.avgPrice)}</div>
                                </div>
                            </div>

                            {/* Branches List */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-red-600" />
                                    <span>Branch Locations &amp; Nodal Points ({(selectedBank.branches || []).filter(Boolean).length})</span>
                                </h4>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2.5">
                                    {(selectedBank.branches || []).filter(Boolean).length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Centralized Regional SARFAESI Cell</p>
                                    ) : (
                                        (selectedBank.branches || []).filter(Boolean).map((branch, i) => (
                                            <div
                                                key={i}
                                                className="text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200/80 shadow-2xs"
                                            >
                                                {branch}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* SAMB / Recovery Departments */}
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                                    <Layers size={14} className="text-red-500" />
                                    <span>Authorised Departments / Asset Recovery Cells ({(selectedBank.departments || []).filter(Boolean).length})</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedBank.departments || []).filter(Boolean).length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">Authorised Officer Circle</p>
                                    ) : (
                                        (selectedBank.departments || []).filter(Boolean).map((dept, i) => (
                                            <span
                                                key={i}
                                                className="rounded-lg bg-red-50 border border-red-100 px-3 py-1 text-xs font-medium text-red-800"
                                            >
                                                {dept}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
                            <button
                                onClick={() => setSelectedBank(null)}
                                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                            >
                                Close Profile
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedBank(null);
                                    navigate(`/admin/properties?bank=${encodeURIComponent(selectedBank._id)}`);
                                }}
                                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Browse All {selectedBank.totalListings} Listings</span>
                                <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
