import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Bookmark, Scale, Sparkles, ShieldCheck, Flame } from "lucide-react";
import { useApp } from "../context/AppContext";
import logoImg from "../assets/logo.jpg";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {
        savedProperties,
        setIsWatchlistOpen,
        comparedProperties,
        setIsCompareModalOpen
    } = useApp();

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Properties", path: "/properties" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" }
    ];

    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-xs transition duration-200">
            {/* Top Micro Gold Accent Line */}
            <div className="h-[2.5px] w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between">
                    {/* Brand / Logo Image with Luxury Emblem Glow */}
                    <Link to="/" className="flex items-center gap-3 group py-1">
                        <div className="relative">
                            <img
                                src={logoImg}
                                alt="Bidwallah Logo"
                                className="h-10 sm:h-12 w-auto object-contain transition duration-300 group-hover:scale-105 filter drop-shadow-xs"
                            />
                        </div>
                    </Link>

                    {/* Center Trust Tagline for Desktop */}
                    <div className="hidden lg:flex items-center gap-2 rounded-full bg-amber-50/90 border border-amber-200/70 px-3.5 py-1 text-[11px] font-bold text-amber-900 shadow-xs">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>1,499+ Verified Bank SARFAESI Listings Live</span>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-7">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                                className={({ isActive }) =>
                                    `text-xs font-bold uppercase tracking-wider transition-all duration-200 relative py-1.5 px-1 ${
                                        isActive
                                            ? "text-amber-600 font-extrabold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-amber-400 after:to-amber-600 after:rounded-full"
                                            : "text-slate-600 hover:text-amber-600"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right User Utility Actions (Watchlist, Compare, CTA) */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Compare Icon Trigger */}
                        {comparedProperties.length > 0 && (
                            <button
                                onClick={() => setIsCompareModalOpen(true)}
                                className="relative flex h-10 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/90 px-3 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs cursor-pointer active:scale-95"
                                title="Compare selected properties"
                            >
                                <Scale size={15} className="text-amber-700" />
                                <span>Compare</span>
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-black text-white">
                                    {comparedProperties.length}
                                </span>
                            </button>
                        )}

                        {/* Watchlist Icon Trigger */}
                        <button
                            onClick={() => setIsWatchlistOpen(true)}
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/60 hover:text-amber-600 shadow-xs transition duration-200 cursor-pointer active:scale-95"
                            title="Saved Watchlist"
                        >
                            <Bookmark size={18} className={savedProperties.length > 0 ? "fill-amber-500 text-amber-500" : ""} />
                            {savedProperties.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-black text-white shadow-xs animate-scale-up">
                                    {savedProperties.length}
                                </span>
                            )}
                        </button>

                        {/* Explore CTA Button with Gold Shimmer */}
                        <Link
                            to="/properties"
                            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-amber-500/20 transition-all duration-300 hover:bg-slate-900 border border-slate-800 active:scale-[0.98] cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Sparkles size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                            <span className="relative z-10 text-amber-400 group-hover:text-amber-300">
                                Explore Listings
                            </span>
                        </Link>
                    </div>

                    {/* Mobile Hamburger & Actions */}
                    <div className="flex items-center gap-2 md:hidden">
                        {/* Mobile Watchlist Icon */}
                        <button
                            onClick={() => setIsWatchlistOpen(true)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                        >
                            <Bookmark size={16} className={savedProperties.length > 0 ? "fill-amber-500 text-amber-500" : ""} />
                            {savedProperties.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-black text-white">
                                    {savedProperties.length}
                                </span>
                            )}
                        </button>

                        {/* Mobile Hamburger Toggle */}
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

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="border-t border-slate-200 bg-white/95 backdrop-blur-2xl px-4 py-5 md:hidden space-y-3 animate-slide-up">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                            Bidwallah Auction Portal
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Data
                        </span>
                    </div>

                    <nav className="flex flex-col gap-1.5">
                        {navItems.map((item) => (
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
                            className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 py-3 text-center text-xs font-bold text-white shadow-md shadow-amber-500/20"
                        >
                            Explore 1,499+ Properties
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
