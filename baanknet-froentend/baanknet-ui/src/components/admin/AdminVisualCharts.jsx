import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    Landmark,
    PieChart as PieIcon,
    BarChart3,
    Users,
    ArrowRight
} from "lucide-react";

/**
 * 1. Valuation & Listings Growth Trend (Interactive Area & Line Chart)
 */
export function ValuationTrendAreaChart({ data }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Sample/Live monthly trend data
    const points = data || [
        { month: "May", listings: 820, valuationCr: 410 },
        { month: "Jun", listings: 980, valuationCr: 520 },
        { month: "Jul", listings: 1140, valuationCr: 630 },
        { month: "Aug", listings: 1290, valuationCr: 710 },
        { month: "Sep", listings: 1410, valuationCr: 840 },
        { month: "Oct (Live)", listings: 1499, valuationCr: 928 }
    ];

    const maxListings = Math.max(...points.map((p) => p.listings)) * 1.15;
    const svgWidth = 600;
    const svgHeight = 220;
    const paddingX = 40;
    const paddingY = 30;

    const getX = (idx) => paddingX + (idx / (points.length - 1)) * (svgWidth - paddingX * 2);
    const getY = (val) => svgHeight - paddingY - (val / maxListings) * (svgHeight - paddingY * 2);

    // Area path
    const pathD = points.reduce((acc, p, idx) => {
        const x = getX(idx);
        const y = getY(p.listings);
        return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");

    const areaD = `${pathD} L ${getX(points.length - 1)} ${svgHeight - paddingY} L ${getX(0)} ${svgHeight - paddingY} Z`;

    const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-amber-500" />
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            SARFAESI Asset Inflow & Valuation Trend
                        </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                        Monthly growth of indexed bank auction notices and cumulative portfolio valuation
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span>
                        <span>Listings (Notices)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Valuation (₹ Cr)</span>
                    </div>
                </div>
            </div>

            {/* Active Stat Callout */}
            <div className="flex items-baseline gap-4 pt-1">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {activePoint.month} Volume
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                        {activePoint.listings.toLocaleString("en-IN")} Listings
                    </span>
                </div>
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Estimated Valuation
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                        ₹{activePoint.valuationCr} Cr
                    </span>
                </div>
            </div>

            {/* SVG Interactive Area Chart */}
            <div className="relative w-full overflow-hidden">
                <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-48 sm:h-56 overflow-visible"
                >
                    <defs>
                        <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    {[0.25, 0.5, 0.75, 1].map((pct, i) => {
                        const y = svgHeight - paddingY - pct * (svgHeight - paddingY * 2);
                        return (
                            <line
                                key={i}
                                x1={paddingX}
                                y1={y}
                                x2={svgWidth - paddingX}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Area fill */}
                    <path d={areaD} fill="url(#amberGradient)" />

                    {/* Curve line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points */}
                    {points.map((p, idx) => {
                        const x = getX(idx);
                        const y = getY(p.listings);
                        const isHovered = hoveredIndex === idx;

                        return (
                            <g key={idx} className="cursor-pointer">
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? 7 : 5}
                                    className={`${
                                        isHovered ? "fill-slate-950 stroke-amber-400 stroke-2" : "fill-white stroke-amber-500 stroke-2"
                                    } transition-all duration-150`}
                                />

                                {/* Invisible hover hit area */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={20}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />

                                {/* X-axis Label */}
                                <text
                                    x={x}
                                    y={svgHeight - 8}
                                    textAnchor="middle"
                                    className="text-[11px] font-bold fill-slate-400 select-none"
                                >
                                    {p.month}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

/**
 * 2. Bank Market Share Visual Bar Chart
 */
export function BankShareBarChart({ banksData }) {
    const navigate = useNavigate();
    const defaultBanks = [
        { name: "State Bank of India", count: 824, percent: 55, color: "bg-amber-500" },
        { name: "Punjab National Bank", count: 310, percent: 21, color: "bg-blue-500" },
        { name: "Bank of Baroda", count: 215, percent: 14, color: "bg-emerald-500" },
        { name: "Canara Bank", count: 98, percent: 7, color: "bg-purple-500" },
        { name: "Others (Union, Indian Bank, IDBI)", count: 52, percent: 3, color: "bg-slate-400" }
    ];

    const banks = banksData || defaultBanks;

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Landmark size={18} className="text-amber-500" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Partner Bank Share Breakdown
                        </h3>
                        <p className="text-xs text-slate-400">Notice volume distribution across authorized banks</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    13+ Institutions
                </span>
            </div>

            {/* Progress Stack Bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-2xs">
                {banks.map((b, i) => (
                    <div
                        key={i}
                        className={`${b.color} h-full transition-all duration-500 cursor-pointer hover:opacity-85`}
                        style={{ width: `${b.percent}%` }}
                        onClick={() => navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)}
                        title={`${b.name}: ${b.count} notices (${b.percent}%) — Click to filter`}
                    />
                ))}
            </div>

            {/* Bank Listing Bars with Click-To-Filter */}
            <div className="space-y-2.5 pt-1">
                {banks.map((b, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(`/admin/properties?bank=${encodeURIComponent(b.name)}`)}
                        className="space-y-1 p-2 rounded-xl hover:bg-amber-50/60 transition cursor-pointer group"
                        title={`View ${b.name} auction notices`}
                    >
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800 flex items-center gap-2 truncate group-hover:text-amber-700">
                                <span className={`h-2.5 w-2.5 rounded-full ${b.color} shrink-0`} />
                                <span className="truncate">{b.name}</span>
                            </span>
                            <span className="text-slate-900 font-bold shrink-0 flex items-center gap-1 group-hover:text-amber-700">
                                <span>{b.count} ({b.percent}%)</span>
                                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition" />
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${b.color}`}
                                style={{ width: `${b.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400 flex items-center justify-between">
                <span>💡 Click any bank row to browse its notices directly</span>
                <span className="text-amber-600 font-bold hover:underline cursor-pointer" onClick={() => navigate("/admin/banks")}>
                    Manage All Banks →
                </span>
            </div>
        </div>
    );
}

/**
 * 3. Asset Type Distribution Donut / Radial Chart
 */
export function AssetTypeDonutChart({ typesData }) {
    const navigate = useNavigate();
    const types = typesData || [
        { label: "Residential", count: 1020, percent: 68, color: "text-amber-500", stroke: "#f59e0b" },
        { label: "Commercial", count: 330, percent: 22, color: "text-blue-500", stroke: "#3b82f6" },
        { label: "Industrial", count: 105, percent: 7, color: "text-purple-500", stroke: "#a855f7" },
        { label: "Land & Others", count: 44, percent: 3, color: "text-emerald-500", stroke: "#10b981" }
    ];

    const total = types.reduce((acc, t) => acc + t.count, 0);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <PieIcon size={18} className="text-amber-500" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Asset Category Distribution
                        </h3>
                        <p className="text-xs text-slate-400">Breakdown by SARFAESI property classification</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                {/* Visual Donut Ring SVG */}
                <div className="relative h-36 w-36 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                        {/* Segment 1: Residential 68% */}
                        <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#f59e0b"
                            strokeWidth="14"
                            strokeDasharray="162.5 238.7"
                            strokeDashoffset="0"
                        />
                        {/* Segment 2: Commercial 22% */}
                        <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#3b82f6"
                            strokeWidth="14"
                            strokeDasharray="52.5 238.7"
                            strokeDashoffset="-162.5"
                        />
                        {/* Segment 3: Industrial 7% */}
                        <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#a855f7"
                            strokeWidth="14"
                            strokeDasharray="16.7 238.7"
                            strokeDashoffset="-215"
                        />
                        {/* Segment 4: Others 3% */}
                        <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="14"
                            strokeDasharray="7.1 238.7"
                            strokeDashoffset="-231.7"
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-black text-slate-900 leading-none">{total}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Notices</span>
                    </div>
                </div>

                {/* Legend Pills Grid with Click-To-Filter */}
                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
                    {types.map((t, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/admin/properties?type=${encodeURIComponent(t.label)}`)}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 transition cursor-pointer text-xs group"
                            title={`Filter properties by ${t.label}`}
                        >
                            <div className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-full ${t.color.replace("text-", "bg-")}`} />
                                <span className="font-bold text-slate-800 group-hover:text-amber-700">{t.label}</span>
                            </div>
                            <div className="mt-1 flex items-baseline justify-between gap-2">
                                <span className="font-black text-slate-900">{t.count}</span>
                                <span className="font-bold text-slate-500 text-[11px]">{t.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                💡 Click any category card above to view filtered properties
            </div>
        </div>
    );
}

/**
 * 4. Price Bracket Histogram / Distribution Chart
 */
export function PriceBracketHistogramChart() {
    const brackets = [
        { label: "< ₹25 Lakh", count: 342, percent: 23, color: "bg-emerald-500" },
        { label: "₹25L – ₹50L", count: 518, percent: 35, color: "bg-blue-500" },
        { label: "₹50L – ₹1 Cr", count: 384, percent: 25, color: "bg-amber-500" },
        { label: "₹1 Cr – ₹5 Cr", count: 215, percent: 14, color: "bg-purple-500" },
        { label: "> ₹5 Crore", count: 40, percent: 3, color: "bg-rose-500" }
    ];

    const maxCount = Math.max(...brackets.map((b) => b.count));

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-amber-500" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Reserve Price Brackets
                        </h3>
                        <p className="text-xs text-slate-400">Inventory spread across budget and valuation tiers</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Affordable Heavy (58% &lt; ₹50L)
                </span>
            </div>

            {/* Vertical Bar Histogram */}
            <div className="grid grid-cols-5 gap-3 pt-4 items-end h-44">
                {brackets.map((b, idx) => {
                    const heightPct = Math.round((b.count / maxCount) * 100);

                    return (
                        <div key={idx} className="flex flex-col items-center justify-end h-full group">
                            <span className="text-[10px] font-black text-slate-900 mb-1 opacity-80 group-hover:opacity-100">
                                {b.count}
                            </span>
                            <div className="w-full rounded-xl bg-slate-100 overflow-hidden h-32 flex items-end p-1">
                                <div
                                    className={`w-full ${b.color} rounded-lg transition-all duration-500 group-hover:brightness-110 shadow-xs`}
                                    style={{ height: `${heightPct}%` }}
                                />
                            </div>
                            <span className="mt-2 text-[10px] font-bold text-slate-600 text-center truncate w-full">
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
 * 5. Investor Inquiry Conversion Funnel
 */
export function LeadConversionFunnelChart() {
    const stages = [
        { label: "1. Inquiries Received", count: 148, rate: "100%", color: "bg-blue-500" },
        { label: "2. Contacted / Briefed", count: 115, rate: "78%", color: "bg-amber-500" },
        { label: "3. Due Diligence / Inspection", count: 62, rate: "42%", color: "bg-purple-500" },
        { label: "4. EMD Deposited / Placed Bid", count: 26, rate: "18%", color: "bg-emerald-500" }
    ];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs card-hover-effect space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-amber-500" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">
                            Investor Bidding Conversion Funnel
                        </h3>
                        <p className="text-xs text-slate-400">Lead progression from initial inquiry to auction bidding</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    18% Bid Conversion Rate
                </span>
            </div>

            <div className="space-y-3 pt-2">
                {stages.map((stage, idx) => (
                    <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800">{stage.label}</span>
                            <span className="text-slate-900">{stage.count} Leads ({stage.rate})</span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                                style={{ width: stage.rate }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
