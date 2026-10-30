import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    Landmark,
    Plus,
    Mail,
    MapPin,
    Film,
    ArrowRight,
    CheckCircle2,
    X,
    Zap,
    Compass
} from "lucide-react";

/**
 * Interactive, animated Quick-Launch & Welcome Tour Popup for the Admin Dashboard.
 * Lets the admin:
 *  - Choose directly between creating a "Fresh Property (Direct Sale · No Auction)" or "Auction Property"
 *  - Step through a visual 3-slide interactive guide (Fresh vs Auction, GPS + Video Uploads, Buyer Leads CRM)
 */
export default function DashboardQuickLaunchModal({
    isOpen,
    onClose,
    stats = {},
    freshCount = 0
}) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("launch"); // "launch" | "tour"
    const [tourStep, setTourStep] = useState(0);

    if (!isOpen) return null;

    const totalAuction = stats?.totalProperties || 0;
    const newLeads = stats?.newInquiries || 0;

    const tourSlides = [
        {
            badge: "Step 1 of 3 • Two Distinct Property Lists",
            title: "Fresh Property vs. Auction Property",
            description:
                "Bidwallah keeps your direct-sale listings completely separate from bank auction notices so buyers never get confused.",
            highlights: [
                "Fresh Property (/fresh-properties): Admin-only direct sale at a fixed asking price — no auction, no bidding, no EMD.",
                "Auction Property (/properties): Bank SARFAESI auction listings with reserve price, bank branch & possession type."
            ],
            ctaText: "Add a Fresh Property Now",
            ctaAction: () => {
                onClose();
                navigate("/admin/fresh-properties");
            }
        },
        {
            badge: "Step 2 of 3 • Smart Location & Media",
            title: "1-Click Current GPS & Video Walkthroughs",
            description:
                "Both Fresh Property and Auction Property forms include smart tools to publish listings in seconds.",
            highlights: [
                "Click 'Use Current Location' on the map to auto-fill Address, City, State & Pincode automatically.",
                "Upload property photos & walkthrough videos (MP4/WebM/MOV up to 200 MB or YouTube/Vimeo links)."
            ],
            ctaText: "Open Property Creator",
            ctaAction: () => {
                onClose();
                navigate("/admin/properties/new");
            }
        },
        {
            badge: "Step 3 of 3 • Direct Buyer Connection",
            title: "Instant Buyer Enquiries & WhatsApp Dispatch",
            description:
                "When a buyer clicks 'I'm Interested' on a Fresh Property or 'Inquire' on an Auction Property, the lead lands straight in your CRM.",
            highlights: [
                "Fresh Property leads are tagged with a green 'FRESH · Direct sale' badge.",
                "Reply in 1 click via WhatsApp or direct phone call from the dashboard."
            ],
            ctaText: "Open Buyer Inquiries CRM",
            ctaAction: () => {
                onClose();
                navigate("/admin/inquiries");
            }
        }
    ];

    const currentSlide = tourSlides[tourStep];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Admin Quick Launch and Interactive Guide"
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Card */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl animate-popup-spring">
                {/* Decorative Animated Gradient Orbs */}
                <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl animate-orb-drift" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl animate-orb-drift" />

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-md animate-pulse-glow">
                            <Zap size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                                Bidwallah Smart Assistant
                            </span>
                            <h3 className="text-base font-black text-white">
                                Quick Action & Welcome Hub
                            </h3>
                        </div>
                    </div>

                    {/* Mode Switcher Pills */}
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab("launch")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                    activeTab === "launch"
                                        ? "bg-amber-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Quick Launch
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("tour")}
                                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                    activeTab === "tour"
                                        ? "bg-amber-500 text-slate-950"
                                        : "text-slate-400 hover:text-white"
                                }`}
                            >
                                <Compass size={12} />
                                <span>3-Step Guide</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close popup"
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="relative z-10 p-6 space-y-5">
                    {activeTab === "launch" ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-white">
                                        What would you like to do right now?
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Choose a property type to publish or jump straight to your buyer leads.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 font-bold text-emerald-400">
                                        {freshCount} Fresh
                                    </span>
                                    <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 font-bold text-amber-400">
                                        {totalAuction.toLocaleString("en-IN")} Auction
                                    </span>
                                </div>
                            </div>

                            {/* Two Big Animated Choice Cards: Fresh Property vs Auction Property */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Card 1: Fresh Property (Direct Sale) */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/admin/fresh-properties");
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
                                            Add / Manage Fresh Property
                                        </h5>
                                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                                            Upload admin-only property at a fixed asking price. Buyers see it on <strong>Fresh Property</strong> &amp; connect directly with you.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-emerald-300/90">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <MapPin size={10} /> Current GPS
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <Film size={10} /> Photo &amp; Video Upload
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-black text-emerald-400">
                                        <span>Open Fresh Properties</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition" />
                                    </div>
                                </button>

                                {/* Card 2: Auction Property */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/admin/properties/new");
                                    }}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 p-5 text-left hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-pulse-glow"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                                                <Landmark size={22} />
                                            </div>
                                            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300">
                                                Bank SARFAESI Notice
                                            </span>
                                        </div>

                                        <h5 className="mt-4 text-base font-black text-white group-hover:text-amber-300 transition">
                                            Add Auction Property
                                        </h5>
                                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                                            Publish a bank auction listing with reserve price, lending bank &amp; possession type to the <strong>Auction Property</strong> list.
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-semibold text-amber-300/90">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <MapPin size={10} /> Map Pin &amp; Lat/Lng
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/60 px-2 py-0.5">
                                                <Plus size={10} /> Live Card Preview
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs font-black text-amber-400">
                                        <span>Create Auction Listing</span>
                                        <ArrowRight size={15} className="group-hover:translate-x-1.5 transition" />
                                    </div>
                                </button>
                            </div>

                            {/* Bottom Quick Strip: Buyer Leads + Interactive Guide */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate("/admin/inquiries");
                                    }}
                                    className="flex items-center gap-3 text-left hover:opacity-90 transition cursor-pointer"
                                >
                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                        <Mail size={16} />
                                        {newLeads > 0 && (
                                            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-xs font-black text-white block">
                                            Buyer Inquiries &amp; Leads CRM ({newLeads} New)
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            View Fresh Property &amp; Auction enquiries and reply on WhatsApp →
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab("tour");
                                        setTourStep(0);
                                    }}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-amber-400 transition cursor-pointer shrink-0"
                                >
                                    <Compass size={14} />
                                    <span>How It Works (3 Steps)</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* 3-Step Interactive Guide Tab */
                        <div className="space-y-5 animate-fade-in" key={tourStep}>
                            <div className="flex items-center justify-between">
                                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-black text-amber-400">
                                    {currentSlide.badge}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {tourSlides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setTourStep(idx)}
                                            aria-label={`Go to step ${idx + 1}`}
                                            className={`h-2 rounded-full transition-all cursor-pointer ${
                                                idx === tourStep ? "w-7 bg-amber-400" : "w-2 bg-slate-700 hover:bg-slate-500"
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
                                    onClick={() => setActiveTab("launch")}
                                    className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                                >
                                    ← Back to Quick Launch
                                </button>

                                <div className="flex items-center gap-2">
                                    {tourStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setTourStep((s) => s - 1)}
                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {tourStep < tourSlides.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => setTourStep((s) => s + 1)}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 cursor-pointer"
                                        >
                                            <span>Next Tip</span>
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
