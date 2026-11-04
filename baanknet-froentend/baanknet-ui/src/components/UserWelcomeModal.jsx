import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Film,
    ArrowRight,
    CheckCircle2,
    X,
    ShieldCheck,
    DollarSign,
    PhoneCall
} from "lucide-react";
import {
    DirectPropertyEmblem,
    BankAuctionEmblem,
    VerifiedSealIcon,
    PropertyFinderIcon
} from "./BrandIcons";

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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/35 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Bidwallah Smart Property Finder and Buyer Guide"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Spring-Animated Modal Card */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white text-gray-900 shadow-2xl animate-popup-spring">
                {/* Ambient Drifting Glow Orbs */}
                <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-red-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-gray-200/60 blur-3xl" />

                {/* Top Header Bar */}
                <div className="relative z-10 flex items-center justify-between border-b border-gray-200/80 px-5 sm:px-6 py-4 bg-gradient-to-r from-red-50/70 via-white to-gray-50">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                            <PropertyFinderIcon size={17} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block">
                                Welcome to Bidwallah
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900">
                                Smart Property Finder &amp; Buyer Guide
                            </h3>
                        </div>
                    </div>

                    {/* Mode Switcher Pills + Close Button */}
                    <div className="flex items-center gap-2">
                        <div className="hidden xs:flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setActiveTab("finder")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                    activeTab === "finder"
                                        ? "bg-red-600 text-white shadow-2xs"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Property Finder
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("guide")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    activeTab === "guide"
                                        ? "bg-red-600 text-white shadow-2xs"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                <VerifiedSealIcon size={12} />
                                <span>How It Works</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close buyer guide popup"
                            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition cursor-pointer"
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
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                                        How would you like to buy your property?
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Choose direct purchase from Admin (no auction) or discounted SARFAESI bank auctions.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 font-bold text-gray-700">
                                        {freshCount} Fresh Direct
                                    </span>
                                    <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 font-bold text-red-700">
                                        {totalAuction.toLocaleString("en-IN")} Bank Auctions
                                    </span>
                                </div>
                            </div>

                            {/* Two Main Buyer Choice Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Choice 1: Fresh Property (Direct from Admin · No Auction) */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/fresh-properties");
                                    }}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/70 p-5 text-left hover:bg-white hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-900 shadow-2xs group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition">
                                                <DirectPropertyEmblem className="h-5 w-5" />
                                            </div>
                                            <span className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                                                Direct Sale • No Auction
                                            </span>
                                        </div>

                                        <h5 className="mt-4 text-base font-bold text-gray-900 group-hover:text-red-600 transition">
                                            Fresh Properties (Admin Direct)
                                        </h5>
                                        <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                                            Handpicked properties uploaded directly by Bidwallah Admin at a fixed price. No bidding or EMD — just click <strong>&ldquo;I&apos;m Interested&rdquo;</strong> to connect with Admin.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-gray-700">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-0.5">
                                                <ShieldCheck size={10} className="text-red-600" /> Direct Admin Deal
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-0.5">
                                                <Film size={10} className="text-gray-600" /> Photos, Video &amp; GPS
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs font-bold text-gray-900 group-hover:text-red-600">
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
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/45 via-white to-gray-50 p-5 text-left hover:border-red-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-2xs group-hover:bg-red-600 group-hover:text-white transition">
                                                <BankAuctionEmblem className="h-5 w-5" />
                                            </div>
                                            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                                                20%–35% Below Market
                                            </span>
                                        </div>

                                        <h5 className="mt-4 text-base font-bold text-gray-900 group-hover:text-red-600 transition">
                                            Bank Auction Properties
                                        </h5>
                                        <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                                            Verified SARFAESI bank notices from SBI, HDFC Bank, PNB, Indian Bank &amp; 13+ institutions with transparent reserve prices and <strong>0% brokerage</strong>.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-gray-700">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-red-200/70 px-2 py-0.5">
                                                <ShieldCheck size={10} className="text-red-600" /> Clean Title Deed
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white border border-gray-200 px-2 py-0.5">
                                                <MapPin size={10} className="text-red-600" /> All Major Cities
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between text-xs font-bold text-red-600">
                                        <span>Explore Bank Auctions</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition" />
                                    </div>
                                </button>
                            </div>

                            {/* Quick Budget Filter Bar */}
                            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-3.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                                        <DollarSign size={13} className="text-red-600" />
                                        <span>Quick Search by Budget:</span>
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {budgetShortcuts.map((preset, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleBudgetNavigate(preset)}
                                                className="rounded-xl border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-red-700 transition cursor-pointer"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Strip: Direct Contact + 3-Step Buyer Guide */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3.5">
                                <a
                                    href="tel:+917439409340"
                                    className="flex items-center gap-3 text-left hover:opacity-90 transition cursor-pointer"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200">
                                        <PhoneCall size={16} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 block">
                                            Call Advisory Desk: +91 74394 09340
                                        </span>
                                        <span className="text-[11px] text-gray-500">
                                            Direct phone assistance for site visits &amp; bidding →
                                        </span>
                                    </div>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("guide");
                                        setGuideStep(0);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 px-3.5 py-2 text-xs font-bold text-gray-800 hover:text-red-700 transition cursor-pointer shrink-0"
                                >
                                    <PropertyFinderIcon size={14} className="text-red-600" />
                                    <span>How Buying Works (3 Steps)</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* 3-Step Interactive Buyer Guide Tab */
                        <div className="space-y-5 animate-fade-in" key={guideStep}>
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-[11px] font-bold text-red-700">
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
                                                    ? "w-7 bg-red-600"
                                                    : "w-2 bg-gray-300 hover:bg-gray-400"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-3">
                                <h4 className="text-lg font-bold text-gray-900">{currentSlide.title}</h4>
                                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                                    {currentSlide.description}
                                </p>
                                <div className="space-y-2 pt-2">
                                    {currentSlide.highlights.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                                            <CheckCircle2 size={15} className="text-red-600 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("finder")}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
                                >
                                    ← Back to Property Finder
                                </button>

                                <div className="flex items-center gap-2">
                                    {guideStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setGuideStep((s) => s - 1)}
                                            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {guideStep < guideSlides.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setGuideStep((s) => s + 1)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                                        >
                                            <span>Next Step</span>
                                            <ArrowRight size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={currentSlide.ctaAction}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white cursor-pointer"
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
