import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
    Calculator,
    Bell,
    Check
} from "lucide-react";

import { fetchProperties, fetchPropertyStats } from "../services/propertyService";
import Hero from "../components/Hero";
import PropertyGrid from "../components/PropertyGrid";
import BankPartnersMarquee from "../components/BankPartnersMarquee";
import AuctionRoadmap from "../components/AuctionRoadmap";
import FaqSection from "../components/FaqSection";
import EmiCalculator from "../components/EmiCalculator";
import { PropertyGridSkeleton } from "../components/Loading";
import { useApp } from "../context/AppContext";

export default function Home() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [featuredTab, setFeaturedTab] = useState("all");
    const [vipEmail, setVipEmail] = useState("");
    const [vipSubscribed, setVipSubscribed] = useState(false);
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

            // Fetch live server stats and featured listings concurrently
            const [statsRes, propertiesRes] = await Promise.all([
                fetchPropertyStats().catch((e) => {
                    console.warn("Failed to fetch stats:", e);
                    return null;
                }),
                fetchProperties({ limit: 12, sort: "newest" })
            ]);

            if (statsRes && statsRes.success && statsRes.data) {
                setStats({
                    totalProperties: statsRes.data.totalProperties || 1499,
                    activeListings: statsRes.data.activeListings || 1499,
                    totalStates: statsRes.data.totalStates || 1,
                    totalBanks: statsRes.data.totalBanks || 13
                });
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
        loadData();
    }, [loadData]);

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
            {/* 1. Hero Section with multi-parameter search console & animated image */}
            <Hero stats={stats} />

            {/* 2. Institutional Banking Partners Bar */}
            <BankPartnersMarquee />

            {/* 3. Featured Bank Auction Properties Section */}
            <section className="py-16 sm:py-20 bg-slate-50 relative">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2 shadow-xs">
                                <Flame size={13} className="text-amber-600" />
                                <span>Verified Bank Inventories</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                                Latest Bank Auction Properties
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 font-normal">
                                Fresh verified bank auction notices across residential, commercial, and industrial sectors with official reserve prices.
                            </p>
                        </div>

                        {/* Category Selector Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition duration-200 cursor-pointer shrink-0 ${
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
                        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto mb-8">
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
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center my-6 shadow-xs">
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
                        <div className="mt-12 text-center">
                            <Link
                                to="/properties"
                                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-8 py-4 text-sm font-black text-white shadow-xl shadow-amber-500/25 transition duration-200 active:scale-[0.98] cursor-pointer"
                            >
                                <span>Explore Complete Directory ({stats.totalProperties.toLocaleString("en-IN")} Properties)</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* 4. Open Market vs Bank Auction Interactive Comparison Section */}
            <section className="py-16 sm:py-20 bg-white border-y border-slate-200/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-3.5 py-1 rounded-full mb-3 inline-block">
                            Value Proposition
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            Open Market vs Bank Auction On Bidwallah
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-500 font-normal">
                            Why sophisticated buyers and real estate investors prefer SARFAESI bank auctions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Traditional Open Market Card */}
                        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 sm:p-9 shadow-xs space-y-6">
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
                        <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 p-7 sm:p-9 shadow-xl space-y-6 relative overflow-hidden">
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <AuctionRoadmap />
            </div>

            {/* 6. Embedded Financial Loan & EMI Planner */}
            <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-3.5 py-1 rounded-full mb-3 inline-block">
                            Financing Assistant
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                            Interactive Bank Auction EMI Calculator
                        </h2>
                        <p className="mt-2 text-sm sm:text-base text-slate-500">
                            Estimate your monthly loan payments and interest component based on property reserve price.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <EmiCalculator defaultPrice={2500000} />
                    </div>
                </div>
            </section>

            {/* 7. Why Bidwallah / Institutional Pillars */}
            <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                            The Bidwallah Advantage
                        </span>
                        <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Why Invest in Bank Auctions?
                        </h2>
                        <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed">
                            Acquire prime real estate at transparent reserve prices directly from authorized banking institutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-amber-400 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 mb-6 group-hover:scale-105 transition">
                                <Landmark size={26} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                Direct Bank Notices
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Direct property notices from State Bank of India, Indian Bank, PNB, and leading institutions without intermediary brokerages.
                            </p>
                        </div>

                        <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-emerald-300 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 mb-6 group-hover:scale-105 transition">
                                <ShieldCheck size={26} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                SARFAESI Clear Title
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Governed strictly under the SARFAESI Act, 2002 with statutory sale certificate transfer on successful bid completion.
                            </p>
                        </div>

                        <div className="group rounded-3xl border border-slate-200/90 bg-slate-50/50 p-8 hover:border-amber-400 hover:bg-white hover:shadow-xl transition duration-300">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-amber-400 border border-amber-500/30 shadow-md mb-6 group-hover:scale-105 transition">
                                <TrendingDown size={26} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                Distressed Asset Discounts
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                                Verified valuation benchmarks with reserve prices typically 15% to 35% below surrounding open-market rates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. VIP Deal Alerts Newsletter Card */}
            <section className="py-16 bg-slate-950 text-white border-t border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-amber-500/10 via-slate-950 to-slate-950 pointer-events-none"></div>

                <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7 space-y-3">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                                    <Bell size={13} />
                                    <span>Instant Notification Dispatch</span>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                    Get Daily SARFAESI Auction Alerts
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
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
            <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border-t border-slate-800">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
                        <Award size={14} className="text-amber-400" />
                        <span>India's Most Trusted Banking Property Platform</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                        Ready to Bid on Verified Bank Properties?
                    </h2>

                    <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
                        Explore thousands of bank auction flats, residential lands, and commercial spaces across India.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/properties"
                            className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 px-8 py-4 text-sm font-black shadow-xl transition duration-200 active:scale-[0.98]"
                        >
                            Browse All Properties
                        </Link>
                        <Link
                            to="/contact"
                            className="w-full sm:w-auto rounded-2xl border border-amber-400/40 bg-slate-900/60 hover:bg-slate-800 px-8 py-4 text-sm font-bold text-amber-300 backdrop-blur-md transition"
                        >
                            Contact Banking Desk
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
