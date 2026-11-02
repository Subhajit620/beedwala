import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    Landmark,
    PieChart as PieIcon,
    BarChart3,
    Users,
    ArrowRight
} from "lucide-react";
import { formatCompactINR } from "../../utils/formatters";

const EMPTY_ARRAY = [];

const CHART_PALETTE = [
    { bg: "bg-amber-500", text: "text-amber-500", stroke: "#f59e0b" },
    { bg: "bg-blue-500", text: "text-blue-500", stroke: "#3b82f6" },
    { bg: "bg-emerald-500", text: "text-emerald-500", stroke: "#10b981" },
    { bg: "bg-purple-500", text: "text-purple-500", stroke: "#a855f7" },
    { bg: "bg-rose-500", text: "text-rose-500", stroke: "#f43f5e" },
    { bg: "bg-indigo-500", text: "text-indigo-500", stroke: "#6366f1" },
    { bg: "bg-teal-500", text: "text-teal-500", stroke: "#14b8a6" },
    { bg: "bg-slate-400", text: "text-slate-500", stroke: "#94a3b8" }
];

const BRACKET_COLORS = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-rose-500"
];

function shortenLabel(label, maxLen = 14) {
    if (!label) return "N/A";
    const clean = String(label)
        .replace(/^State Bank of India$/i, "SBI")
        .replace(/^Punjab National Bank$/i, "PNB")
        .replace(/^Bank of Baroda$/i, "Bank of Baroda")
        .replace(/^Bank of India$/i, "Bank of India")
        .replace(/^Union Bank of India$/i, "Union Bank")
        .replace(/^Indian Overseas Bank$/i, "IOB")
        .replace(/^Central Bank of India$/i, "Central Bank");
    return clean.length > maxLen ? `${clean.slice(0, maxLen - 1)}…` : clean;
}

/**
 * 1. Real Valuation & Listings Distribution / Trend Area Chart
 * Uses 100% live MongoDB data (Monthly Timeline, Top Partner Banks, or Top Localities)
 */
export function ValuationTrendAreaChart({ stats, data }) {
    const monthlyTrend = stats?.monthlyTrend || data || EMPTY_ARRAY;
    const banksBreakdown = stats?.banksBreakdown || EMPTY_ARRAY;
    const localitiesBreakdown = stats?.localitiesBreakdown || EMPTY_ARRAY;

    // Default to "timeline" if there are >= 3 distinct months, otherwise "banks" for a rich multi-point curve
    const [viewMode, setViewMode] = useState(() =>
        monthlyTrend.length >= 3 ? "timeline" : "banks"
    );
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const points = useMemo(() => {
        if (viewMode === "timeline" && monthlyTrend.length > 0) {
            return monthlyTrend.slice(-8).map((m) => ({
                label: m.month || m.monthKey,
                fullName: `Month: ${m.month || m.monthKey}`,
                listings: Number(m.listings || 0),
                monthlyListings: Number(m.monthlyListings || m.listings || 0),
                valuationCr: Number(m.valuationCr || 0),
                rawValuation: Number(m.valuationCr || 0) * 10000000
            }));
        }

        if (viewMode === "localities" && localitiesBreakdown.length > 0) {
            return localitiesBreakdown.slice(0, 7).map((loc) => ({
                label: shortenLabel(loc._id, 11),
                fullName: loc._id,
                listings: Number(loc.count || 0),
                valuationCr: Number(((loc.totalValuation || 0) / 10000000).toFixed(2)),
                rawValuation: Number(loc.totalValuation || 0)
            }));
        }

        // Default: "banks" — real top banks from MongoDB
        if (banksBreakdown.length > 0) {
            return banksBreakdown.slice(0, 7).map((b) => ({
                label: shortenLabel(b._id, 11),
                fullName: b._id,
                listings: Number(b.count || 0),
                valuationCr: Number(((b.totalValuation || 0) / 10000000).toFixed(2)),
                rawValuation: Number(b.totalValuation || 0)
            }));
        }

        return [];
    }, [viewMode, monthlyTrend, banksBreakdown, localitiesBreakdown]);

    const safeHoveredIdx =
        hoveredIndex !== null && hoveredIndex < points.length
            ? hoveredIndex
            : points.length > 0
            ? 0
            : null;
    const activePoint = safeHoveredIdx !== null ? points[safeHoveredIdx] : null;

    const maxListings = Math.max(1, ...points.map((p) => p.listings)) * 1.15;
    const maxValCr = Math.max(1, ...points.map((p) => p.valuationCr)) * 1.15;

    const svgWidth = 620;
    const svgHeight = 225;
    const paddingX = 44;
    const paddingY = 32;

    const getX = (idx) => {
        if (points.length <= 1) return svgWidth / 2;
        return paddingX + (idx / (points.length - 1)) * (svgWidth - paddingX * 2);
    };
    const getYListings = (val) =>
        svgHeight - paddingY - (val / maxListings) * (svgHeight - paddingY * 2);
    const getYValuation = (valCr) =>
        svgHeight - paddingY - (valCr / maxValCr) * (svgHeight - paddingY * 2);

    const listingsPathD = points.reduce((acc, p, idx) => {
        const x = getX(idx);
        const y = getYListings(p.listings);
        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");

    const valuationPathD = points.reduce((acc, p, idx) => {
        const x = getX(idx);
        const y = getYValuation(p.valuationCr);
        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");

    const areaD =
        points.length > 1
            ? `${listingsPathD} L ${getX(points.length - 1)} ${svgHeight - paddingY} L ${getX(0)} ${svgHeight - paddingY} Z`
            : "";

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-amber-500 shrink-0" />
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Live Portfolio Volume &amp; Valuation Graph
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                        100% real database metrics across partner banks, localities, and notice dates
                    </p>
                </div>

                {/* Perspective Switcher Pills */}
                <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("banks");
                            setHoveredIndex(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            viewMode === "banks"
                                ? "bg-slate-950 text-amber-400 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        By Bank
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("localities");
                            setHoveredIndex(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            viewMode === "localities"
                                ? "bg-slate-950 text-amber-400 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        By Locality
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("timeline");
                            setHoveredIndex(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            viewMode === "timeline"
                                ? "bg-slate-950 text-amber-400 shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        Timeline ({monthlyTrend.length})
                    </button>
                </div>
            </div>

            {/* Active Real Stat Callout + Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {activePoint ? (
                    <div className="flex flex-wrap items-baseline gap-4 sm:gap-6">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate max-w-[220px]">
                                {activePoint.fullName}
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900">
                                {activePoint.listings.toLocaleString("en-IN")} Notices
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Real Reserve Valuation
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-600">
                                {formatCompactINR(activePoint.rawValuation)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-slate-400">No data points available in database.</div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                        <span>Listings</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                        <span>Valuation (₹ Cr)</span>
                    </div>
                </div>
            </div>

            {/* SVG Interactive Dual-Curve Area Chart */}
            {points.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
                    No property records found for this view.
                </div>
            ) : (
                <div className="relative w-full overflow-hidden">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-48 sm:h-56 overflow-visible"
                    >
                        <defs>
                            <linearGradient id="amberRealGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal Grid lines with Y-axis scale labels */}
                        {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                            const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                            const yVal = Math.round(maxListings * pct);
                            return (
                                <g key={i}>
                                    <line
                                        x1={paddingX}
                                        y1={y}
                                        x2={svgWidth - paddingX}
                                        y2={y}
                                        stroke="#f1f5f9"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x={paddingX - 6}
                                        y={y + 3}
                                        textAnchor="end"
                                        className="text-[9px] font-semibold fill-slate-400 select-none"
                                    >
                                        {yVal}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Area fill for Listings */}
                        {areaD && <path d={areaD} fill="url(#amberRealGradient)" />}

                        {/* Valuation Curve (Emerald dashed line) */}
                        {points.length > 1 && (
                            <path
                                d={valuationPathD}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
                                strokeDasharray="5 4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Listings Curve (Amber solid line) */}
                        {points.length > 1 && (
                            <path
                                d={listingsPathD}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {/* Interactive Points */}
                        {points.map((p, idx) => {
                            const x = getX(idx);
                            const yL = getYListings(p.listings);
                            const yV = getYValuation(p.valuationCr);
                            const isHovered = safeHoveredIdx === idx;

                            return (
                                <g key={idx} className="cursor-pointer">
                                    {/* Vertical guide line on active point */}
                                    {isHovered && (
                                        <line
                                            x1={x}
                                            y1={paddingY / 2}
                                            x2={x}
                                            y2={svgHeight - paddingY}
                                            stroke="#cbd5e1"
                                            strokeWidth="1"
                                            strokeDasharray="3 3"
                                        />
                                    )}

                                    {/* Valuation Dot (Emerald) */}
                                    <circle
                                        cx={x}
                                        cy={yV}
                                        r={isHovered ? 5.5 : 4}
                                        className={
                                            isHovered
                                                ? "fill-emerald-600 stroke-white stroke-2"
                                                : "fill-white stroke-emerald-500 stroke-2"
                                        }
                                    />

                                    {/* Listings Dot (Amber) */}
                                    <circle
                                        cx={x}
                                        cy={yL}
                                        r={isHovered ? 7 : 5}
                                        className={`${
                                            isHovered
                                                ? "fill-slate-950 stroke-amber-400 stroke-2"
                                                : "fill-white stroke-amber-500 stroke-2"
                                        } transition-all duration-150`}
                                    />

                                    {/* Value Pill above hovered point */}
                                    {isHovered && (
                                        <text
                                            x={x}
                                            y={Math.max(14, Math.min(yL, yV) - 10)}
                                            textAnchor="middle"
                                            className="text-[10px] font-black fill-slate-900 select-none"
                                        >
                                            {p.listings} • ₹{p.valuationCr}Cr
                                        </text>
                                    )}

                                    {/* Invisible hover/tap hit area */}
                                    <rect
                                        x={x - 28}
                                        y={0}
                                        width={56}
                                        height={svgHeight}
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onClick={() => setHoveredIndex(idx)}
                                    />

                                    {/* X-axis Label */}
                                    <text
                                        x={x}
                                        y={svgHeight - 8}
                                        textAnchor="middle"
                                        className={`text-[10px] font-bold select-none ${
                                            isHovered ? "fill-slate-950 font-black" : "fill-slate-500"
                                        }`}
                                    >
                                        {p.label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
        </div>
    );
}

/**
 * 2. Bank Market Share Visual Bar Chart (100% Real MongoDB Data)
 */
export function BankShareBarChart({ stats, banksData }) {
    const navigate = useNavigate();
    const [showAllBanks, setShowAllBanks] = useState(false);

    const rawBanks = stats?.banksBreakdown || banksData || EMPTY_ARRAY;
    const totalProperties =
        stats?.totalProperties ||
        rawBanks.reduce((acc, b) => acc + Number(b.count || 0), 0) ||
        1;
    const totalBanksCount = stats?.totalBanks || rawBanks.length;

    const formattedBanks = useMemo(() => {
        if (!Array.isArray(rawBanks) || rawBanks.length === 0) return [];

        const normalized = rawBanks.map((b, idx) => {
            const name = b._id || b.name || "Unknown Bank";
            const count = Number(b.count || 0);
            const totalValuation = Number(b.totalValuation || 0);
            const percent = Number(((count / totalProperties) * 100).toFixed(1));
            const palette = CHART_PALETTE[idx % CHART_PALETTE.length];
            return {
                name,
                count,
                totalValuation,
                percent,
                color: b.color || palette.bg,
                isFilterable: true
            };
        });

        if (showAllBanks || normalized.length <= 6) {
            return normalized;
        }

        const topFive = normalized.slice(0, 5);
        const rest = normalized.slice(5);
        const restCount = rest.reduce((acc, item) => acc + item.count, 0);
        const restValuation = rest.reduce((acc, item) => acc + item.totalValuation, 0);
        const restPercent = Number(((restCount / totalProperties) * 100).toFixed(1));

        return [
            ...topFive,
            {
                name: `Other ${rest.length} Partner Banks`,
                count: restCount,
                totalValuation: restValuation,
                percent: restPercent,
                color: "bg-slate-400",
                isFilterable: false
            }
        ];
    }, [rawBanks, totalProperties, showAllBanks]);

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Landmark size={18} className="text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Partner Bank Share Breakdown
                        </h3>
                        <p className="text-xs text-slate-400">
                            Live notice volume &amp; reserve valuation across {totalBanksCount} lending banks
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {rawBanks.length > 6 && (
                        <button
                            type="button"
                            onClick={() => setShowAllBanks((prev) => !prev)}
                            className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full transition cursor-pointer"
                        >
                            {showAllBanks ? "Show Top 5" : `Show All (${rawBanks.length})`}
                        </button>
                    )}
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        {totalBanksCount} Institutions
                    </span>
                </div>
            </div>

            {formattedBanks.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                    No bank records found in database.
                </div>
            ) : (
                <>
                    {/* Progress Stack Bar */}
                    <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-2xs">
                        {formattedBanks.map((b, i) => (
                            <div
                                key={i}
                                className={`${b.color} h-full transition-all duration-500 cursor-pointer hover:opacity-85`}
                                style={{ width: `${Math.max(b.percent, 1)}%` }}
                                onClick={() =>
                                    b.isFilterable
                                        ? navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)
                                        : setShowAllBanks(true)
                                }
                                title={`${b.name}: ${b.count} notices (${b.percent}%) • ${formatCompactINR(b.totalValuation)}`}
                            />
                        ))}
                    </div>

                    {/* Bank Listing Bars with Click-To-Filter */}
                    <div className="space-y-2 pt-1">
                        {formattedBanks.map((b, idx) => (
                            <div
                                key={idx}
                                onClick={() =>
                                    b.isFilterable
                                        ? navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)
                                        : setShowAllBanks(true)
                                }
                                className="space-y-1 p-2 rounded-xl hover:bg-amber-50/60 transition cursor-pointer group"
                                title={
                                    b.isFilterable
                                        ? `View ${b.name} auction notices`
                                        : "Click to expand all partner banks"
                                }
                            >
                                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                                    <span className="text-slate-800 flex items-center gap-2 truncate group-hover:text-amber-700 min-w-0">
                                        <span className={`h-2.5 w-2.5 rounded-full ${b.color} shrink-0`} />
                                        <span className="truncate">{b.name}</span>
                                    </span>
                                    <span className="text-slate-900 font-bold shrink-0 flex items-center gap-2 group-hover:text-amber-700">
                                        {b.totalValuation > 0 && (
                                            <span className="text-[11px] font-bold text-emerald-600 hidden sm:inline">
                                                {formatCompactINR(b.totalValuation)}
                                            </span>
                                        )}
                                        <span>
                                            {b.count.toLocaleString("en-IN")} ({b.percent}%)
                                        </span>
                                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition" />
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${b.color}`}
                                        style={{ width: `${Math.min(100, Math.max(b.percent, 1.5))}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <span>💡 Tap any bank row to filter its notices directly</span>
                <span
                    className="text-amber-600 font-bold hover:underline cursor-pointer"
                    onClick={() => navigate("/admin/banks")}
                >
                    Manage All {totalBanksCount} Banks →
                </span>
            </div>
        </div>
    );
}

/**
 * 3. Asset Type Distribution Donut / Radial Chart (100% Real MongoDB Data + Dynamic SVG Ring)
 */
export function AssetTypeDonutChart({ stats, typesData }) {
    const navigate = useNavigate();
    const rawTypes = stats?.typesBreakdown || typesData || EMPTY_ARRAY;
    const rawSubTypes = stats?.subTypesBreakdown || EMPTY_ARRAY;

    // Default to subTypes if types has only 1 category and subTypes has more variety, while allowing toggle
    const [groupBy, setGroupBy] = useState(() =>
        rawTypes.length <= 1 && rawSubTypes.length > 1 ? "subType" : "type"
    );

    const activeSource = groupBy === "subType" && rawSubTypes.length > 0 ? rawSubTypes : rawTypes;

    const { slices, total } = useMemo(() => {
        const sum = activeSource.reduce((acc, item) => acc + Number(item.count || 0), 0);
        if (sum === 0) return { slices: [], total: 0 };

        const topItems = activeSource.slice(0, 5);
        const restItems = activeSource.slice(5);
        const list = [...topItems];

        if (restItems.length > 0) {
            list.push({
                _id: "Other Categories",
                count: restItems.reduce((a, b) => a + Number(b.count || 0), 0),
                totalValuation: restItems.reduce((a, b) => a + Number(b.totalValuation || 0), 0),
                isOther: true
            });
        }

        const circumference = 2 * Math.PI * 38; // ~238.76
        let accumulatedPercent = 0;

        const computed = list.map((item, idx) => {
            const label = item._id || item.label || "Uncategorized";
            const count = Number(item.count || 0);
            const totalValuation = Number(item.totalValuation || 0);
            const rawPct = (count / sum) * 100;
            const percent = Number(rawPct.toFixed(1));
            const arcLength = (rawPct / 100) * circumference;
            const dashOffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += rawPct;

            const palette = CHART_PALETTE[idx % CHART_PALETTE.length];
            return {
                label,
                count,
                totalValuation,
                percent,
                colorBg: palette.bg,
                stroke: item.stroke || palette.stroke,
                dashArray: `${arcLength.toFixed(2)} ${circumference.toFixed(2)}`,
                dashOffset: dashOffset.toFixed(2),
                isOther: Boolean(item.isOther)
            };
        });

        return { slices: computed, total: sum };
    }, [activeSource]);

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs card-hover-effect space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <PieIcon size={18} className="text-amber-500 shrink-0" />
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900">
                                Asset Category Distribution
                            </h3>
                            <p className="text-xs text-slate-400">
                                Real database breakdown by property classification
                            </p>
                        </div>
                    </div>

                    {rawSubTypes.length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setGroupBy("type")}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    groupBy === "type"
                                        ? "bg-slate-950 text-amber-400 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Category ({rawTypes.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setGroupBy("subType")}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                    groupBy === "subType"
                                        ? "bg-slate-950 text-amber-400 shadow-2xs"
                                        : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                Sub-Type ({rawSubTypes.length})
                            </button>
                        </div>
                    )}
                </div>

                {slices.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                        No property categories found in database.
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-5 sm:gap-6 pt-2">
                        {/* Dynamic Visual Donut Ring SVG */}
                        <div className="relative h-32 w-32 sm:h-36 sm:w-36 shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="38"
                                    fill="transparent"
                                    stroke="#f1f5f9"
                                    strokeWidth="14"
                                />
                                {slices.map((s, idx) => (
                                    <circle
                                        key={idx}
                                        cx="50"
                                        cy="50"
                                        r="38"
                                        fill="transparent"
                                        stroke={s.stroke}
                                        strokeWidth="14"
                                        strokeDasharray={s.dashArray}
                                        strokeDashoffset={s.dashOffset}
                                        className="transition-all duration-500"
                                    />
                                ))}
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-lg font-black text-slate-900 leading-none">
                                    {total.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                    Notices
                                </span>
                            </div>
                        </div>

                        {/* Legend Pills Grid with Click-To-Filter */}
                        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex-1">
                            {slices.map((t, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (!t.isOther) {
                                            const param = groupBy === "subType" ? "subType" : "type";
                                            navigate(`/admin/properties?${param}=${encodeURIComponent(t.label)}`);
                                        } else {
                                            navigate("/admin/properties");
                                        }
                                    }}
                                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 transition cursor-pointer text-xs group"
                                    title={`Filter properties by ${t.label} (${formatCompactINR(t.totalValuation)})`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${t.colorBg}`} />
                                        <span className="font-bold text-slate-800 group-hover:text-amber-700 truncate">
                                            {t.label}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-baseline justify-between gap-1">
                                        <span className="font-black text-slate-900">
                                            {t.count.toLocaleString("en-IN")}
                                        </span>
                                        <span className="font-bold text-slate-500 text-[11px]">{t.percent}%</span>
                                    </div>
                                    {t.totalValuation > 0 && (
                                        <div className="text-[10px] font-semibold text-emerald-600 truncate mt-0.5">
                                            {formatCompactINR(t.totalValuation)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                💡 Tap any category card above to view its filtered properties
            </div>
        </div>
    );
}

/**
 * 4. Price Bracket Histogram / Distribution Chart (100% Real MongoDB Data)
 */
export function PriceBracketHistogramChart({ stats }) {
    const navigate = useNavigate();
    const rawBrackets = stats?.priceBrackets || EMPTY_ARRAY;

    const brackets = useMemo(() => {
        if (rawBrackets.length > 0) {
            return rawBrackets.map((b, idx) => ({
                ...b,
                color: BRACKET_COLORS[idx % BRACKET_COLORS.length]
            }));
        }
        return [
            { label: "< ₹25L", count: 0, percent: 0, totalValuation: 0, minPrice: 0, maxPrice: 2500000, color: "bg-emerald-500" },
            { label: "₹25L–50L", count: 0, percent: 0, totalValuation: 0, minPrice: 2500000, maxPrice: 5000000, color: "bg-blue-500" },
            { label: "₹50L–1Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 5000000, maxPrice: 10000000, color: "bg-amber-500" },
            { label: "₹1Cr–5Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 10000000, maxPrice: 50000000, color: "bg-purple-500" },
            { label: "> ₹5 Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 50000000, maxPrice: null, color: "bg-rose-500" }
        ];
    }, [rawBrackets]);

    const totalPriced = brackets.reduce((acc, b) => acc + Number(b.count || 0), 0);
    const under50LCount = (brackets[0]?.count || 0) + (brackets[1]?.count || 0);
    const under50LPercent = totalPriced > 0 ? Math.round((under50LCount / totalPriced) * 100) : 0;
    const maxCount = Math.max(1, ...brackets.map((b) => Number(b.count || 0)));

    const handleBracketClick = (b) => {
        const params = new URLSearchParams();
        if (b.minPrice != null) params.set("minPrice", b.minPrice);
        if (b.maxPrice != null) params.set("maxPrice", b.maxPrice);
        navigate(`/admin/properties?${params.toString()}`);
    };

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Reserve Price Brackets
                        </h3>
                        <p className="text-xs text-slate-400">
                            Live inventory distribution across {totalPriced.toLocaleString("en-IN")} priced notices
                        </p>
                    </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {under50LPercent}% Under ₹50L
                </span>
            </div>

            {/* Vertical Bar Histogram */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 pt-4 items-end h-48">
                {brackets.map((b, idx) => {
                    const heightPct = b.count > 0 ? Math.max(6, Math.round((b.count / maxCount) * 100)) : 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleBracketClick(b)}
                            className="flex flex-col items-center justify-end h-full group min-w-0 cursor-pointer"
                            title={`${b.label}: ${b.count} listings (${b.percent}%) • ${formatCompactINR(b.totalValuation || 0)}`}
                        >
                            <span className="text-[10px] sm:text-xs font-black text-slate-900 group-hover:text-amber-600 transition">
                                {b.count.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 mb-1">
                                {b.percent}%
                            </span>
                            <div className="w-full rounded-xl bg-slate-100 group-hover:bg-amber-50/60 overflow-hidden h-32 flex items-end p-1 transition">
                                <div
                                    className={`w-full ${b.color} rounded-lg transition-all duration-500 group-hover:brightness-110 shadow-xs`}
                                    style={{ height: `${heightPct}%` }}
                                />
                            </div>
                            <span className="mt-2 text-[9px] sm:text-[10px] font-bold text-slate-700 group-hover:text-amber-700 text-center truncate w-full">
                                {b.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                💡 Tap any price bracket bar to view listings in that reserve price range
            </div>
        </div>
    );
}

/**
 * 5. Real Buyer Inquiry & Lead Conversion Funnel (100% Real MongoDB Inquiry Data)
 */
export function LeadConversionFunnelChart({ stats }) {
    const navigate = useNavigate();

    const breakdown = stats?.inquiriesBreakdown;
    const total = Number(breakdown?.total ?? stats?.totalInquiries ?? 0);
    const byStatus = breakdown?.byStatus || {};
    const byType = breakdown?.byType || {};

    const newCount = Number(byStatus.new ?? stats?.newInquiries ?? 0);
    const activeFollowUpCount = Number(byStatus.contacted || 0) + Number(byStatus.in_progress || 0);
    const closedConvertedCount = Number(byStatus.converted || 0) + Number(byStatus.closed || 0);
    const actionedTotal = activeFollowUpCount + closedConvertedCount;

    const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);
    const responseRate = getPct(actionedTotal);

    const stages = [
        {
            label: "1. Total Buyer Leads Captured",
            count: total,
            pct: total > 0 ? 100 : 0,
            color: "bg-blue-500",
            statusFilter: "all"
        },
        {
            label: "2. New / Awaiting Response",
            count: newCount,
            pct: getPct(newCount),
            color: "bg-rose-500",
            statusFilter: "new"
        },
        {
            label: "3. Contacted & In Progress",
            count: activeFollowUpCount,
            pct: getPct(activeFollowUpCount),
            color: "bg-amber-500",
            statusFilter: "contacted"
        },
        {
            label: "4. Converted / Closed Deals",
            count: closedConvertedCount,
            pct: getPct(closedConvertedCount),
            color: "bg-emerald-500",
            statusFilter: "closed"
        }
    ];

    const sourcePills = [
        { label: "Visitor Sign-Ins", count: Number(byType.visitor_login || 0) },
        { label: "Auction Inquiries", count: Number(byType.property_inquiry || 0) },
        { label: "Fresh Property", count: Number(byType.fresh_property || 0) },
        { label: "Contact Desk", count: Number(byType.contact_message || 0) }
    ];

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-amber-500 shrink-0" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Buyer Leads &amp; CRM Pipeline
                        </h3>
                        <p className="text-xs text-slate-400">
                            Live status breakdown across {total} registered buyer leads
                        </p>
                    </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {responseRate}% Actioned Rate
                </span>
            </div>

            <div className="space-y-3 pt-1">
                {stages.map((stage, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate("/admin/inquiries")}
                        className="space-y-1 cursor-pointer group"
                        title="Click to open Buyer Leads CRM"
                    >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold">
                            <span className="text-slate-800 group-hover:text-amber-700 truncate transition">
                                {stage.label}
                            </span>
                            <span className="text-slate-900 shrink-0">
                                {stage.count} Leads ({stage.pct}%)
                            </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                                style={{ width: `${stage.count > 0 ? Math.max(stage.pct, 4) : 0}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Real Lead Source Pills */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sourcePills.map((src, i) => (
                    <div
                        key={i}
                        onClick={() => navigate("/admin/inquiries")}
                        className="rounded-xl bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-center hover:border-amber-300 cursor-pointer transition"
                    >
                        <div className="text-xs font-black text-slate-900">{src.count}</div>
                        <div className="text-[10px] font-semibold text-slate-500 truncate">{src.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
