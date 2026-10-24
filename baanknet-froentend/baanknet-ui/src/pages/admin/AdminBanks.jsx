import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Landmark,
    Search,
    TrendingUp,
    Building2,
    Shield,
    ArrowUpRight,
    MapPin,
    Layers,
    ChevronRight,
    Download,
    RefreshCw,
    CheckCircle2,
    Info,
    ExternalLink,
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

    const loadBanks = async () => {
        try {
            setLoading(true);
            const res = await fetchBanksDirectory();
            if (res.success && Array.isArray(res.data)) {
                setBanks(res.data);
            }
        } catch (err) {
            console.error("Failed to load banks directory:", err);
            addToast("Failed to fetch banks directory from server", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanks();
    }, []);

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
        link.setAttribute("download", `baanknet_partner_banks_${Date.now()}.csv`);
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
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Landmark className="text-amber-500" size={26} />
                        <span>Partner Bank Institutions</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Institutional directory of authorized SARFAESI lending institutions, asset recovery branches, and distressed portfolio volumes.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadBanks}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-amber-600" : "text-slate-500"} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 shadow-xs transition cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Institutions</span>
                        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
                            <Landmark size={18} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                        {loading ? "..." : totalInstitutions}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Public & Private Sector Banks
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Indexed Properties</span>
                        <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                        {loading ? "..." : totalListings.toLocaleString("en-IN")}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>100% Verified SARFAESI</span>
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Portfolio Value</span>
                        <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
                        {loading ? "..." : formatINR(totalValuation)}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Cumulative Reserve Pricing
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Bank Portfolio</span>
                        <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600">
                            <Layers size={18} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                        {loading ? "..." : formatINR(avgValuationPerBank)}
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        Per Financial Institution
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Filter bank by name (e.g., State Bank of India, Baroda, Canara)..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 shrink-0">Sort By:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition"
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
                        <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200 animate-pulse p-6" />
                    ))}
                </div>
            ) : filteredBanks.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <Landmark size={40} className="mx-auto text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">No partner banks found</h3>
                    <p className="mt-1 text-xs text-slate-500">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredBanks.map((bank) => {
                        const cleanBranches = (bank.branches || []).filter(Boolean);
                        const cleanDepts = (bank.departments || []).filter(Boolean);
                        const activePercent =
                            bank.totalListings > 0
                                ? Math.round(((bank.activeListings || bank.totalListings) / bank.totalListings) * 100)
                                : 100;

                        return (
                            <div
                                key={bank._id}
                                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-300 hover:shadow-lg hover:shadow-amber-500/5 transition duration-200"
                            >
                                <div>
                                    {/* Bank Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 font-black text-sm text-amber-400 shadow-md">
                                                {bank._id.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition leading-snug">
                                                    {bank._id}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                    <CheckCircle2 size={10} />
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
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Total Notices
                                            </span>
                                            <span className="text-base font-black text-slate-900">
                                                {bank.totalListings}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Portfolio Value
                                            </span>
                                            <span className="text-base font-black text-emerald-600">
                                                {formatINR(bank.totalValuation)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Avg Asset Price
                                            </span>
                                            <span className="font-bold text-slate-700">
                                                {formatINR(bank.avgPrice)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                                Branches Active
                                            </span>
                                            <span className="font-bold text-slate-700">
                                                {cleanBranches.length > 0 ? `${cleanBranches.length} Branches` : "Multiple"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Property Types */}
                                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                                        {(bank.propertyTypes || []).filter(Boolean).map((t, idx) => (
                                            <span
                                                key={idx}
                                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
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
                                        className="text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                                    >
                                        <span>View Details</span>
                                        <ChevronRight size={14} />
                                    </button>

                                    <Link
                                        to={`/admin/properties?bank=${encodeURIComponent(bank._id)}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline transition"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-black text-amber-400">
                                    <Landmark size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">{selectedBank._id}</h3>
                                    <p className="text-xs text-slate-500">
                                        Institutional Profile & Recovery Branch Network
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedBank(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 p-4 text-center">
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-amber-800">Total Listings</div>
                                    <div className="text-lg font-black text-amber-950">{selectedBank.totalListings}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-amber-800">Total Portfolio</div>
                                    <div className="text-lg font-black text-emerald-700">
                                        {formatINR(selectedBank.totalValuation)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase text-amber-800">Average Asset Price</div>
                                    <div className="text-lg font-black text-amber-950">{formatINR(selectedBank.avgPrice)}</div>
                                </div>
                            </div>

                            {/* Branches List */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-amber-500" />
                                    <span>Branch Locations & Nodal Points ({(selectedBank.branches || []).filter(Boolean).length})</span>
                                </h4>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                                    {(selectedBank.branches || []).filter(Boolean).length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Centralized Regional SARFAESI Cell</p>
                                    ) : (
                                        (selectedBank.branches || []).filter(Boolean).map((branch, i) => (
                                            <div
                                                key={i}
                                                className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                                            >
                                                {branch}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* SAMB / Recovery Departments */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                    <Layers size={14} className="text-blue-500" />
                                    <span>Authorised Departments / Asset Recovery Cells ({(selectedBank.departments || []).filter(Boolean).length})</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedBank.departments || []).filter(Boolean).length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Authorised Officer Circle</p>
                                    ) : (
                                        (selectedBank.departments || []).filter(Boolean).map((dept, i) => (
                                            <span
                                                key={i}
                                                className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                                            >
                                                {dept}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                onClick={() => setSelectedBank(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Close Profile
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedBank(null);
                                    navigate(`/admin/properties?bank=${encodeURIComponent(selectedBank._id)}`);
                                }}
                                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 transition flex items-center gap-1.5"
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
