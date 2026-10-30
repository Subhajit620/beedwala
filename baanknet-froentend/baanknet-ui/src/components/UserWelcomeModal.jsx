import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    Landmark,
    MapPin,
    Film,
    ArrowRight,
    CheckCircle2,
    X,
    Compass,
    ShieldCheck,
    DollarSign,
    PhoneCall
} from "lucide-react";

/**
 * Animated Buyer Welcome & Smart Property Finder Popup for the public User Dashboard (Home & Navbar).
 * Gives buyers a friendly, animated choice between:
 *  - Fresh Property (Direct from Admin · No Auction) -> /fresh-properties
 *  - Bank Auction Property (SARFAESI Notices) -> /properties
 * Plus quick budget filters and a 3-step interactive buyer walkthrough.
 */
export default function UserWelcomeModal({
    isOpen,
    onClose,
    stats = {},
    freshCount = 0
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("finder"); // "finder" | "guide"
    const [guideStep, setGuideStep] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const totalAuction = stats?.totalProperties || 1499;

    const budgetShortcuts = [
        { label: "Under ₹25 Lakhs", min: 0, max: 2500000 },
        { label: "₹25L – ₹50L", min: 2500000, max: 5000000 },
        { label: "₹50L – ₹1 Cr", min: 5000000, max: 10000000 },
        { label: "Above ₹1 Crore", min: 10000000, max: null }
    ];

    const guideSlides = [
        {
            badge: "Step 1 of 3 • Choose Your Buying Path",
            title: "Fresh Property (No Auction) vs. Bank Auction",
            description:
                "Bidwallah gives you two transparent ways to buy verified real estate — pick whichever matches your preference.",
            highlights: [
                "Fresh Property (/fresh-properties): Uploaded directly by Bidwallah Admin at a fixed price. No auction, no bidding, no EMD.",
                "Auction Property (/properties): Official SARFAESI bank notices at 20%–35% below market valuation with 0% brokerage."
            ],
            ctaText: "Explore Fresh Properties",
            ctaAction: () => {
                onClose();
                navigate("/fresh-properties");
            }
        },
        {
            badge: "Step 2 of 3 • Verified Media & Exact GPS",
            title: "Watch Property Videos & Pinpoint Map Locations",
            description:
                "Every listing is curated with rich details so you can inspect the asset from your phone or laptop before visiting.",
            highlights: [
                "Watch HD property walkthrough videos & high-resolution photo galleries right on the card.",
                "Click 'View exact location on Google Maps' to inspect the neighborhood and exact GPS coordinates."
            ],
            ctaText: "Browse Bank Auctions",
            ctaAction: () => {
                onClose();
                navigate("/properties");
            }
        },
        {
            badge: "Step 3 of 3 • Instant Admin Connection",
            title: "Click 'I'm Interested' to Connect Directly",
            description:
                "No middlemen or broker commissions. Send your enquiry in 10 seconds and our property desk reaches out immediately.",
            highlights: [
                "On any Fresh Property, click 'I'm Interested — Contact Us' to connect directly with the Bidwallah Admin.",
                "Save your favorite listings to your Watchlist or compare up to 3 properties side-by-side."
            ],
            ctaText: "Talk to Property Desk",
            ctaAction: () => {
                onClose();
                navigate("/contact");
            }
        }
    ];

    const currentSlide = guideSlides[guideStep];

    const handleBudgetNavigate = (preset) => {
        const params = new URLSearchParams();
        if (preset.min !== null) params.set("minPrice", preset.min);
        if (preset.max !== null) params.set("maxPrice", preset.max);
        onClose();
        navigate(`/search?${params.toString()}`);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Bidwallah Smart Property Finder and Buyer Guide"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Spring-Animated Modal Card */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl animate-popup-spring">
                {/* Ambient Drifting Glow Orbs */}
                <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl animate-orb-drift" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl animate-orb-drift" />

                {/* Top Header Bar */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 px-5 sm:px-6 py-4 bg-slate-900/70">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md animate-pulse-glow">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                                Welcome to Bidwallah
                            </span>
                            <h3 className="text-sm sm:text-base font-black text-white">
                                Smart Property Finder &amp; Buyer Guide
                            </h3>
                        </div>
                    </div>

                    {/* Mode Switcher Pills + Close Button */}
                    <div className="flex items-center gap-2">
                        <div className="hidden xs:flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab("finder")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                    activeTab === "finder"
                                        ? "bg-amber-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Property Finder
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("guide")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    activeTab === "guide"
                                        ? "bg-amber-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Compass size={12} />
                                <span>How It Works</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close buyer guide popup"
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="relative z-10 p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
                    {activeTab === "finder" ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-white">
                                        How would you like to buy your property?
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Choose direct purchase from Admin (no auction) or discounted SARFAESI bank auctions.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-bold text-emerald-400">
                                        {freshCount} Fresh Direct
                                    </span>
                                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 font-bold text-amber-400">
                                        {totalAuction.toLocaleString("en-IN")} Bank Auctions
                                    </span>
                                </div>
                            </div>

                            {/* Two Main Animated Buyer Choice Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Choice 1: Fresh Property (Direct from Admin · No Auction) */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/fresh-properties");
                                    }}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 p-5 text-left hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-pulse-emerald"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                                                <Sparkles size={22} />
                                            </div>
                                            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                                                Direct Sale • No Auction
                                            </span>
                                        </div>

                                        <h5 className="mt-4 text-base font-black text-white group-hover:text-emerald-300 transition">
                                            Fresh Properties (Admin Direct)
                                        </h5>
                                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                                            Handpicked properties uploaded directly by Bidwallah Admin at a fixed price. No bidding or EMD — just click <strong>&ldquo;I&apos;m Interested&rdquo;</strong> to connect with Admin.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-emerald-300/90">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <ShieldCheck size={10} /> Direct Admin Deal
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <Film size={10} /> Photos, Video &amp; GPS
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-black text-emerald-400">
                                        <span>View Fresh Properties</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition" />
                                    </div>
                                </button>

                                {/* Choice 2: Bank Auction Property (SARFAESI Notices) */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/properties");
                                    }}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 p-5 text-left hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-pulse-glow"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                                                <Landmark size={22} />
                                            </div>
                                            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                                                20%–35% Below Market
                                            </span>
                                        </div>

                                        <h5 className="mt-4 text-base font-black text-white group-hover:text-amber-300 transition">
                                            Bank Auction Properties
                                        </h5>
                                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                                            Verified SARFAESI bank notices from SBI, PNB, Indian Bank &amp; 13+ institutions with transparent reserve prices and <strong>0% brokerage</strong>.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-amber-300/90">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <ShieldCheck size={10} /> Clean Title Deed
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <MapPin size={10} /> All Major Cities
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs font-black text-amber-400">
                                        <span>Explore Bank Auctions</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition" />
                                    </div>
                                </button>
                            </div>

                            {/* Quick Budget Filter Bar */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                        <DollarSign size={13} className="text-amber-400" />
                                        <span>Quick Search by Budget:</span>
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {budgetShortcuts.map((preset, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleBudgetNavigate(preset)}
                                                className="rounded-xl border border-slate-700 bg-slate-950 hover:border-amber-400/60 hover:bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-amber-300 transition cursor-pointer"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Strip: Direct Contact + 3-Step Buyer Guide */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/contact");
                                    }}
                                    className="flex items-center gap-3 text-left hover:opacity-90 transition cursor-pointer"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        <PhoneCall size={16} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white block">
                                            Need Personal Assistance from Admin?
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            Connect directly with our property advisory desk →
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("guide");
                                        setGuideStep(0);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-amber-400 transition cursor-pointer shrink-0"
                                >
                                    <Compass size={14} />
                                    <span>How Buying Works (3 Steps)</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* 3-Step Interactive Buyer Guide Tab */
                        <div className="space-y-5 animate-fade-in" key={guideStep}>
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-black text-amber-400">
                                    {currentSlide.badge}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {guideSlides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setGuideStep(idx)}
                                            aria-label={`Go to buyer guide step ${idx + 1}`}
                                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                                idx === guideStep
                                                    ? "w-7 bg-amber-400"
                                                    : "w-2 bg-slate-700 hover:bg-slate-500"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
                                <h4 className="text-lg font-black text-white">{currentSlide.title}</h4>
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                    {currentSlide.description}
                                </p>
                                <div className="space-y-2 pt-2">
                                    {currentSlide.highlights.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("finder")}
                                    className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                                >
                                    ← Back to Property Finder
                                </button>

                                <div className="flex items-center gap-2">
                                    {guideStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setGuideStep((s) => s - 1)}
                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {guideStep < guideSlides.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setGuideStep((s) => s + 1)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 cursor-pointer"
                                        >
                                            <span>Next Step</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={currentSlide.ctaAction}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 cursor-pointer"
                                        >
                                            <span>{currentSlide.ctaText}</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
