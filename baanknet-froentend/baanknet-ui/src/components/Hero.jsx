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

    // 3. Featured Showcase Auto-Sliding Carousel
    const showcaseSlides = [
        {
            id: "slide-1",
            title: "830 sq.ft Luxury Flat in Kolkata",
            bank: "Indian Bank",
            price: "₹16,00,890",
            discount: "32% Below Circle Rate",
            type: "Residential",
            possession: "Symbolic",
            location: "Kolkata, West Bengal",
            area: "830 sq.ft",
            image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
            query: "Kolkata"
        },
        {
            id: "slide-2",
            title: "2,400 sq.ft Commercial IT Office",
            bank: "State Bank of India",
            price: "₹85,50,000",
            discount: "35% Below Valuation",
            type: "Commercial",
            possession: "Physical",
            location: "Salt Lake Sector V, Kolkata",
            area: "2,400 sq.ft",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
            query: "Office"
        },
        {
            id: "slide-3",
            title: "6,500 sq.ft Industrial Warehouse Unit",
            bank: "Punjab National Bank",
            price: "₹1,45,00,000",
            discount: "28% Below Market",
            type: "Industrial",
            possession: "Physical",
            location: "Howrah Industrial Belt",
            area: "6,500 sq.ft",
            image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80",
            query: "Industrial"
        },
        {
            id: "slide-4",
            title: "3,200 sq.ft Prime Residential Land Plot",
            bank: "Bank of Baroda",
            price: "₹42,00,000",
            discount: "30% Instant Equity",
            type: "Land / Plot",
            possession: "Clear Title",
            location: "New Town Action Area, Kolkata",
            area: "3,200 sq.ft",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
            query: "Land"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [isHovered, showcaseSlides.length]);

    // 4. Interactive 3D Card Mouse Tilt Effect
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7; // max 7 deg tilt
        const rotateY = ((x - centerX) / centerX) * 7;

        setTilt({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ rotateX: 0, rotateY: 0 });
        setIsHovered(false);
    };

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

    const activeShowcase = showcaseSlides[currentSlide];

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

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main Split Hero Grid: Content + Animated Image Showcase */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                    {/* Left Column: Headlines, Dynamic Rotating Words & Search Console */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Top Trust Live Ticker with Pulse */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/90 bg-white/95 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-sm backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <Sparkles size={14} className="text-amber-500 shrink-0" />
                            <span key={tickerIndex} className="animate-rotate-word line-clamp-1">
                                {liveAnnouncements[tickerIndex]}
                            </span>
                        </div>

                        {/* High-Impact Heading with Animated Rotating Dynamic Words */}
                        <div className="space-y-3">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
                                Find Your Next Verified{" "}
                                <span className="relative block sm:inline-block min-w-[280px]">
                                    <span
                                        key={wordIndex}
                                        className="inline-block bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-black drop-shadow-xs animate-rotate-word"
                                    >
                                        {rotatingWords[wordIndex]}
                                    </span>
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full text-amber-400/60"
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
                                Discover authorized bank distressed properties across India at transparent reserve prices, typically <strong className="text-slate-900 font-semibold">20% to 35% below market valuation</strong> with 100% clean title deeds.
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

                    {/* Right Column: Interactive 3D Parallax & Auto-Sliding Showcase Card */}
                    <div className="lg:col-span-5 relative perspective-1000">
                        <div
                            ref={cardRef}
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
                                transition: tilt.rotateX === 0 ? "transform 0.5s ease-out" : "transform 0.1s ease-out"
                            }}
                            className="relative mx-auto max-w-md lg:max-w-none preserve-3d group cursor-pointer"
                            onClick={() => navigate(`/search?q=${encodeURIComponent(activeShowcase.query)}`)}
                        >
                            {/* Decorative Background Glow Ring */}
                            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl blur-xl opacity-30 transform -rotate-1 group-hover:opacity-50 transition-opacity"></div>

                            {/* Main Showcase Image Container */}
                            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-slate-950 shadow-2xl h-[420px] sm:h-[470px]">
                                <img
                                    key={activeShowcase.id}
                                    src={activeShowcase.image}
                                    alt={activeShowcase.title}
                                    className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105 animate-fade-in"
                                />

                                {/* Image Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-slate-950/40"></div>

                                {/* Top Floating Animated Badge: Live Auction Beacon */}
                                <div className="absolute top-4 right-4 z-20 animate-float-slow">
                                    <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-xl border border-amber-300/80 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                                            <Flame size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                                                <span>Live Bank Auction</span>
                                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            </div>
                                            <div className="text-[10px] text-amber-800 font-bold flex items-center gap-0.5">
                                                <TrendingDown size={12} className="text-amber-600" />
                                                <span>{activeShowcase.discount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Left Slide Category Tag */}
                                <div className="absolute top-4 left-4 z-20">
                                    <div className="rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md px-3 py-1.5 text-xs font-black text-amber-400 shadow-md">
                                        {activeShowcase.type} Asset
                                    </div>
                                </div>

                                {/* Slider Navigation Arrows (Previous / Next) */}
                                <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((prev) => (prev === 0 ? showcaseSlides.length - 1 : prev - 1));
                                        }}
                                        className="pointer-events-auto h-9 w-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg backdrop-blur-md transition cursor-pointer active:scale-90"
                                        aria-label="Previous property slide"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
                                        }}
                                        className="pointer-events-auto h-9 w-9 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-lg backdrop-blur-md transition cursor-pointer active:scale-90"
                                        aria-label="Next property slide"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>

                                {/* Bottom Spotlight Banner */}
                                <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
                                    <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3.5 border border-slate-200/90 shadow-xl flex items-center justify-between animate-slide-up">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                                                    {activeShowcase.bank}
                                                </span>
                                                <span className="text-[10px] text-slate-400">•</span>
                                                <span className="text-[10px] font-semibold text-emerald-600">
                                                    {activeShowcase.possession}
                                                </span>
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-black text-slate-950 truncate max-w-[200px]">
                                                {activeShowcase.title}
                                            </h4>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-base sm:text-lg font-black text-slate-950 block">
                                                {activeShowcase.price}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {activeShowcase.area}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Slider Dot Indicators */}
                                    <div className="flex items-center justify-center gap-1.5 pt-1">
                                        {showcaseSlides.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentSlide(idx);
                                                }}
                                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                    currentSlide === idx
                                                        ? "w-7 bg-amber-400 shadow-xs"
                                                        : "w-2 bg-white/50 hover:bg-white/80"
                                                }`}
                                                aria-label={`Go to slide ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Statistics Banner with Neon Gold Icons */}
                <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Stat 1: Total Properties */}
                    <div className="group rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                                {stats.totalProperties ?? "1,499"}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                Total Properties
                            </div>
                        </div>
                    </div>

                    {/* Stat 2: Active Listings */}
                    <div className="group rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 shrink-0 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-emerald-600 leading-tight flex items-center gap-1.5">
                                {stats.activeListings ?? "1,499"}
                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                Active Listings
                            </div>
                        </div>
                    </div>

                    {/* Stat 3: States Covered */}
                    <div className="group rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-105 transition-all duration-200">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                                {stats.totalStates ?? "1"}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                States Covered
                            </div>
                        </div>
                    </div>

                    {/* Stat 4: Partner Banks */}
                    <div className="group rounded-3xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 shrink-0 group-hover:scale-105 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all duration-200">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-black text-amber-700 leading-tight">
                                {stats.totalBanks ?? "13"}
                            </div>
                            <div className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                Partner Banks
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
