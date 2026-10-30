import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ShieldCheck,
    Landmark,
    ArrowRight,
    AlertCircle,
    RotateCcw,
    Sparkles,
    Building2,
    TrendingDown,
    Award,
    Flame,
    CheckCircle2,
    XCircle,
    Bell,
    Check,
    Compass,
    MapPin,
    Film
} from "lucide-react";

import { fetchProperties, fetchPropertyStats } from "../services/propertyService";
import { fetchFreshProperties } from "../services/freshPropertyService";
import Hero from "../components/Hero";
import PropertyGrid from "../components/PropertyGrid";
import BankPartnersMarquee from "../components/BankPartnersMarquee";
import AuctionRoadmap from "../components/AuctionRoadmap";
import FaqSection from "../components/FaqSection";
import EmiCalculator from "../components/EmiCalculator";
import UserWelcomeModal from "../components/UserWelcomeModal";
import { PropertyGridSkeleton } from "../components/Loading";
import { useApp } from "../context/AppContext";

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [freshProperties, setFreshProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [featuredTab, setFeaturedTab] = useState("all");
    const [vipEmail, setVipEmail] = useState("");
    const [vipSubscribed, setVipSubscribed] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const { addToast } = useApp();

    // Dynamic stats from server stats endpoint
    const [stats, setStats] = useState({
        totalProperties: 1499,
        activeListings: 1499,
        totalStates: 1,
        totalBanks: 13
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // Fetch live server stats, featured auction listings, and fresh properties concurrently
            const [statsRes, propertiesRes, freshRes] = await Promise.all([
                fetchPropertyStats().catch((e) => {
                    console.warn("Failed to fetch stats:", e);
                    return null;
                }),
                fetchProperties({ limit: 12, sort: "newest" }),
                fetchFreshProperties(false).catch(() => null)
            ]);

            if (statsRes && statsRes.success && statsRes.data) {
                setStats({
                    totalProperties: statsRes.data.totalProperties || 1499,
                    activeListings: statsRes.data.activeListings || 1499,
                    totalStates: statsRes.data.totalStates || 1,
                    totalBanks: statsRes.data.totalBanks || 13
                });
            }

            if (freshRes && Array.isArray(freshRes.data)) {
                setFreshProperties(freshRes.data);
            }

            const data = propertiesRes?.data || [];
            setProperties(data);
        } catch (err) {
            console.error("Failed to fetch homepage properties:", err);
            setError("Unable to load properties. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        loadData();
    }, [loadData]);

    // Auto-open Buyer Welcome & Smart Finder Popup once per session (after FlashLoader completes)
    // or immediately when triggered from Navbar (?guide=1 or custom event)
    useEffect(() => {
        const handleCustomOpen = () => setShowWelcomeModal(true);
        window.addEventListener("bw:open-welcome-modal", handleCustomOpen);

        if (searchParams.get("guide") === "1") {
            // oxlint-disable-next-line react/set-state-in-effect -- open modal from URL query trigger
            setShowWelcomeModal(true);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete("guide");
            setSearchParams(nextParams, { replace: true });
            return () => window.removeEventListener("bw:open-welcome-modal", handleCustomOpen);
        }

        const alreadyShown = sessionStorage.getItem("bw_user_welcome_shown");
        const isAutomatedBrowser = typeof navigator !== "undefined" && navigator.webdriver === true;
        if (!alreadyShown && !isAutomatedBrowser) {
            const timer = setTimeout(() => {
                setShowWelcomeModal(true);
                sessionStorage.setItem("bw_user_welcome_shown", "1");
            }, 2600);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("bw:open-welcome-modal", handleCustomOpen);
            };
        }

        return () => window.removeEventListener("bw:open-welcome-modal", handleCustomOpen);
    }, [searchParams, setSearchParams]);

    // Filter featured properties based on selected tab
    const featuredProperties = useMemo(() => {
        let list = properties;
        if (featuredTab !== "all") {
            list = properties.filter(
                (p) =>
                    p.propertyType?.toLowerCase() === featuredTab.toLowerCase() ||
                    p.propertySubType?.toLowerCase() === featuredTab.toLowerCase()
            );
        }
        return list.slice(0, 6);
    }, [properties, featuredTab]);

    const handleVipSubmit = (e) => {
        e.preventDefault();
        if (!vipEmail) return;
        setVipSubscribed(true);
        addToast("Subscribed to daily SARFAESI bank auction alerts!", "success");
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Animated Buyer Welcome & Smart Property Finder Popup */}
            <UserWelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                stats={stats}
                freshCount={freshProperties.length}
            />

            {/* 1. Hero Section with multi-parameter search console & animated image */}
            <Hero
                stats={stats}
                freshCount={freshProperties.length}
                onOpenWelcomeModal={() => setShowWelcomeModal(true)}
            />

            {/* 2. Institutional Banking Partners Bar */}
            <BankPartnersMarquee />

            {/* 2.5 Interactive Dual-Path Buyer Showcase: Fresh Property (Direct Sale) vs Bank Auction */}
            <section className="py-10 sm:py-14 bg-slate-950 text-white border-b border-slate-800 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl animate-orb-drift" />
                <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl animate-orb-drift" />

                <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300 mb-2">
                                <Sparkles size={13} className="text-emerald-400" />
                                <span>Two Transparent Ways to Buy</span>
                            </div>
                            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white tracking-tight">
                                Fresh Direct Properties vs. Bank Auctions
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
                                Buy directly from Bidwallah Admin at a fixed price with zero auction formalities, or bid on official SARFAESI bank notices at 20%–35% below market valuation.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowWelcomeModal(true)}
                            className="inline-flex items-center gap-2 self-start md:self-auto rounded-2xl border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 px-4 py-2.5 text-xs font-black text-amber-300 transition cursor-pointer animate-pulse-glow"
                        >
                            <Compass size={15} className="text-amber-400" />
                            <span>Open Smart Property Finder</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                        {/* Card 1: Fresh Property (Direct from Admin · No Auction) */}
                        <Link
                            to="/fresh-properties"
                            className="group relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 p-6 sm:p-7 hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1 animate-pulse-emerald"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                                        <Sparkles size={24} />
                                    </div>
                                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
                                        No Auction • Direct Admin Sale
                                    </span>
                                </div>

                                <h3 className="mt-5 text-xl sm:text-2xl font-black text-white group-hover:text-emerald-300 transition">
                                    Fresh Properties ({freshProperties.length} Available)
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Exclusively uploaded by the Bidwallah Admin. Fixed asking price, no e-bidding, and no EMD deposit — view photos, walkthrough videos &amp; GPS map location, then click <strong>&ldquo;I&apos;m Interested&rdquo;</strong> to connect directly with Admin.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-emerald-300">
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-emerald-500/25 px-3 py-1">
                                        <ShieldCheck size={13} /> Admin Verified Only
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-emerald-500/25 px-3 py-1">
                                        <Film size={13} /> HD Videos &amp; Photos
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-emerald-500/25 px-3 py-1">
                                        <MapPin size={13} /> Exact GPS Pin
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs sm:text-sm font-black text-emerald-400">
                                <span>Browse All Fresh Properties (No Auction)</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition" />
                            </div>
                        </Link>

                        {/* Card 2: Bank Auction Properties (SARFAESI Notices) */}
                        <Link
                            to="/properties"
                            className="group relative flex flex-col justify-between rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 p-6 sm:p-7 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 animate-pulse-glow"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                                        <Landmark size={24} />
                                    </div>
                                    <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-300">
                                        SARFAESI Bank Notices
                                    </span>
                                </div>

                                <h3 className="mt-5 text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition">
                                    Bank Auction Properties ({stats.totalProperties.toLocaleString("en-IN")}+ Listings)
                                </h3>
                                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    Official institutional auction notices from State Bank of India, PNB, Indian Bank &amp; 13+ partner banks. Acquire residential, commercial, and land assets at <strong>20% to 35% below market valuation</strong> with 0% brokerage.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-amber-300">
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-amber-500/25 px-3 py-1">
                                        <TrendingDown size={13} /> 20%–35% Below Market
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-amber-500/25 px-3 py-1">
                                        <ShieldCheck size={13} /> Clean Sale Certificate
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-slate-950/70 border border-amber-500/25 px-3 py-1">
                                        <Building2 size={13} /> 0% Brokerage
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs sm:text-sm font-black text-amber-400">
                                <span>Explore Bank Auction Directory</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition" />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Featured Bank Auction Properties Section */}
            <section className="py-12 sm:py-20 bg-slate-50 relative">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2 shadow-xs">
                                <Flame size={13} className="text-amber-600" />
                                <span>Verified Bank Inventories</span>
                            </div>
                            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                                Latest Bank Auction Properties
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
                                Fresh verified bank auction notices across residential, commercial, and industrial sectors with official reserve prices.
                            </p>
                        </div>

                        {/* Category Selector Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                            {[
                                { id: "all", label: "All Assets" },
                                { id: "Residential", label: "Residential" },
                                { id: "Commercial", label: "Commercial" },
                                { id: "Flat", label: "Flats & Apts" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFeaturedTab(tab.id)}
                                    className={`rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold transition duration-200 cursor-pointer shrink-0 ${
                                        featuredTab === tab.id
                                            ? "bg-slate-950 text-amber-400 font-black border border-amber-500/40 shadow-sm scale-[1.02]"
                                            : "bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-800"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error State */}
                    {error && !loading && (
                        <div className="rounded-2xl sm:rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 text-center max-w-lg mx-auto mb-8">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <p className="text-sm font-semibold text-red-700">{error}</p>
                            <button
                                onClick={loadData}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                            >
                                <RotateCcw size={13} />
                                <span>Try Again</span>
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && <PropertyGridSkeleton count={6} />}

                    {/* Property Grid */}
                    {!loading && !error && featuredProperties.length > 0 && (
                        <PropertyGrid properties={featuredProperties} columns={3} />
                    )}

                    {/* Empty Filter State */}
                    {!loading && !error && featuredProperties.length === 0 && (
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center my-6 shadow-xs">
                            <Building2 size={36} className="mx-auto text-slate-400 mb-3" />
                            <h3 className="text-base font-bold text-slate-800">No properties in this category</h3>
                            <p className="text-xs text-slate-500 mt-1">Check out all properties across India.</p>
                            <button
                                onClick={() => setFeaturedTab("all")}
                                className="mt-4 rounded-xl bg-slate-950 text-amber-400 hover:bg-slate-900 px-4 py-2 text-xs font-bold cursor-pointer"
                            >
                                View All Categories
                            </button>
                        </div>
                    )}

                    {/* Bottom CTA to Full Catalog */}
                    {!loading && !error && (
                        <div className="mt-10 sm:mt-12 text-center">
                            <Link
                                to="/properties"
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-white shadow-xl shadow-amber-500/25 transition duration-200 active:scale-[0.98] cursor-pointer"
                            >
                                <span>Explore Complete Directory ({stats.totalProperties.toLocaleString("en-IN")} Properties)</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Open Market vs Bank Auction Interactive Comparison Section */}
            <section className="py-12 sm:py-20 bg-white border-y border-slate-200/80">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-3.5 py-1 rounded-full mb-3 inline-block">
                            Value Proposition
                        </span>
                        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            Open Market vs Bank Auction On Bidwallah
                        </h2>
                        <p className="mt-2 text-xs sm:text-base text-slate-500 font-normal">
                            Why sophisticated buyers and real estate investors prefer SARFAESI bank auctions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
                        {/* Traditional Open Market Card */}
                        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50/70 p-5 sm:p-9 shadow-xs space-y-5 sm:space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Traditional Real Estate
                                </span>
                                <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-bold text-slate-700">
                                    Open Market
                                </span>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                                <div className="flex items-start gap-3">
                                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <span>High retail developer markups and subjective inflated price quotes.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <span>1% to 2% hefty broker & intermediary brokerage fees.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <span>Risk of hidden encumbrances, unpaid tax liabilities or disputed title deeds.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <span>Protracted negotiation cycles with non-standard legal documentation.</span>
                                </div>
                            </div>
                        </div>

                        {/* Bidwallah Bank Auction Card */}
                        <div className="rounded-2xl sm:rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-5 sm:p-9 shadow-xl space-y-5 sm:space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-500" />
                                    <span>Bidwallah Verified Deals</span>
                                </span>
                                <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-black text-amber-400 shadow-xs">
                                    SARFAESI Auctions
                                </span>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-slate-800">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>20% to 35% Discount</strong> below market valuation benchmarks.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>0% Brokerage</strong> — Direct institutional bank transaction.</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>100% Clean Title</strong> via Statutory Sale Certificate under Rule 9(6).</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                                    <span>Transparent e-bidding with rapid 48-hr full EMD refund if outbid.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Interactive 5-Step Auction Roadmap Guide */}
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                <AuctionRoadmap />
            </div>

            {/* 6. Embedded Financial Loan & EMI Planner */}
            <section className="py-12 sm:py-20 bg-slate-50 border-t border-slate-200/80">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-3.5 py-1 rounded-full mb-3 inline-block">
                            Financing Assistant
                        </span>
                        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            Interactive Bank Auction EMI Calculator
                        </h2>
                        <p className="mt-2 text-xs sm:text-base text-slate-500">
                            Estimate your monthly loan payments and interest component based on property reserve price.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <EmiCalculator defaultPrice={2500000} />
                    </div>
                </div>
            </section>

            {/* 7. Why Bidwallah / Institutional Pillars */}
            <section className="py-12 sm:py-20 bg-white border-t border-slate-200/80">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                            The Bidwallah Advantage
                        </span>
                        <h2 className="mt-2 text-2xl xs:text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Why Invest in Bank Auctions?
                        </h2>
                        <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-500 leading-relaxed">
                            Acquire prime real estate at transparent reserve prices directly from authorized banking institutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-8 hover:border-amber-400 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 mb-5 sm:mb-6 group-hover:scale-105 transition">
                                <Landmark size={24} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Direct Bank Notices
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Direct property notices from State Bank of India, Indian Bank, PNB, and leading institutions without intermediary brokerages.
                            </p>
                        </div>

                        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-8 hover:border-emerald-300 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-5 sm:mb-6 group-hover:scale-105 transition">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                SARFAESI Clear Title
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Governed strictly under the SARFAESI Act, 2002 with statutory sale certificate transfer on successful bid completion.
                            </p>
                        </div>

                        <div className="group rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-50/50 p-5 sm:p-8 hover:border-amber-400 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 border border-amber-500/30 shadow-md mb-5 sm:mb-6 group-hover:scale-105 transition">
                                <TrendingDown size={24} />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900">
                                Distressed Asset Discounts
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Verified valuation benchmarks with reserve prices typically 15% to 35% below surrounding open-market rates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. VIP Deal Alerts Newsletter Card */}
            <section className="py-12 sm:py-16 bg-slate-950 text-white border-t border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none"></div>

                <div className="relative mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
                    <div className="rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-12 shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                            <div className="lg:col-span-7 space-y-3">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                                    <Bell size={13} />
                                    <span>Instant Notification Dispatch</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    Get Daily SARFAESI Auction Alerts
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    Be the first to discover new residential flats, commercial properties, and land parcels published in bank tender gazettes.
                                </p>
                            </div>

                            <div className="lg:col-span-5">
                                {vipSubscribed ? (
                                    <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-2xl text-emerald-300 text-xs font-bold">
                                        <Check size={18} className="text-emerald-400 shrink-0" />
                                        <span>You are subscribed! Daily notices will be delivered to your inbox.</span>
                                    </div>
                                ) : (
                                    <form onSubmit={handleVipSubmit} className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="email"
                                            required
                                            value={vipEmail}
                                            onChange={(e) => setVipEmail(e.target.value)}
                                            placeholder="Enter your email..."
                                            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                                        />
                                        <button
                                            type="submit"
                                            className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-5 py-3 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition cursor-pointer"
                                        >
                                            Subscribe
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Frequently Asked Questions Accordion */}
            <FaqSection />

            {/* 10. Bottom High-Converting Action Banner */}
            <section className="py-12 sm:py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-slate-800">
                <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
                        <Award size={14} className="text-amber-400" />
                        <span>India's Most Trusted Banking Property Platform</span>
                    </div>

                    <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        Ready to Bid on Verified Bank Properties?
                    </h2>

                    <p className="text-slate-300 max-w-xl mx-auto text-xs sm:text-base">
                        Explore thousands of bank auction flats, residential lands, and commercial spaces across India.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        <Link
                            to="/properties"
                            className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black shadow-xl transition duration-200 active:scale-[0.98]"
                        >
                            Browse All Properties
                        </Link>
                        <Link
                            to="/contact"
                            className="w-full sm:w-auto rounded-2xl border border-amber-400/40 bg-slate-900/60 hover:bg-slate-800 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-amber-300 backdrop-blur-md transition"
                        >
                            Contact Banking Desk
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
