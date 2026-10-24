import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Building2,
    Landmark,
    TrendingUp,
    Mail,
    RefreshCw,
    Plus,
    ArrowUpRight,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    CopyCheck,
    History,
    Search,
    Send,
    Phone,
    PhoneCall,
    HelpCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Zap,
    BarChart3,
    ArrowRight,
    Download,
    Eye,
    Globe,
    Shield,
    Clock,
    Check,
    X,
    FileSpreadsheet
} from "lucide-react";
import {
    fetchAdminDashboardStats,
    triggerCrawlerSync,
    updateInquiry,
    togglePropertyStatus,
    exportPropertiesData
} from "../../services/adminService";
import { formatCompactINR, formatINR, formatDate, getCleanPropertyTitle } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";
import {
    ValuationTrendAreaChart,
    BankShareBarChart,
    AssetTypeDonutChart
} from "../../components/admin/AdminVisualCharts";

export default function AdminDashboard() {
    const { addToast } = useApp();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [showHelpGuide, setShowHelpGuide] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(() =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    // Dashboard Instant Search
    const [dashboardSearchQuery, setDashboardSearchQuery] = useState("");

    // Tracking action states
    const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
    const [togglingPropertyId, setTogglingPropertyId] = useState(null);

    // Dynamic greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const loadStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");
            const res = await fetchAdminDashboardStats();
            if (res.success && res.data) {
                setStats(res.data);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
                if (isRefresh) {
                    addToast("Dashboard analytics refreshed!", "success");
                }
            }
        } catch (err) {
            console.error("Failed to load admin stats:", err);
            setError("Unable to load live dashboard statistics. Please verify backend connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            addToast("Initiating live crawler synchronization...", "info");
            const res = await triggerCrawlerSync();
            if (res.success) {
                addToast("Crawler sync completed successfully!", "success");
                loadStats(true);
            }
        } catch (err) {
            console.error("Sync error:", err);
            addToast("Failed to run crawler sync", "warning");
        } finally {
            setSyncing(false);
        }
    };

    // 1-Click WhatsApp Dispatcher with pre-filled professional notice factsheet message
    const handleSendWhatsApp = (lead) => {
        if (!lead.phone) {
            addToast("No phone number available for this lead", "warning");
            return;
        }
        const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
        const text = encodeURIComponent(
            `*Greetings from Baanknet Auction Advisory Desk* 🏛️\n\n` +
            `Hello *${lead.name}*,\n` +
            `We received your inquiry regarding *${lead.propertyTitle || "Bank Auction Asset"}*.\n\n` +
            `Our team is ready to provide the complete SARFAESI tender factsheet, inspection schedule, and bidder advisory.\n\n` +
            `Best regards,\n*Baanknet Team*`
        );
        window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
    };

    // 1-Click In-place Inquiry Status Cycler: new -> contacted -> closed -> new
    const handleCycleInquiryStatus = async (e, inq) => {
        e.stopPropagation();
        const current = inq.status || "new";
        const nextStatus = current === "new" ? "contacted" : current === "contacted" ? "closed" : "new";

        try {
            setUpdatingInquiryId(inq._id);
            const res = await updateInquiry(inq._id, { status: nextStatus });
            if (res.success) {
                setStats((prev) => {
                    if (!prev) return prev;
                    const updatedRecent = (prev.recentInquiries || []).map((item) =>
                        item._id === inq._id ? { ...item, status: nextStatus } : item
                    );
                    const diffNew = nextStatus === "new" ? 1 : current === "new" ? -1 : 0;
                    return {
                        ...prev,
                        recentInquiries: updatedRecent,
                        newInquiries: Math.max(0, (prev.newInquiries || 0) + diffNew)
                    };
                });
                addToast(`Inquiry status updated to "${nextStatus.toUpperCase()}"`, "success");
            }
        } catch (err) {
            console.error("Status update error:", err);
            addToast("Failed to update inquiry status", "error");
        } finally {
            setUpdatingInquiryId(null);
        }
    };

    // 1-Click In-place Property Active Status Toggle
    const handleTogglePropertyActive = async (e, prop) => {
        e.stopPropagation();
        const propId = prop._id || prop.sourcePropertyId;
        const currentActive = prop.isActive !== false;

        try {
            setTogglingPropertyId(propId);
            const res = await togglePropertyStatus(propId, !currentActive);
            if (res.success) {
                setStats((prev) => {
                    if (!prev) return prev;
                    const updatedProperties = (prev.recentProperties || []).map((item) =>
                        (item._id === propId || item.sourcePropertyId === propId)
                            ? { ...item, isActive: !currentActive }
                            : item
                    );
                    const diffActive = !currentActive ? 1 : -1;
                    return {
                        ...prev,
                        recentProperties: updatedProperties,
                        activeListings: Math.max(0, (prev.activeListings || 0) + diffActive),
                        inactiveListings: Math.max(0, (prev.inactiveListings || 0) - diffActive)
                    };
                });
                addToast(
                    `Property notice ${!currentActive ? "published (Active)" : "unpublished (Inactive)"}`,
                    "success"
                );
            }
        } catch (err) {
            console.error("Toggle property status error:", err);
            addToast("Failed to change property status", "error");
        } finally {
            setTogglingPropertyId(null);
        }
    };

    // 1-Click Dashboard Search Handler
    const handleDashboardSearch = (e) => {
        e.preventDefault();
        if (dashboardSearchQuery.trim()) {
            navigate(`/admin/properties?search=${encodeURIComponent(dashboardSearchQuery.trim())}`);
        }
    };

    // 1-Click Export CSV
    const handleExportCSV = async () => {
        try {
            setExporting(true);
            addToast("Preparing properties spreadsheet download...", "info");
            await exportPropertiesData("csv");
            addToast("Download initiated successfully", "success");
        } catch (err) {
            console.error("Export error:", err);
            addToast("Failed to export data", "warning");
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="py-24">
                <LoadingSpinner text="Loading executive admin dashboard..." />
            </div>
        );
    }

    const valuation = stats?.valuation?.totalValuation || 0;
    const avgPrice = stats?.valuation?.avgPrice || 0;
    const totalProperties = stats?.totalProperties || 0;
    const activeListings = stats?.activeListings || 0;
    const inactiveListings = stats?.inactiveListings || 0;
    const totalInquiries = stats?.totalInquiries || 0;
    const newInquiries = stats?.newInquiries || 0;
    const totalBanks = stats?.totalBanks || 0;

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
            {/* Top Welcome Banner with Live System Health & Action Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 rounded-2xl sm:rounded-3xl bg-slate-950 p-5 sm:p-7 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

                <div className="space-y-2 relative z-10 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-400">
                            <Sparkles size={13} />
                            <span>Baanknet Executive Console</span>
                        </div>

                        {/* Live Operational Status Indicator */}
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>All Systems Operational</span>
                        </div>

                        <div className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock size={12} className="text-slate-500" />
                            <span>Updated: {lastUpdated}</span>
                        </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        {getGreeting()}, Administrator!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Platform status: <span className="text-amber-400 font-bold">{totalProperties.toLocaleString("en-IN")}</span> verified bank notices indexed across{" "}
                        <span className="text-white font-bold">{totalBanks} partner banks</span> with zero crawler bottlenecks.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
                    {/* User Guide Toggle */}
                    <button
                        onClick={() => setShowHelpGuide(!showHelpGuide)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        title="Toggle helpful quick guide for beginners"
                    >
                        <HelpCircle size={15} className="text-amber-400" />
                        <span>{showHelpGuide ? "Hide Guide" : "Quick Guide"}</span>
                        {showHelpGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Instant Refresh Button */}
                    <button
                        onClick={() => loadStats(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Refresh live dashboard numbers"
                    >
                        <RefreshCw size={14} className={refreshing ? "animate-spin text-amber-400" : "text-slate-400"} />
                        <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
                    </button>

                    {/* Crawler Sync Trigger */}
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Pull latest notices from bank portals"
                    >
                        <RefreshCw size={14} className={syncing ? "animate-spin text-amber-400" : "text-amber-500"} />
                        <span>{syncing ? "Syncing..." : "Sync Crawler"}</span>
                    </button>

                    {/* Add Listing CTA */}
                    <Link
                        to="/admin/properties/new"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Add Listing</span>
                    </Link>
                </div>
            </div>

            {/* Quick User Guide Drawer (Collapsible & Friendly) */}
            {showHelpGuide && (
                <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 p-5 sm:p-6 shadow-sm animate-scale-up text-xs text-slate-700 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <Sparkles size={16} className="text-amber-600" />
                            <span>Admin Portal Quick Walkthrough & Pro Tips</span>
                        </div>
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 px-3 py-0.5 text-[10px] font-black uppercase">
                            Simple Mode Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div className="p-4 rounded-2xl bg-white border border-amber-100/90 shadow-2xs space-y-1.5">
                            <div className="font-black text-slate-900 flex items-center gap-2 text-xs">
                                <span className="h-5 w-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">1</span>
                                <span>Properties Directory</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Browse all 1,499+ bank auction notices. Toggle status switch to publish or unpublish instantly, or edit reserve prices.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-amber-100/90 shadow-2xs space-y-1.5">
                            <div className="font-black text-slate-900 flex items-center gap-2 text-xs">
                                <span className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black">2</span>
                                <span>Buyer Leads & CRM</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Inquiries submitted by prospective investors arrive here. Click WhatsApp to send pre-filled auction tender factsheets.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-amber-100/90 shadow-2xs space-y-1.5">
                            <div className="font-black text-slate-900 flex items-center gap-2 text-xs">
                                <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">3</span>
                                <span>Partner Banks Hub</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Breakdown of properties by bank (SBI, PNB, BoB, Canara, etc.) with cumulative valuation and branch nodal contacts.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-amber-100/90 shadow-2xs space-y-1.5">
                            <div className="font-black text-slate-900 flex items-center gap-2 text-xs">
                                <span className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black">4</span>
                                <span>Command Palette (⌘K)</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Press <kbd className="bg-slate-100 border border-slate-300 px-1 py-0.5 rounded font-mono font-bold text-slate-800">Ctrl+K</kbd> anywhere to search properties or jump to any page in one keystroke.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Banner if any */}
            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => loadStats(true)}
                        className="rounded-lg bg-red-100 hover:bg-red-200 px-2.5 py-1 text-xs font-bold text-red-800 cursor-pointer"
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {/* Dashboard Instant Search Bar */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
                <form onSubmit={handleDashboardSearch} className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={dashboardSearchQuery}
                            onChange={(e) => setDashboardSearchQuery(e.target.value)}
                            placeholder="Quick search notices by title, bank (e.g. SBI), city (e.g. Kolkata), or SARFAESI ID..."
                            className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition"
                        />
                        {dashboardSearchQuery && (
                            <button
                                type="button"
                                onClick={() => setDashboardSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto h-11 px-5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
                    >
                        <span>Search Directory</span>
                        <ArrowRight size={14} />
                    </button>
                </form>
            </div>

            {/* 1-Click Operations Hub (8 Large Action Cards) */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-black text-slate-900 text-sm sm:text-base">
                        <Zap size={18} className="text-amber-500" />
                        <span>Quick Actions & Shortcuts</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">1-Click Common Operations</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
                    {/* 1. Add Listing */}
                    <Link
                        to="/admin/properties/new"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/80 hover:border-amber-400 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <Plus size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-900 group-hover:text-amber-900">Add Listing</span>
                        <span className="text-[10px] text-slate-500">Create notice</span>
                    </Link>

                    {/* 2. Buyer Inquiries */}
                    <Link
                        to="/admin/inquiries"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs relative">
                            <Mail size={18} />
                            {newInquiries > 0 && (
                                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white" />
                            )}
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-blue-700">Buyer Leads</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{newInquiries} new leads</span>
                    </Link>

                    {/* 3. Partner Banks */}
                    <Link
                        to="/admin/banks"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <Landmark size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-emerald-700">Partner Banks</span>
                        <span className="text-[10px] text-slate-500">{totalBanks} institutions</span>
                    </Link>

                    {/* 4. Crawler Sync */}
                    <Link
                        to="/admin/sync"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200/80 hover:border-purple-300 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <RefreshCw size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-purple-700">Crawler Sync</span>
                        <span className="text-[10px] text-slate-500">Live feeds</span>
                    </Link>

                    {/* 5. Clean Duplicates */}
                    <Link
                        to="/admin/duplicates"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <CopyCheck size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-rose-700">Clean Dups</span>
                        <span className="text-[10px] text-slate-500">Data quality</span>
                    </Link>

                    {/* 6. Market Analytics */}
                    <Link
                        to="/admin/analytics"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 transition group cursor-pointer shadow-2xs"
                    >
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <BarChart3 size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-indigo-700">Analytics</span>
                        <span className="text-[10px] text-slate-500">Market graphs</span>
                    </Link>

                    {/* 7. Export CSV / Excel */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 transition group cursor-pointer shadow-2xs disabled:opacity-50"
                        title="Download properties spreadsheet"
                    >
                        <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <FileSpreadsheet size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-teal-700">Export CSV</span>
                        <span className="text-[10px] text-slate-500">{exporting ? "Preparing..." : "Spreadsheet"}</span>
                    </button>

                    {/* 8. Public Website Preview */}
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center text-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 transition group cursor-pointer shadow-2xs"
                        title="Open live buyer marketplace in new tab"
                    >
                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black group-hover:scale-105 transition shadow-xs">
                            <Globe size={18} />
                        </div>
                        <span className="mt-2 text-xs font-bold text-slate-800 group-hover:text-slate-950">Public Site</span>
                        <span className="text-[10px] text-slate-500">Live view ↗</span>
                    </Link>
                </div>
            </div>

            {/* Clickable KPI Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Total Properties */}
                <div
                    onClick={() => navigate("/admin/properties")}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                    title="Click to view Properties Directory"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Total Listings
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                                <Building2 size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                {totalProperties.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {activeListings} Active
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400">
                            {inactiveListings} inactive / archived circulars
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-amber-600">
                        <span>Manage listings</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </div>
                </div>

                {/* 2. Total Valuation */}
                <div
                    onClick={() => navigate("/admin/analytics")}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                    title="Click to view Market Valuation Analytics"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Portfolio Valuation
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/50 group-hover:bg-emerald-500 group-hover:text-white transition">
                                <TrendingUp size={20} />
                            </div>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                                {formatCompactINR(valuation)}
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400">
                            Avg Reserve Price: <strong className="text-slate-700">{formatCompactINR(avgPrice)}</strong>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-emerald-600">
                        <span>Valuation trends</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </div>
                </div>

                {/* 3. Partner Banks */}
                <div
                    onClick={() => navigate("/admin/banks")}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                    title="Click to view Partner Banks Hub"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Lending Banks
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/50 group-hover:bg-blue-600 group-hover:text-white transition">
                                <Landmark size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                {totalBanks}
                            </span>
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                Institutions
                            </span>
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400 truncate">
                            SBI, PNB, BoB, Canara, Indian Bank...
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-blue-600">
                        <span>Explore banks</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </div>
                </div>

                {/* 4. Leads & Inquiries */}
                <div
                    onClick={() => navigate("/admin/inquiries")}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:border-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                    title="Click to view Buyer Leads CRM"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Investor Leads
                            </span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/50 group-hover:bg-rose-500 group-hover:text-white transition">
                                <Mail size={20} />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-slate-900">
                                {totalInquiries}
                            </span>
                            {newInquiries > 0 ? (
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md animate-pulse">
                                    +{newInquiries} New
                                </span>
                            ) : (
                                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    All Caught Up
                                </span>
                            )}
                        </div>
                        <div className="mt-2 text-[11px] text-slate-400">
                            High-intent buyer inquiries requesting tenders
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-rose-600">
                        <span>Review leads CRM</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                    </div>
                </div>
            </div>

            {/* VISUAL GRAPHS & INTELLIGENCE ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Interactive Area Growth & Valuation Trend Chart (7 cols) */}
                <div className="lg:col-span-7">
                    <ValuationTrendAreaChart />
                </div>

                {/* 2. Asset Type Distribution Donut Chart (5 cols) */}
                <div className="lg:col-span-5">
                    <AssetTypeDonutChart />
                </div>
            </div>

            {/* Bank Market Share Visual Bar Chart */}
            <div>
                <BankShareBarChart />
            </div>

            {/* Quick Bank Presets Filter Bar */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Landmark size={14} className="text-amber-500" />
                        <span>Filter Directory By Top Lending Institution</span>
                    </span>
                    <Link
                        to="/admin/banks"
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                    >
                        View All Banks →
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { name: "All Listings", count: totalProperties, query: "" },
                        { name: "State Bank of India", count: 824, query: "State Bank of India" },
                        { name: "Punjab National Bank", count: 310, query: "Punjab National Bank" },
                        { name: "Bank of Baroda", count: 215, query: "Bank of Baroda" },
                        { name: "Canara Bank", count: 98, query: "Canara Bank" },
                        { name: "Indian Bank", count: 35, query: "Indian Bank" },
                        { name: "Bank of India", count: 20, query: "Bank of India" }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() =>
                                navigate(item.query ? `/admin/properties?bank=${encodeURIComponent(item.query)}` : "/admin/properties")
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-900 hover:text-amber-400 hover:border-slate-900 transition cursor-pointer"
                        >
                            <span>{item.name}</span>
                            <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-black text-slate-700">
                                {item.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Two Column Actionable Layout: Inquiries Desk + Recent Properties */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Recent Inquiries Desk with In-Place Status Toggle & 1-Click WhatsApp */}
                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Mail size={18} className="text-rose-500" />
                                    <span>Recent Buyer Inquiries Desk</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Click status pill to cycle New ➔ Contacted ➔ Closed
                                </p>
                            </div>
                            <Link
                                to="/admin/inquiries"
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                            >
                                View All ({totalInquiries}) →
                            </Link>
                        </div>

                        <div className="mt-4 space-y-3">
                            {(!stats?.recentInquiries || stats.recentInquiries.length === 0) ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    No customer inquiries logged yet.
                                </div>
                            ) : (
                                stats.recentInquiries.slice(0, 4).map((inq) => {
                                    const isUpdating = updatingInquiryId === inq._id;
                                    const currentStatus = (inq.status || "new").toLowerCase();

                                    return (
                                        <div
                                            key={inq._id}
                                            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs hover:border-amber-300 hover:bg-white transition shadow-2xs space-y-2"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="font-bold text-slate-900 block text-xs">{inq.name}</span>
                                                    <span className="text-[11px] text-slate-500">
                                                        {inq.phone || inq.email} • {formatDate(inq.createdAt)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {/* In-Place Interactive Status Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleCycleInquiryStatus(e, inq)}
                                                        disabled={isUpdating}
                                                        title="Click to advance status (New -> Contacted -> Closed)"
                                                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                                                            currentStatus === "new"
                                                                ? "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                                                                : currentStatus === "contacted"
                                                                ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                                                                : "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                                                        }`}
                                                    >
                                                        {isUpdating && <RefreshCw size={10} className="animate-spin" />}
                                                        <span>{inq.status || "new"}</span>
                                                    </button>

                                                    {/* 1-Click WhatsApp Button */}
                                                    {inq.phone && (
                                                        <button
                                                            onClick={() => handleSendWhatsApp(inq)}
                                                            title="Dispatch WhatsApp Factsheet"
                                                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-emerald-300"
                                                        >
                                                            <Send size={13} />
                                                        </button>
                                                    )}

                                                    {/* 1-Click Direct Call */}
                                                    {inq.phone && (
                                                        <a
                                                            href={`tel:${inq.phone}`}
                                                            title={`Call ${inq.phone}`}
                                                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 bg-white border border-slate-200 shadow-2xs hover:border-blue-300"
                                                        >
                                                            <PhoneCall size={13} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-[11px] text-slate-700 font-medium truncate pt-1 border-t border-slate-100 flex items-center gap-1.5">
                                                <Building2 size={12} className="text-amber-500 shrink-0" />
                                                <span className="truncate">{inq.propertyTitle || "Bank Auction Asset"}</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                            to="/admin/inquiries"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition"
                        >
                            <span>Open Complete Inquiries CRM</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* 2. Recently Indexed Notices with In-Place Status Toggle */}
                <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 size={18} className="text-amber-500" />
                                    <span>Recently Indexed Notices</span>
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Latest parsed circulars with 1-click edit & active toggle
                                </p>
                            </div>
                            <Link
                                to="/admin/properties"
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                            >
                                View All ({totalProperties}) →
                            </Link>
                        </div>

                        <div className="mt-4 space-y-3">
                            {(!stats?.recentProperties || stats.recentProperties.length === 0) ? (
                                <div className="py-12 text-center text-xs text-slate-400">
                                    No recent properties found.
                                </div>
                            ) : (
                                stats.recentProperties.slice(0, 4).map((prop) => {
                                    const propId = prop.sourcePropertyId || prop._id;
                                    const isActive = prop.isActive !== false;
                                    const isToggling = togglingPropertyId === propId;

                                    return (
                                        <div
                                            key={propId}
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs hover:border-amber-300 hover:bg-white transition shadow-2xs"
                                        >
                                            <div className="overflow-hidden flex-1 min-w-0">
                                                <div className="font-bold text-slate-900 truncate">
                                                    {prop.propertyHeading || prop.propertyTitle || "Bank Auction Property"}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                    {prop.bankName} • {prop.city || "India"} • {prop.propertyType || "Asset"}
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                <div className="font-black text-emerald-600">
                                                    ₹{(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* In-place Publish / Unpublish Toggle */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleTogglePropertyActive(e, prop)}
                                                        disabled={isToggling}
                                                        title={isActive ? "Click to deactivate (hide)" : "Click to activate (publish)"}
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                                                            isActive
                                                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                        }`}
                                                    >
                                                        {isToggling && <RefreshCw size={9} className="animate-spin" />}
                                                        <span>{isActive ? "Active" : "Hidden"}</span>
                                                    </button>

                                                    {/* Edit link */}
                                                    <Link
                                                        to={`/admin/properties/edit/${propId}`}
                                                        className="text-[10px] font-bold text-amber-600 hover:underline"
                                                    >
                                                        Edit →
                                                    </Link>

                                                    {/* View on public site */}
                                                    <Link
                                                        to={`/properties/${propId}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="View live page on public site"
                                                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                                                    >
                                                        <Eye size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link
                            to="/admin/properties"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition"
                        >
                            <span>Browse Complete Directory</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom System Health & Crawler Automation Status Bar */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
                        <Shield size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>Automated SARFAESI Crawler Engine</span>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Automatic bank portal synchronization active • 13 financial institutions connected with 100% clean title validation
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={syncing ? "animate-spin text-amber-500" : "text-slate-500"} />
                        <span>{syncing ? "Syncing Portals..." : "Sync Portals Now"}</span>
                    </button>

                    <Link
                        to="/admin/audit-logs"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                    >
                        <History size={13} className="text-slate-500" />
                        <span>Audit Trail</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
