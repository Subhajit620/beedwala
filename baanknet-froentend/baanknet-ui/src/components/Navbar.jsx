import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    X,
    Bookmark,
    Scale,
    Sparkles,
    Search,
    ArrowRight,
    Shield,
    ChevronDown,
    Compass
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { fetchProperties } from "../services/propertyService";
import logoImg from "../assets/logo.jpg";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleOpenBuyerGuide = () => {
        setMobileMenuOpen(false);
        if (location.pathname === "/") {
            window.dispatchEvent(new CustomEvent("bw:open-welcome-modal"));
        } else {
            navigate("/?guide=1");
        }
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
    const searchRef = useRef(null);
    // Results are only shown for queries of 2+ characters (derived — no state reset needed)
    const searchQueryReady = searchQuery.trim().length >= 2;

    const {
        savedProperties,
        setIsWatchlistOpen,
        comparedProperties,
        setIsCompareModalOpen
    } = useApp();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Property", children: [
            { name: "Fresh Property", path: "/fresh-properties" },
            { name: "Auction Property", path: "/properties" }
        ] },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" }
    ];

    // Live search debouncing
    useEffect(() => {
        if (!searchQueryReady) return;

        const timeout = setTimeout(async () => {
            try {
                const res = await fetchProperties({
                    search: searchQuery.trim(),
                    limit: 4
                });
                if (res.success && Array.isArray(res.data)) {
                    setSearchResults(res.data);
                    setSearchDropdownOpen(true);
                }
            } catch (err) {
                console.error("Navbar search error:", err);
            }
        }, 220);

        return () => clearTimeout(timeout);
    }, [searchQuery, searchQueryReady]);

    // Close search dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSearchDropdownOpen(false);
            setMobileMenuOpen(false);
            navigate(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSelectResult = (propertyId) => {
        setSearchDropdownOpen(false);
        setSearchQuery("");
        setMobileMenuOpen(false);
        navigate(`/properties/${propertyId}`);
    };

    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-xs transition duration-200">
            {/* Top Micro Gold Accent Line */}
            <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
                    {/* Brand / Logo */}
                    <Link to="/" className="flex items-center gap-3 group py-1 shrink-0">
                        <img
                            src={logoImg}
                            alt="Baanknet Logo"
                            className="h-9 sm:h-11 w-auto object-contain transition duration-300 group-hover:scale-105"
                        />
                    </Link>

                    {/* Quick Search Option in Navbar (Desktop & Tablet) */}
                    <div ref={searchRef} className="hidden sm:flex relative flex-1 max-w-xs md:max-w-md mx-2">
                        <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
                            <Search
                                size={15}
                                className="absolute left-3.5 text-slate-400 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    if (searchResults.length > 0) setSearchDropdownOpen(true);
                                }}
                                placeholder="Quick search by city, bank, ID, or title..."
                                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition shadow-2xs"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }}
                                    className="absolute right-3 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </form>

                        {/* Live Search Results Dropdown */}
                        {searchDropdownOpen && searchQueryReady && searchResults.length > 0 && (
                            <div className="absolute top-12 left-0 right-0 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-scale-up space-y-1">
                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                    <span>Matching Properties</span>
                                    <span>{searchResults.length} results</span>
                                </div>

                                {searchResults.map((prop) => {
                                    const id = prop.sourcePropertyId || prop.propertyUniqueId || prop._id;
                                    return (
                                        <div
                                            key={id}
                                            onClick={() => handleSelectResult(id)}
                                            className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer transition group"
                                        >
                                            <div className="overflow-hidden pr-2">
                                                <div className="font-bold text-slate-900 truncate group-hover:text-amber-600 transition">
                                                    {prop.propertyHeading || prop.propertyTitle || "Bank Auction Notice"}
                                                </div>
                                                <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                                    <span className="text-slate-600 font-semibold">{prop.bankName}</span>
                                                    <span>•</span>
                                                    <span>{prop.city || "India"}</span>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="font-black text-emerald-600">
                                                    ₹{(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                                </div>
                                                <span className="text-[10px] font-bold text-amber-600 group-hover:underline flex items-center justify-end gap-0.5">
                                                    <span>View</span>
                                                    <ArrowRight size={10} />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="pt-2 border-t border-slate-100 px-1">
                                    <button
                                        type="button"
                                        onClick={handleSearchSubmit}
                                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 transition"
                                    >
                                        <span>View all matching properties</span>
                                        <ArrowRight size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-6 shrink-0">
                        {navItems.map((item) => item.children ? (
                            <details key={item.name} className="relative" onBlur={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
                            }} onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    event.currentTarget.open = false;
                                    event.currentTarget.querySelector("summary").focus();
                                }
                            }}>
                                <summary className="flex cursor-pointer list-none items-center gap-1 py-1.5 px-1 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-amber-600 [&::-webkit-details-marker]:hidden">
                                    {item.name}<ChevronDown size={14} />
                                </summary>
                                <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                    {item.children.map((child) => (
                                        <NavLink key={child.path} to={child.path}
                                            onClick={(event) => { event.currentTarget.closest("details").open = false; }}
                                            className={({ isActive }) => `block rounded-lg px-3 py-2.5 text-xs font-bold transition ${isActive ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-50 hover:text-amber-600"}`}>
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </details>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `text-xs font-bold uppercase tracking-wider transition-all duration-200 relative py-1.5 px-1 ${
                                        isActive
                                            ? "text-amber-600 font-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-500 after:rounded-full"
                                            : "text-slate-600 hover:text-amber-600"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Utility Actions */}
                    <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
                        {/* Compare Icon Trigger */}
                        {comparedProperties.length > 0 && (
                            <button
                                onClick={() => setIsCompareModalOpen(true)}
                                className="relative flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-2.5 sm:px-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs cursor-pointer active:scale-95"
                                title="Compare selected properties"
                            >
                                <Scale size={15} className="text-amber-700" />
                                <span className="hidden md:inline">Compare</span>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">
                                    {comparedProperties.length}
                                </span>
                            </button>
                        )}

                        {/* Watchlist Icon Trigger */}
                        <button
                            onClick={() => setIsWatchlistOpen(true)}
                            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 shadow-xs transition duration-200 cursor-pointer active:scale-95"
                            title="Saved Watchlist"
                        >
                            <Bookmark size={17} className={savedProperties.length > 0 ? "fill-amber-500 text-amber-500" : ""} />
                            {savedProperties.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-amber-600 text-[9px] sm:text-[10px] font-black text-white shadow-xs">
                                    {savedProperties.length}
                                </span>
                            )}
                        </button>

                        {/* Admin Link */}
                        <Link
                            to="/admin"
                            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 shadow-xs transition duration-200"
                            title="Administrator Portal"
                        >
                            <Shield size={16} className="text-slate-600 hover:text-amber-600" />
                        </Link>

                        {/* Buyer Quick Guide Popup Trigger */}
                        <button
                            type="button"
                            onClick={handleOpenBuyerGuide}
                            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 transition shadow-xs cursor-pointer active:scale-95"
                            title="Open Smart Property Finder & Buyer Guide"
                        >
                            <Compass size={14} className="text-amber-600" />
                            <span>Quick Guide</span>
                        </button>

                        {/* Explore CTA Button (Desktop) */}
                        <Link
                            to="/properties"
                            className="hidden md:inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-950 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-900 transition shadow-xs border border-slate-800 active:scale-95"
                        >
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Explore</span>
                        </Link>
                    </div>

                    {/* Mobile & Tablet Hamburger & Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
                        {/* Mobile Watchlist */}
                        <button
                            onClick={() => setIsWatchlistOpen(true)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 sm:hidden"
                            title="Watchlist"
                        >
                            <Bookmark size={16} className={savedProperties.length > 0 ? "fill-amber-500 text-amber-500" : ""} />
                            {savedProperties.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-black text-white">
                                    {savedProperties.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Admin Icon */}
                        <Link
                            to="/admin"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 sm:hidden"
                            title="Admin Portal"
                        >
                            <Shield size={16} />
                        </Link>

                        {/* Mobile & Tablet Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile & Tablet Drawer Menu with Quick Search */}
            {mobileMenuOpen && (
                <div className="border-t border-slate-200 bg-white px-4 py-5 lg:hidden space-y-4 animate-slide-up">
                    {/* Mobile Quick Search Form */}
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                        <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Quick search properties, banks, cities..."
                            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500 focus:bg-white"
                        />
                    </form>

                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item) => item.children ? (
                            <details key={item.name} className="rounded-xl">
                                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 [&::-webkit-details-marker]:hidden">
                                    {item.name}<ChevronDown size={16} />
                                </summary>
                                <div className="ml-4 space-y-1 border-l border-amber-200 pl-2">
                                    {item.children.map((child) => (
                                        <NavLink key={child.path} to={child.path} onClick={() => setMobileMenuOpen(false)}
                                            className={({ isActive }) => `block rounded-xl px-4 py-2.5 text-xs font-bold ${isActive ? "bg-amber-50 text-amber-700" : "text-slate-700 hover:bg-slate-50"}`}>
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </details>
                        ) : (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                                        isActive
                                            ? "bg-amber-50 text-amber-700 font-black border border-amber-200"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}

                        <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Shield size={14} className="text-amber-600" />
                            <span>Admin Portal Console</span>
                        </Link>
                    </nav>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                        {comparedProperties.length > 0 && (
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setIsCompareModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 py-2.5 text-xs font-bold text-amber-900 border border-amber-200"
                            >
                                <Scale size={15} />
                                <span>Compare Properties ({comparedProperties.length})</span>
                            </button>
                        )}

                        <Link
                            to="/properties"
                            onClick={() => setMobileMenuOpen(false)}
                            className="rounded-xl bg-slate-950 py-3 text-center text-xs font-bold text-amber-400 shadow-md"
                        >
                            Explore 1,499+ Properties
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
