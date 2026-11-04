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
                <LoadingSpinner text="Loading real estate & valuation reports..." />
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
        <div className="space-y-6 animate-fade-in">
            {/* Header with Title & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-200/70 text-red-600 shrink-0">
                            <BarChart3 size={17} />
                        </div>
                        <span>Valuation &amp; Market Reports</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Portfolio reserve values, institutional bank volumes, price brackets, and buyer inquiry conversion.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadAnalytics}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-gray-500"} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition cursor-pointer"
                    >
                        <Download size={14} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Top Valuation Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <span className="text-xs font-semibold text-gray-500 block">
                        Total Asset Valuation
                    </span>
                    <div className="text-2xl font-bold text-red-600 mt-2 tabular-nums">
                        {formatCompactINR(totalValuation)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                        Combined reserve pricing across {totalProperties.toLocaleString("en-IN")} listings
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <span className="text-xs font-semibold text-gray-500 block">
                        Average Property Value
                    </span>
                    <div className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
                        {formatCompactINR(avgPrice)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                        Across all active &amp; indexed categories
                    </div>
                </div>

                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <span className="text-xs font-semibold text-gray-500 block">
                        Highest Value Asset
                    </span>
                    <div className="text-2xl font-bold text-red-700 mt-2 tabular-nums">
                        {formatCompactINR(maxPrice)}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">
                        Maximum reserve price in database
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <span className="text-xs font-semibold text-gray-500 block">
                        Lending Institutions
                    </span>
                    <div className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
                        {totalBanks}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 truncate">
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
