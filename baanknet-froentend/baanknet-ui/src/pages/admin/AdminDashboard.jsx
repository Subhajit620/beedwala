import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    RefreshCw,
    Plus,
    AlertCircle,
    History,
    Send,
    PhoneCall,
    ArrowRight,
    Eye,
    Download
} from "lucide-react";
import {
    fetchAdminDashboardStats,
    triggerCrawlerSync,
    updateInquiry,
    togglePropertyStatus,
    exportPropertiesData
} from "../../services/adminService";
import { fetchFreshProperties } from "../../services/freshPropertyService";
import { formatCompactINR, formatDate } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";
import {
    ValuationTrendAreaChart,
    BankShareBarChart,
    AssetTypeDonutChart,
    PriceBracketHistogramChart,
    LeadConversionFunnelChart
} from "../../components/admin/AdminVisualCharts";

export default function AdminDashboard() {
    const { addToast } = useApp();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [freshCount, setFreshCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(() =>
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
    const [togglingPropertyId, setTogglingPropertyId] = useState(null);

    const loadStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");
            const [res, freshRes] = await Promise.all([
                fetchAdminDashboardStats(),
                fetchFreshProperties(true).catch(() => ({ data: [] }))
            ]);
            if (Array.isArray(freshRes?.data)) {
                setFreshCount(freshRes.data.length);
            }
            if (res.success && res.data) {
                setStats(res.data);
                setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
                if (isRefresh) {
                    addToast("Dashboard data refreshed", "success");
                }
            }
        } catch (err) {
            console.error("Failed to load admin stats:", err);
            setError("Unable to load dashboard statistics. Please verify the backend server is running.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [addToast]);

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        loadStats();
    }, [loadStats]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            addToast("Starting crawler synchronization...", "info");
            const res = await triggerCrawlerSync();
            if (res.success) {
                addToast("Crawler sync completed", "success");
                loadStats(true);
            }
        } catch (err) {
            console.error("Sync error:", err);
            addToast("Failed to run crawler sync", "warning");
        } finally {
            setSyncing(false);
        }
    };

    const handleSendWhatsApp = (lead) => {
        if (!lead.phone) {
            addToast("No phone number available for this lead", "warning");
            return;
        }
        const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
        const text = encodeURIComponent(
            `Hello ${lead.name},\n\n` +
            `We received your inquiry on Bidwallah regarding "${lead.propertyTitle || "Property Listing"}".\n` +
            `Please let us know a convenient time to share the property details and schedule a site visit.\n\n` +
            `Regards,\nBidwallah Team`
        );
        window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
    };

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
                addToast(`Inquiry marked as ${nextStatus}`, "success");
            }
        } catch (err) {
            console.error("Status update error:", err);
            addToast("Failed to update inquiry status", "error");
        } finally {
            setUpdatingInquiryId(null);
        }
    };

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
                    `Listing ${!currentActive ? "activated" : "hidden"}`,
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

    const handleExportCSV = async () => {
        try {
            setExporting(true);
            addToast("Preparing CSV export...", "info");
            await exportPropertiesData("csv");
            addToast("CSV download started", "success");
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
                <LoadingSpinner text="Loading workspace..." />
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
        <div className="space-y-6 pb-8">
            {/* Page Header & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                        Overview
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        {totalProperties.toLocaleString("en-IN")} auction notices · {freshCount} direct listings · Updated {lastUpdated}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadStats(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-zinc-900" : "text-zinc-500"} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={exporting}
                        className="inline-flex items-center gap-1.5 h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
                    >
                        <Download size={13} className="text-zinc-500" />
                        <span>{exporting ? "Exporting..." : "Export CSV"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-1.5 h-8 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={syncing ? "animate-spin text-zinc-900" : "text-zinc-500"} />
                        <span>{syncing ? "Syncing..." : "Run Crawler"}</span>
                    </button>

                    <Link
                        to="/admin/properties/new"
                        className="inline-flex items-center gap-1.5 h-8 rounded-lg bg-red-600 hover:bg-red-700 px-3.5 text-xs font-semibold text-white shadow-2xs transition"
                    >
                        <Plus size={14} />
                        <span>Add Property</span>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={15} className="text-rose-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => loadStats(true)}
                        className="rounded-md bg-white border border-rose-200 hover:bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-800 cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Gray & Red 4-Column Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Inventory */}
                <div
                    onClick={() => navigate("/admin/properties")}
                    className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 hover:border-red-400 transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-red-700">
                                Auction Inventory
                            </span>
                            <ArrowRight size={13} className="text-red-300 group-hover:text-red-600 transition" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2.5">
                            <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                                {totalProperties.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] font-semibold text-red-700 bg-red-50/80 border border-red-200 px-1.5 py-0.5 rounded">
                                {activeListings} active
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500 tabular-nums">
                        {inactiveListings} hidden · {freshCount} direct sale listings
                    </div>
                </div>

                {/* 2. Reserve Valuation */}
                <div
                    onClick={() => navigate("/admin/analytics")}
                    className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 hover:border-gray-400 transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700">
                                Cumulative Reserve Value
                            </span>
                            <ArrowRight size={13} className="text-gray-400 group-hover:text-red-600 transition" />
                        </div>
                        <div className="mt-2">
                            <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                                {formatCompactINR(valuation)}
                            </span>
                        </div>
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500 tabular-nums">
                        Mean reserve: <span className="font-semibold text-red-700">{formatCompactINR(avgPrice)}</span>
                    </div>
                </div>

                {/* 3. Buyer Inquiries */}
                <div
                    onClick={() => navigate("/admin/inquiries")}
                    className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 hover:border-red-400 transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-red-700">
                                Buyer Inquiries
                            </span>
                            <ArrowRight size={13} className="text-red-300 group-hover:text-red-600 transition" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2.5">
                            <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                                {totalInquiries.toLocaleString("en-IN")}
                            </span>
                            {newInquiries > 0 ? (
                                <span className="text-[11px] font-semibold text-white bg-red-600 px-1.5 py-0.5 rounded">
                                    {newInquiries} unread
                                </span>
                            ) : (
                                <span className="text-[11px] font-medium text-gray-600 bg-gray-100/80 px-1.5 py-0.5 rounded">
                                    All reviewed
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500">
                        Property leads &amp; callback requests
                    </div>
                </div>

                {/* 4. Lending Institutions */}
                <div
                    onClick={() => navigate("/admin/banks")}
                    className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 hover:border-gray-400 transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700">
                                Partner Institutions
                            </span>
                            <ArrowRight size={13} className="text-gray-400 group-hover:text-red-600 transition" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                                {totalBanks}
                            </span>
                            <span className="text-xs text-gray-500">banks</span>
                        </div>
                    </div>
                    <div className="mt-3 text-[11px] text-gray-500 truncate">
                        SBI, PNB, HDFC Bank, Bank of Baroda, Canara
                    </div>
                </div>
            </div>

            {/* Operational Tables Row: Recent Inquiries + Recent Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Recent Buyer Inquiries */}
                <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-100">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">
                                    Recent Buyer Inquiries
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Click status badge to cycle New → Contacted → Closed
                                </p>
                            </div>
                            <Link
                                to="/admin/inquiries"
                                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 shrink-0"
                            >
                                View all ({totalInquiries}) →
                            </Link>
                        </div>

                        <div className="divide-y divide-zinc-100">
                            {(!stats?.recentInquiries || stats.recentInquiries.length === 0) ? (
                                <div className="py-12 text-center text-xs text-zinc-400">
                                    No buyer inquiries recorded yet.
                                </div>
                            ) : (
                                stats.recentInquiries.slice(0, 5).map((inq) => {
                                    const isUpdating = updatingInquiryId === inq._id;
                                    const currentStatus = (inq.status || "new").toLowerCase();

                                    return (
                                        <div
                                            key={inq._id}
                                            className="px-5 py-3.5 hover:bg-zinc-50/70 transition flex items-start justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-zinc-900 truncate">
                                                        {inq.name}
                                                    </span>
                                                    <span className="text-zinc-300">·</span>
                                                    <span className="text-zinc-500 tabular-nums truncate">
                                                        {inq.phone || inq.email}
                                                    </span>
                                                </div>
                                                <div className="text-zinc-500 truncate">
                                                    {inq.propertyTitle || "General Property Inquiry"} · {formatDate(inq.createdAt)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleCycleInquiryStatus(e, inq)}
                                                    disabled={isUpdating}
                                                    title="Cycle status"
                                                    className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition cursor-pointer flex items-center gap-1 border ${
                                                        currentStatus === "new"
                                                            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                            : currentStatus === "contacted"
                                                            ? "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
                                                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {isUpdating && <RefreshCw size={10} className="animate-spin" />}
                                                    <span>{inq.status || "new"}</span>
                                                </button>

                                                {inq.phone && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendWhatsApp(inq)}
                                                        title="Send WhatsApp"
                                                        className="rounded p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 bg-white cursor-pointer"
                                                    >
                                                        <Send size={12} />
                                                    </button>
                                                )}

                                                {inq.phone && (
                                                    <a
                                                        href={`tel:${inq.phone}`}
                                                        title={`Call ${inq.phone}`}
                                                        className="rounded p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 bg-white"
                                                    >
                                                        <PhoneCall size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl">
                        <Link
                            to="/admin/inquiries"
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                        >
                            <span>Open Inquiries Workspace</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* 2. Recent Property Notices */}
                <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md flex flex-col justify-between min-w-0">
                    <div>
                        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-zinc-100">
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-900">
                                    Recent Property Notices
                                </h3>
                                <p className="text-xs text-zinc-500">
                                    Latest indexed listings with visibility controls
                                </p>
                            </div>
                            <Link
                                to="/admin/properties"
                                className="text-xs font-medium text-zinc-600 hover:text-zinc-900 shrink-0"
                            >
                                View all ({totalProperties}) →
                            </Link>
                        </div>

                        <div className="divide-y divide-zinc-100">
                            {(!stats?.recentProperties || stats.recentProperties.length === 0) ? (
                                <div className="py-12 text-center text-xs text-zinc-400">
                                    No recent properties found.
                                </div>
                            ) : (
                                stats.recentProperties.slice(0, 5).map((prop) => {
                                    const propId = prop.sourcePropertyId || prop._id;
                                    const isActive = prop.isActive !== false;
                                    const isToggling = togglingPropertyId === propId;

                                    return (
                                        <div
                                            key={propId}
                                            className="px-5 py-3.5 hover:bg-zinc-50/70 transition flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="font-semibold text-zinc-900 truncate">
                                                    {prop.propertyHeading || prop.propertyTitle || "Bank Auction Property"}
                                                </div>
                                                <div className="text-zinc-500 truncate">
                                                    {prop.bankName || "Bank"} · {prop.cityName || prop.city || "India"} · {prop.propertyType || "Asset"}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-semibold text-zinc-900 tabular-nums">
                                                    ₹{(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleTogglePropertyActive(e, prop)}
                                                    disabled={isToggling}
                                                    className={`text-[11px] font-medium px-2 py-0.5 rounded border transition cursor-pointer flex items-center gap-1 ${
                                                        isActive
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                                                    }`}
                                                >
                                                    {isToggling && <RefreshCw size={9} className="animate-spin" />}
                                                    <span>{isActive ? "Active" : "Hidden"}</span>
                                                </button>

                                                <Link
                                                    to={`/admin/properties/edit/${propId}`}
                                                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
                                                >
                                                    Edit
                                                </Link>

                                                <Link
                                                    to={`/properties/${propId}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="View public page"
                                                    className="p-1 rounded text-zinc-400 hover:text-zinc-700"
                                                >
                                                    <Eye size={13} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl">
                        <Link
                            to="/admin/properties"
                            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                        >
                            <span>Browse Auction Directory</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filter by Institution Strip */}
            <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-700">
                        Quick Filter by Lending Bank
                    </span>
                    <Link
                        to="/admin/banks"
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                    >
                        All {totalBanks} banks →
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {[
                        { name: "All Notices", count: totalProperties, query: "" },
                        ...(stats?.banksBreakdown || []).slice(0, 8).map((b) => ({
                            name: b._id,
                            count: b.count,
                            query: b._id
                        }))
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() =>
                                navigate(item.query ? `/admin/properties?bank=${encodeURIComponent(item.query)}` : "/admin/properties")
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                        >
                            <span>{item.name}</span>
                            <span className="text-[11px] text-gray-400 tabular-nums">
                                {item.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Analytical Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 min-w-0">
                    <ValuationTrendAreaChart stats={stats} />
                </div>
                <div className="lg:col-span-5 min-w-0">
                    <AssetTypeDonutChart stats={stats} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-w-0">
                    <PriceBracketHistogramChart stats={stats} />
                </div>
                <div className="min-w-0">
                    <LeadConversionFunnelChart stats={stats} />
                </div>
            </div>

            <div className="min-w-0">
                <BankShareBarChart stats={stats} />
            </div>

            {/* Footer Operational Bar */}
            <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-zinc-600">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-medium text-zinc-900">SARFAESI Crawler Service</span>
                    <span className="text-zinc-300">·</span>
                    <span>Automated synchronization active across {totalBanks} institutions</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        to="/admin/audit-logs"
                        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition"
                    >
                        <History size={13} className="text-zinc-400" />
                        <span>Audit Log</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
