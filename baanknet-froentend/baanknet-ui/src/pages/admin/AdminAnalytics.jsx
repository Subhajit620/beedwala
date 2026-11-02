import React, { useEffect, useState, useCallback } from "react";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import { fetchAdminDashboardStats, exportPropertiesData } from "../../services/adminService";
import { formatCompactINR } from "../../utils/formatters";
import { LoadingSpinner } from "../../components/Loading";
import { useApp } from "../../context/AppContext";
import {
    ValuationTrendAreaChart,
    BankShareBarChart,
    AssetTypeDonutChart,
    PriceBracketHistogramChart,
    LeadConversionFunnelChart
} from "../../components/admin/AdminVisualCharts";

export default function AdminAnalytics() {
    const { addToast } = useApp();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchAdminDashboardStats();
            if (res.success && res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error("Failed to load analytics:", err);
            addToast("Failed to load market analytics", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        loadAnalytics();
    }, [loadAnalytics]);

    const handleExport = async () => {
        try {
            addToast("Exporting valuation report as CSV...", "info");
            await exportPropertiesData("csv");
            addToast("Valuation report exported!", "success");
        } catch {
            addToast("Export failed", "error");
        }
    };

    if (loading) {
        return (
            <div className="py-24">
                <LoadingSpinner text="Generating real estate & valuation intelligence..." />
            </div>
        );
    }

    const totalValuation = stats?.valuation?.totalValuation || 0;
    const avgPrice = stats?.valuation?.avgPrice || 0;
    const maxPrice = stats?.valuation?.maxPrice || 0;
    const totalProperties = stats?.totalProperties || 0;
    const totalBanks = stats?.totalBanks || 0;
    const topBankNames = (stats?.banksBreakdown || [])
        .slice(0, 4)
        .map((b) => b._id)
        .filter(Boolean)
        .join(", ");

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Header with Title & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <BarChart3 className="text-amber-500" size={26} />
                        <span>Market Intelligence &amp; Valuation Analytics</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Live visual breakdown of portfolio reserve values, institutional bank volumes, price brackets, and buyer conversion.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAnalytics}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-amber-600" : "text-slate-500"} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 shadow-xs transition cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Top Valuation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Total Asset Valuation
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
                        {formatCompactINR(totalValuation)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        Combined reserve pricing across {totalProperties.toLocaleString("en-IN")} listings
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Average Property Value
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                        {formatCompactINR(avgPrice)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        Across all active &amp; indexed categories
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Highest Value Asset
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
                        {formatCompactINR(maxPrice)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                        Maximum reserve price in database
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Lending Institutions
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                        {totalBanks}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 truncate">
                        {topBankNames || "Authorized partner banks"}
                    </div>
                </div>
            </div>

            {/* Price Brackets Histogram & Lead Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceBracketHistogramChart stats={stats} />
                <LeadConversionFunnelChart stats={stats} />
            </div>

            {/* Growth Trend Area Chart & Asset Distribution Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    <ValuationTrendAreaChart stats={stats} />
                </div>
                <div className="lg:col-span-5">
                    <AssetTypeDonutChart stats={stats} />
                </div>
            </div>

            {/* Full Width Bank Share Bar Chart */}
            <div>
                <BankShareBarChart stats={stats} />
            </div>
        </div>
    );
}
