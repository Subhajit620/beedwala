import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    Search,
    MapPin,
    Building2,
    Landmark,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    TrendingDown,
    Flame,
    Home as HomeIcon,
    Briefcase,
    Factory,
    CheckCircle2,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Ruler,
    Radio
} from "lucide-react";
import CoverflowCarousel from "./CoverflowCarousel";

export default function Hero({ stats = {} }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedBank, setSelectedBank] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // 1. Rotating Dynamic Headline Keyword
    const rotatingWords = [
        "Bank Auctions",
        "Distressed Assets",
        "Luxury Flats",
        "Commercial Offices",
        "Industrial Units",
        "Prime Land Plots"
    ];
    const [wordIndex, setWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prev) => (prev + 1) % rotatingWords.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [rotatingWords.length]);

    // 2. Rotating Live Ticker Announcements
    const liveAnnouncements = [
        "Bidwallah Official Bank Auction Gateway • 1,499+ Listings",
        "🔴 SBI: 3 New Commercial Properties Gazetted in Kolkata",
        "⚡ Indian Bank: Residential E-Auction Scheduled for Next Week",
        "🔒 100% SARFAESI Statutory Clean Title Transfer Guarantee"
    ];
    const [tickerIndex, setTickerIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % liveAnnouncements.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [liveAnnouncements.length]);

    const categoryTabs = [
        { id: "all", label: "All Properties", icon: Building2 },
        { id: "Residential", label: "Residential", icon: HomeIcon },
        { id: "Commercial", label: "Commercial", icon: Briefcase },
        { id: "Flat", label: "Flats & Apts", icon: Building2 },
        { id: "Land", label: "Land & Plots", icon: MapPin }
    ];

    const budgetPresets = [
        { label: "< ₹25 Lakhs", min: 0, max: 2500000 },
        { label: "₹25L – ₹50L", min: 2500000, max: 5000000 },
        { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
        { label: "> ₹1 Crore", min: 10000000, max: null }
    ];

    const popularTags = [
        { label: "📍 Kolkata", query: "Kolkata" },
        { label: "🏛️ Indian Bank", query: "Indian Bank" },
        { label: "🏛️ State Bank of India", query: "State Bank of India" },
        { label: "🏠 Residential Flat", query: "Flat" },
        { label: "🏢 Commercial Office", query: "Office" },
        { label: "🔑 Physical Possession", query: "Physical" }
    ];

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const params = new URLSearchParams();
        
        const queryCombined = searchQuery.trim();
        if (activeTab !== "all" && !queryCombined) {
            params.set("type", activeTab);
        } else if (activeTab !== "all" && queryCombined) {
            params.set("type", activeTab);
            params.set("q", queryCombined);
        } else if (queryCombined) {
            params.set("q", queryCombined);
        }

        if (selectedLocation.trim()) {
            params.set("city", selectedLocation.trim());
        }
        if (selectedBank.trim()) {
            params.set("bank", selectedBank.trim());
        }

        navigate(`/search?${params.toString()}`);
    };

    const handleBudgetClick = (preset) => {
        const params = new URLSearchParams();
        if (preset.min !== null) params.set("minPrice", preset.min);
        if (preset.max !== null) params.set("maxPrice", preset.max);
        if (activeTab !== "all") params.set("type", activeTab);
        navigate(`/search?${params.toString()}`);
    };

    const handleTagClick = (query) => {
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-slate-50 py-12 sm:py-20 border-b border-slate-200/80">
            {/* Background Ambient Mesh Glow and Geometric Accents */}
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
                        backgroundSize: "28px 28px"
                    }}
                ></div>
                <div className="absolute top-[-10%] left-[15%] w-[600px] h-[400px] bg-amber-400/15 blur-[120px] rounded-full animate-float-slow"></div>
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[450px] bg-yellow-500/12 blur-[110px] rounded-full animate-float-reverse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[350px] bg-amber-600/10 blur-[90px] rounded-full"></div>
            </div>

            <div className="relative mx-auto w-full max-w-[1440px] xl:max-w-[1560px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                {/* Main Split Hero Grid: Content + Animated Image Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 2xl:gap-16 items-center">
                    {/* Left Column: Headlines, Dynamic Rotating Words & Search Console */}
                    <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-6 space-y-6 lg:pr-2 xl:pr-4">
                        {/* Top Trust Live Ticker with Pulse */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-white/95 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-xs backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <Sparkles size={14} className="text-amber-500 shrink-0" />
                            <span key={tickerIndex} className="animate-ticker-fade line-clamp-1">
                                {liveAnnouncements[tickerIndex]}
                            </span>
                        </div>

                        {/* High-Impact Heading with Animated Rotating Dynamic Words */}
                        <div className="space-y-3">
                            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[2.65rem] xl:text-[3.25rem] 2xl:text-6xl font-black tracking-tight text-slate-950 leading-[1.14]">
                                Find Your Next Verified{" "}
                                <span className="relative inline-block min-w-[160px] xs:min-w-[195px] sm:min-w-[250px] md:min-w-[280px] xl:min-w-[330px] align-top">
                                    <span
                                        key={wordIndex}
                                        className="inline-block bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-black drop-shadow-xs animate-rotate-word"
                                    >
                                        {rotatingWords[wordIndex]}
                                    </span>
                                    <svg
                                        className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full text-amber-400/60 pointer-events-none"
                                        viewBox="0 0 250 12"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 9C60 2.5 190 2.5 247 9"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal pt-1">
                                Discover an authorized bank marketplace for real estate across India, offering transparent reserve prices. <strong className="text-slate-900 font-semibold">20% to 35% below market valuation</strong> with 100% clean title deeds.
                            </p>
                        </div>

                        {/* Search Console Container */}
                        <div className="pt-2">
                            {/* Category Filter Tabs */}
                            <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1">
                                {categoryTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition duration-200 cursor-pointer shrink-0 ${
                                                isActive
                                                    ? "bg-slate-950 text-amber-400 shadow-md border border-amber-500/40 font-black scale-[1.02]"
                                                    : "bg-white text-slate-600 hover:bg-amber-50/70 hover:text-amber-800 border border-slate-200/90"
                                            }`}
                                        >
                                            <Icon size={13} className={isActive ? "text-amber-400" : "text-slate-400"} />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Form Card */}
                            <div className="rounded-3xl bg-white p-3.5 sm:p-4 shadow-xl shadow-slate-200/70 border border-slate-200">
                                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                    {/* Keyword / Property Title */}
                                    <div className="sm:col-span-12 md:col-span-5 flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 px-3.5 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <Search size={17} className="text-slate-400 mr-2 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                Property / Title / ID
                                            </label>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="e.g. Flat, Land, IDIB..."
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none truncate"
                                            />
                                        </div>
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery("")}
                                                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Bank Name */}
                                    <div className="sm:col-span-6 md:col-span-3 flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 px-3.5 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <Landmark size={17} className="text-amber-600 mr-2 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                Bank Name
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedBank}
                                                onChange={(e) => setSelectedBank(e.target.value)}
                                                placeholder="e.g. Indian Bank"
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none truncate"
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div className="sm:col-span-6 md:col-span-2 flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <MapPin size={17} className="text-rose-500 mr-1.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedLocation}
                                                onChange={(e) => setSelectedLocation(e.target.value)}
                                                placeholder="Kolkata..."
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none truncate"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Search Button */}
                                    <div className="sm:col-span-12 md:col-span-2">
                                        <button
                                            type="submit"
                                            className="w-full h-full min-h-[48px] flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-xs font-black text-white shadow-md shadow-amber-500/25 transition duration-200 active:scale-[0.98] cursor-pointer"
                                        >
                                            <span>Search</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </form>

                                {/* Quick Budget Presets */}
                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                                        <DollarSign size={12} className="text-amber-600" />
                                        <span>Budget:</span>
                                    </span>
                                    {budgetPresets.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleBudgetClick(preset)}
                                            className="rounded-lg bg-amber-50/70 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 transition cursor-pointer"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Trending Search Pills */}
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                        Popular:
                                    </span>
                                    {popularTags.map((tag, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleTagClick(tag.query)}
                                            className="rounded-lg bg-slate-100/90 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition cursor-pointer"
                                        >
                                            {tag.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 3D Coverflow Carousel Showcase */}
                    <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-6 relative w-full flex items-center justify-center py-2 overflow-visible">
                        <CoverflowCarousel />
                    </div>
                </div>

                {/* Quick Statistics Banner with Neon Gold Icons */}
                <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 xl:gap-6">
                    {/* Stat 1: Total Properties */}
                    <div className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2.5 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
                            <Building2 size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg xs:text-xl sm:text-3xl font-black text-slate-950 leading-tight truncate">
                                {stats.totalProperties ?? "1,499"}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                                Total Properties
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Active Listings */}
                    <div className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-5 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2.5 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 shrink-0 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
                            <ShieldCheck size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg xs:text-xl sm:text-3xl font-black text-emerald-600 leading-tight flex items-center gap-1 sm:gap-1.5 truncate">
                                <span>{stats.activeListings ?? "1,499"}</span>
                                <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                                Active Listings
                            </div>
                        </div>
                    </div>

                    {/* Stat 3: States Covered */}
                    <div className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2.5 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-950 text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-105 transition-all duration-200">
                            <MapPin size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg xs:text-xl sm:text-3xl font-black text-slate-950 leading-tight truncate">
                                {stats.totalStates ?? "1"}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                                States Covered
                            </div>
                        </div>
                    </div>

                    {/* Stat 4: Partner Banks */}
                    <div className="group rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 p-3 sm:p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2.5 sm:gap-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
                            <Landmark size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-lg xs:text-xl sm:text-3xl font-black text-amber-700 leading-tight truncate">
                                {stats.totalBanks ?? "13"}
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                                Partner Banks
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
