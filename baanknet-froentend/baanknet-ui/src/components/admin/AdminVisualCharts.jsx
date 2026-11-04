import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatCompactINR } from "../../utils/formatters";

const EMPTY_ARRAY = [];

// Institutional Gray & Red Palette
const CHART_PALETTE = [
    { bg: "bg-red-600", text: "text-red-600", stroke: "#dc2626" },
    { bg: "bg-gray-700", text: "text-gray-700", stroke: "#374151" },
    { bg: "bg-red-500", text: "text-red-500", stroke: "#ef4444" },
    { bg: "bg-gray-500", text: "text-gray-600", stroke: "#6b7280" },
    { bg: "bg-red-800", text: "text-red-800", stroke: "#991b1b" },
    { bg: "bg-red-400", text: "text-red-500", stroke: "#f87171" },
    { bg: "bg-gray-300", text: "text-gray-500", stroke: "#d1d5db" }
];

const BRACKET_COLORS = [
    "bg-gray-400",
    "bg-gray-600",
    "bg-red-500",
    "bg-red-600",
    "bg-red-800"
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
 * 1. Valuation & Listings Volume Area Chart
 */
export function ValuationTrendAreaChart({ stats, data }) {
    const monthlyTrend = stats?.monthlyTrend || data || EMPTY_ARRAY;
    const banksBreakdown = stats?.banksBreakdown || EMPTY_ARRAY;
    const localitiesBreakdown = stats?.localitiesBreakdown || EMPTY_ARRAY;

    const [viewMode, setViewMode] = useState(() =>
        monthlyTrend.length >= 3 ? "timeline" : "banks"
    );
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const points = useMemo(() => {
        if (viewMode === "timeline" && monthlyTrend.length > 0) {
            return monthlyTrend.slice(-8).map((m) => ({
                label: m.month || m.monthKey,
                fullName: `Period: ${m.month || m.monthKey}`,
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
    const svgHeight = 220;
    const paddingX = 42;
    const paddingY = 30;

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
        <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Portfolio Volume &amp; Valuation
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Notice count and cumulative reserve value across active segments
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 bg-zinc-100 p-0.5 rounded-lg self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("banks");
                            setHoveredIndex(null);
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                            viewMode === "banks"
                                ? "bg-white text-zinc-900 shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900"
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
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                            viewMode === "localities"
                                ? "bg-white text-zinc-900 shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900"
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
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                            viewMode === "timeline"
                                ? "bg-white text-zinc-900 shadow-2xs"
                                : "text-zinc-600 hover:text-zinc-900"
                        }`}
                    >
                        Timeline ({monthlyTrend.length})
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                {activePoint ? (
                    <div className="flex flex-wrap items-baseline gap-6">
                        <div>
                            <span className="text-[11px] font-medium text-zinc-500 block truncate max-w-[220px]">
                                {activePoint.fullName}
                            </span>
                            <span className="text-xl font-semibold text-zinc-900 tabular-nums">
                                {activePoint.listings.toLocaleString("en-IN")} notices
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] font-medium text-zinc-500 block">
                                Reserve Valuation
                            </span>
                            <span className="text-xl font-semibold text-zinc-900 tabular-nums">
                                {formatCompactINR(activePoint.rawValuation)}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-zinc-400">No data points available.</div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="h-2.5 w-2.5 rounded-xs bg-red-600 inline-block" />
                        <span>Listings</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                        <span className="h-2.5 w-2.5 rounded-xs bg-gray-600 inline-block" />
                        <span>Valuation (₹ Cr)</span>
                    </div>
                </div>
            </div>

            {points.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-gray-100">
                    No property records found for this view.
                </div>
            ) : (
                <div className="relative w-full overflow-hidden">
                    <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-48 sm:h-52 overflow-visible"
                    >
                        <defs>
                            <linearGradient id="zincAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.0" />
                            </linearGradient>
                        </defs>

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
                                        stroke="#f3f4f6"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={paddingX - 8}
                                        y={y + 3}
                                        textAnchor="end"
                                        className="text-[9px] font-medium fill-gray-400 select-none tabular-nums"
                                    >
                                        {yVal}
                                    </text>
                                </g>
                            );
                        })}

                        {areaD && <path d={areaD} fill="url(#zincAreaGradient)" />}

                        {points.length > 1 && (
                            <path
                                d={valuationPathD}
                                fill="none"
                                stroke="#4b5563"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {points.length > 1 && (
                            <path
                                d={listingsPathD}
                                fill="none"
                                stroke="#dc2626"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}

                        {points.map((p, idx) => {
                            const x = getX(idx);
                            const yL = getYListings(p.listings);
                            const yV = getYValuation(p.valuationCr);
                            const isHovered = safeHoveredIdx === idx;

                            return (
                                <g key={idx} className="cursor-pointer">
                                    {isHovered && (
                                        <line
                                            x1={x}
                                            y1={paddingY / 2}
                                            x2={x}
                                            y2={svgHeight - paddingY}
                                            stroke="#d1d5db"
                                            strokeWidth="1"
                                        />
                                    )}

                                    <circle
                                        cx={x}
                                        cy={yV}
                                        r={isHovered ? 4.5 : 3.5}
                                        className={
                                            isHovered
                                                ? "fill-gray-700 stroke-white stroke-2"
                                                : "fill-white stroke-gray-600 stroke-2"
                                        }
                                    />

                                    <circle
                                        cx={x}
                                        cy={yL}
                                        r={isHovered ? 5.5 : 4}
                                        className={`${
                                            isHovered
                                                ? "fill-red-600 stroke-white stroke-2"
                                                : "fill-white stroke-red-600 stroke-2"
                                        } transition-all duration-150`}
                                    />

                                    {isHovered && (
                                        <text
                                            x={x}
                                            y={Math.max(14, Math.min(yL, yV) - 10)}
                                            textAnchor="middle"
                                            className="text-[10px] font-semibold fill-zinc-900 select-none tabular-nums"
                                        >
                                            {p.listings} · ₹{p.valuationCr}Cr
                                        </text>
                                    )}

                                    <rect
                                        x={x - 28}
                                        y={0}
                                        width={56}
                                        height={svgHeight}
                                        fill="transparent"
                                        onMouseEnter={() => setHoveredIndex(idx)}
                                        onClick={() => setHoveredIndex(idx)}
                                    />

                                    <text
                                        x={x}
                                        y={svgHeight - 8}
                                        textAnchor="middle"
                                        className={`text-[10px] select-none ${
                                            isHovered ? "fill-zinc-900 font-semibold" : "fill-zinc-500 font-medium"
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
 * 2. Partner Bank Share Breakdown
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
                name: `Other ${rest.length} institutions`,
                count: restCount,
                totalValuation: restValuation,
                percent: restPercent,
                color: "bg-zinc-300",
                isFilterable: false
            }
        ];
    }, [rawBanks, totalProperties, showAllBanks]);

    return (
        <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Inventory by Lending Institution
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Distribution across {totalBanksCount} partner banks
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {rawBanks.length > 6 && (
                        <button
                            type="button"
                            onClick={() => setShowAllBanks((prev) => !prev)}
                            className="text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-md transition cursor-pointer"
                        >
                            {showAllBanks ? "Show top 5" : `View all (${rawBanks.length})`}
                        </button>
                    )}
                </div>
            </div>

            {formattedBanks.length === 0 ? (
                <div className="py-10 text-center text-xs text-zinc-400">
                    No bank records found.
                </div>
            ) : (
                <>
                    <div className="h-2.5 w-full rounded-sm bg-zinc-100 overflow-hidden flex gap-0.5">
                        {formattedBanks.map((b, i) => (
                            <div
                                key={i}
                                className={`${b.color} h-full transition-all duration-300 cursor-pointer hover:opacity-80`}
                                style={{ width: `${Math.max(b.percent, 1)}%` }}
                                onClick={() =>
                                    b.isFilterable
                                        ? navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)
                                        : setShowAllBanks(true)
                                }
                                title={`${b.name}: ${b.count} notices (${b.percent}%)`}
                            />
                        ))}
                    </div>

                    <div className="divide-y divide-zinc-100">
                        {formattedBanks.map((b, idx) => (
                            <div
                                key={idx}
                                onClick={() =>
                                    b.isFilterable
                                        ? navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)
                                        : setShowAllBanks(true)
                                }
                                className="py-2.5 flex items-center justify-between gap-4 text-xs hover:bg-zinc-50 px-2 -mx-2 rounded-md transition cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`h-2 w-2 rounded-xs ${b.color} shrink-0`} />
                                    <span className="font-medium text-zinc-800 truncate group-hover:text-zinc-950">
                                        {b.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 shrink-0 tabular-nums">
                                    {b.totalValuation > 0 && (
                                        <span className="text-zinc-500 hidden sm:inline">
                                            {formatCompactINR(b.totalValuation)}
                                        </span>
                                    )}
                                    <span className="font-semibold text-zinc-900 w-20 text-right">
                                        {b.count.toLocaleString("en-IN")} ({b.percent}%)
                                    </span>
                                    <ArrowRight size={12} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * 3. Asset Category Distribution
 */
export function AssetTypeDonutChart({ stats, typesData }) {
    const navigate = useNavigate();
    const rawTypes = stats?.typesBreakdown || typesData || EMPTY_ARRAY;
    const rawSubTypes = stats?.subTypesBreakdown || EMPTY_ARRAY;

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

        const circumference = 2 * Math.PI * 38;
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
        <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                            Asset Classification
                        </h3>
                        <p className="text-xs text-zinc-500">
                            Share by property category
                        </p>
                    </div>

                    {rawSubTypes.length > 0 && (
                        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setGroupBy("type")}
                                className={`px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                    groupBy === "type"
                                        ? "bg-white text-zinc-900 shadow-2xs"
                                        : "text-zinc-600 hover:text-zinc-900"
                                }`}
                            >
                                Type
                            </button>
                            <button
                                type="button"
                                onClick={() => setGroupBy("subType")}
                                className={`px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                                    groupBy === "subType"
                                        ? "bg-white text-zinc-900 shadow-2xs"
                                        : "text-zinc-600 hover:text-zinc-900"
                                }`}
                            >
                                Sub-Type
                            </button>
                        </div>
                    )}
                </div>

                {slices.length === 0 ? (
                    <div className="py-12 text-center text-xs text-zinc-400">
                        No property categories found.
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-1">
                        <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="38"
                                    fill="transparent"
                                    stroke="#f4f4f5"
                                    strokeWidth="12"
                                />
                                {slices.map((s, idx) => (
                                    <circle
                                        key={idx}
                                        cx="50"
                                        cy="50"
                                        r="38"
                                        fill="transparent"
                                        stroke={s.stroke}
                                        strokeWidth="12"
                                        strokeDasharray={s.dashArray}
                                        strokeDashoffset={s.dashOffset}
                                        className="transition-all duration-500"
                                    />
                                ))}
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-base font-semibold text-zinc-900 leading-none tabular-nums">
                                    {total.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[10px] font-medium text-zinc-400 mt-0.5">
                                    Total
                                </span>
                            </div>
                        </div>

                        <div className="w-full sm:flex-1 divide-y divide-zinc-100">
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
                                    className="py-2 flex items-center justify-between gap-2 text-xs hover:bg-zinc-50 px-2 -mx-2 rounded-md cursor-pointer transition"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`h-2 w-2 rounded-xs shrink-0 ${t.colorBg}`} />
                                        <span className="font-medium text-zinc-800 truncate">
                                            {t.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 tabular-nums">
                                        <span className="font-semibold text-zinc-900">
                                            {t.count.toLocaleString("en-IN")}
                                        </span>
                                        <span className="text-zinc-400 w-10 text-right">{t.percent}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 4. Reserve Price Brackets Histogram
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
            { label: "< ₹25L", count: 0, percent: 0, totalValuation: 0, minPrice: 0, maxPrice: 2500000, color: "bg-zinc-800" },
            { label: "₹25L–50L", count: 0, percent: 0, totalValuation: 0, minPrice: 2500000, maxPrice: 5000000, color: "bg-zinc-700" },
            { label: "₹50L–1Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 5000000, maxPrice: 10000000, color: "bg-blue-600" },
            { label: "₹1Cr–5Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 10000000, maxPrice: 50000000, color: "bg-teal-700" },
            { label: "> ₹5 Cr", count: 0, percent: 0, totalValuation: 0, minPrice: 50000000, maxPrice: null, color: "bg-zinc-500" }
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
        <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Reserve Price Distribution
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Across {totalPriced.toLocaleString("en-IN")} priced notices
                    </p>
                </div>
                <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md tabular-nums">
                    {under50LPercent}% under ₹50L
                </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-3 pt-3 items-end h-44">
                {brackets.map((b, idx) => {
                    const heightPct = b.count > 0 ? Math.max(6, Math.round((b.count / maxCount) * 100)) : 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => handleBracketClick(b)}
                            className="flex flex-col items-center justify-end h-full group min-w-0 cursor-pointer"
                            title={`${b.label}: ${b.count} listings (${b.percent}%)`}
                        >
                            <span className="text-xs font-semibold text-zinc-900 tabular-nums">
                                {b.count.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-zinc-400 mb-1.5 tabular-nums">
                                {b.percent}%
                            </span>
                            <div className="w-full rounded-md bg-zinc-100 group-hover:bg-zinc-200/70 overflow-hidden h-28 flex items-end p-1 transition">
                                <div
                                    className={`w-full ${b.color} rounded-xs transition-all duration-300`}
                                    style={{ height: `${heightPct}%` }}
                                />
                            </div>
                            <span className="mt-2 text-[10px] font-medium text-zinc-600 text-center truncate w-full">
                                {b.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/**
 * 5. Buyer Inquiry Pipeline
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
            label: "Total Inquiries Received",
            count: total,
            pct: total > 0 ? 100 : 0,
            color: "bg-red-600"
        },
        {
            label: "New / Unread",
            count: newCount,
            pct: getPct(newCount),
            color: "bg-red-500"
        },
        {
            label: "Contacted / In Follow-Up",
            count: activeFollowUpCount,
            pct: getPct(activeFollowUpCount),
            color: "bg-gray-600"
        },
        {
            label: "Closed / Resolved",
            count: closedConvertedCount,
            pct: getPct(closedConvertedCount),
            color: "bg-gray-800"
        }
    ];

    const sourcePills = [
        { label: "Sign-Ins", count: Number(byType.visitor_login || 0) },
        { label: "Auction Leads", count: Number(byType.property_inquiry || 0) },
        { label: "Direct Sale", count: Number(byType.fresh_property || 0) },
        { label: "General", count: Number(byType.contact_message || 0) }
    ];

    return (
        <div className="rounded-xl border border-gray-200/70 bg-white/55 backdrop-blur-md p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                        Inquiry Pipeline
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Status across {total} buyer inquiries
                    </p>
                </div>
                <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-md tabular-nums">
                    {responseRate}% actioned
                </span>
            </div>

            <div className="space-y-3 pt-1">
                {stages.map((stage, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate("/admin/inquiries")}
                        className="space-y-1.5 cursor-pointer group"
                    >
                        <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-medium text-zinc-700 group-hover:text-zinc-950 truncate">
                                {stage.label}
                            </span>
                            <span className="font-semibold text-zinc-900 shrink-0 tabular-nums">
                                {stage.count} ({stage.pct}%)
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-xs bg-zinc-100 overflow-hidden">
                            <div
                                className={`h-full rounded-xs ${stage.color} transition-all duration-300`}
                                style={{ width: `${stage.count > 0 ? Math.max(stage.pct, 3) : 0}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sourcePills.map((src, i) => (
                    <div
                        key={i}
                        onClick={() => navigate("/admin/inquiries")}
                        className="rounded-lg bg-zinc-50 border border-zinc-200/70 px-2.5 py-2 hover:border-zinc-300 cursor-pointer transition"
                    >
                        <div className="text-xs font-semibold text-zinc-900 tabular-nums">{src.count}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{src.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
