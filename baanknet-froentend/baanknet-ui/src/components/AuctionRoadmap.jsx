import React, { useState } from "react";
import { Search, Eye, FileSpreadsheet, Gavel, Award, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuctionRoadmap() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            number: "01",
            title: "Discover & Assess",
            icon: Search,
            tag: "Listing Phase",
            summary: "Browse verified auction notices with reserve price, valuation reports, and boundary details on Bidwallah.",
            checklist: [
                "Inspect verified SARFAESI gazette notification",
                "Compare reserve price vs current circle valuation",
                "Verify Symbolic vs Physical possession status"
            ],
            details:
                "Identify high-potential bank properties on Bidwallah, review reserve price vs market valuation, and verify whether the listing is Physical or Symbolic possession before bidding."
        },
        {
            number: "02",
            title: "Physical Inspection",
            icon: Eye,
            tag: "Due Diligence",
            summary: "Visit the property in person alongside the designated bank officer or asset recovery manager.",
            checklist: [
                "Coordinate with designated nodal branch officer",
                "Inspect building structure, carpet area & boundaries",
                "Verify local municipal dues & electricity sanctions"
            ],
            details:
                "Inspect the physical condition, boundary demarcation, structure, and surrounding locality during the authorized bank inspection window with official bank access."
        },
        {
            number: "03",
            title: "Submit EMD Deposit",
            icon: FileSpreadsheet,
            tag: "Tender Application",
            summary: "Deposit the 10% Earnest Money Deposit (EMD) via NEFT/RTGS to the authorized bank account.",
            checklist: [
                "Transfer 10% EMD to authorized nodal bank escrow",
                "Submit buyer PAN, Aadhaar & KYC proofs",
                "Receive secure e-auction portal bidding login"
            ],
            details:
                "Submit your KYC documents along with the 10% EMD proof before the cutoff date to receive your unique e-bidding login credentials for the official government portal."
        },
        {
            number: "04",
            title: "Participate in E-Auction",
            icon: Gavel,
            tag: "Live Bidding",
            summary: "Place bids on the official government e-auction portal in increments above the reserve price.",
            checklist: [
                "Bid transparently on official e-portal in real time",
                "Incremental bids above statutory reserve price",
                "100% EMD refund within 48 hours if outbid"
            ],
            details:
                "Bid online in real-time transparently. If outbid, your full 10% EMD is refunded by the bank within 24-48 working hours directly into your bank account without deductions."
        },
        {
            number: "05",
            title: "Sale Certificate Transfer",
            icon: Award,
            tag: "Ownership Handover",
            summary: "Pay the balance 75% within 15 days to receive the official SARFAESI Sale Certificate.",
            checklist: [
                "Deposit 25% on auction day, balance 75% in 15 days",
                "Statutory Sale Certificate executed under Rule 9(6)",
                "Clear legal title transfer with direct bank possession"
            ],
            details:
                "The bank executes a 100% encumbrance-free Sale Certificate under Rule 9(6) of Security Interest Rules, transferring clear legal title free of past owner liabilities."
        }
    ];

    return (
        <section className="py-12 sm:py-20 bg-slate-950 text-white rounded-2xl sm:rounded-3xl overflow-hidden my-8 sm:my-12 border border-slate-800 shadow-2xl relative">
            {/* Background Ambient Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-amber-500/12 via-slate-950 to-slate-950 pointer-events-none"></div>

            <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-amber-400 border border-amber-500/30 mb-3 backdrop-blur-md">
                        <ShieldCheck size={14} />
                        <span>Statutory SARFAESI Act 2002 Framework</span>
                    </div>
                    <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                        How Bidwallah Bank Auctions Work
                    </h2>
                    <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
                        A transparent, legally secured 5-step roadmap from initial notice discovery to 100% clean title deed possession.
                    </p>
                </div>

                {/* Step Selector Tabs with Glow */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = activeStep === idx;
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveStep(idx)}
                                className={`flex flex-col items-start p-3 sm:p-4.5 rounded-xl sm:rounded-2xl border transition-all duration-300 text-left cursor-pointer relative overflow-hidden ${
                                    idx === 4 ? "col-span-2 sm:col-span-1" : "col-span-1"
                                } ${
                                    isActive
                                        ? "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 border-amber-400 text-slate-950 font-black shadow-xl shadow-amber-500/25 scale-[1.02]"
                                        : "bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                                }`}
                            >
                                <div className="flex items-center justify-between w-full mb-2 sm:mb-2.5">
                                    <span className={`text-[10px] sm:text-[11px] font-mono font-black ${isActive ? "text-slate-950 bg-amber-300 px-1.5 sm:px-2 py-0.5 rounded-md" : "text-slate-500"}`}>
                                        STEP {step.number}
                                    </span>
                                    <Icon size={16} className={`shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                                </div>
                                <span className={`text-xs sm:text-sm font-black line-clamp-1 ${isActive ? "text-slate-950" : "text-slate-200"}`}>
                                    {step.title}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Step Deep Dive Card */}
                <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-9 backdrop-blur-2xl shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
                            <div className="flex items-center gap-2.5">
                                <span className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-2.5 sm:px-3 py-1 text-xs font-bold text-amber-300">
                                    {steps[activeStep].tag}
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                    Stage {steps[activeStep].number} of 05
                                </span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black text-white">
                                {steps[activeStep].title}
                            </h3>

                            <p className="text-sm text-slate-300 leading-relaxed font-normal">
                                {steps[activeStep].details}
                            </p>

                            {/* Checklist Matrix */}
                            <div className="pt-2">
                                <span className="text-[11px] uppercase font-bold text-amber-400 block mb-2 tracking-wider">
                                    Key Process Checklist:
                                </span>
                                <div className="space-y-2">
                                    {steps[activeStep].checklist.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2.5 text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                                            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Interactive Stage Callout Box */}
                        <div className="lg:col-span-4 flex flex-col justify-center items-center p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-slate-950 border border-amber-500/30 text-center shadow-xl relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

                            <div className="text-5xl font-black text-amber-500 mb-1">
                                {steps[activeStep].number}
                            </div>
                            <span className="text-xs font-black text-slate-200 uppercase tracking-wider">
                                {steps[activeStep].title}
                            </span>
                            <span className="text-[11px] text-amber-300/80 mt-1">
                                100% Legally Protected
                            </span>

                            <div className="mt-6 flex items-center gap-2 w-full">
                                <button
                                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                                    disabled={activeStep === 0}
                                    className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer transition"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
                                    disabled={activeStep === steps.length - 1}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-black text-slate-950 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 cursor-pointer transition shadow-md shadow-amber-500/20"
                                >
                                    Next Stage
                                </button>
                            </div>

                            <Link
                                to="/properties"
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                            >
                                <span>Browse Properties for this stage</span>
                                <ArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
