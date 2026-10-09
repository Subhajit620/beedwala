import React from "react";
import { Link } from "react-router-dom";
import {
    Building2,
    ShieldCheck,
    Landmark,
    FileCheck2,
    ArrowRight
} from "lucide-react";

export default function About() {
    return (
        <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-14">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full inline-block mb-3">
                        About Bidwallah
                    </span>
                    <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Empowering Transparent Bank Auction Real Estate
                    </h1>
                    <p className="mt-3 text-base text-slate-600 leading-relaxed">
                        Bidwallah is a premier property marketplace that organizes, indexes, and presents verified bank auction properties directly from India's authorized financial institutions.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs mb-10 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 size={20} className="text-amber-500" />
                        <span>Our Mission</span>
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Historically, bank auction properties and SARFAESI notices have been scattered across diverse newspaper notices, regional gazettes, and disconnected bank portals. Bidwallah bridges this gap by creating a unified, reliable, and user-friendly digital marketplace where investors, homeowners, and businesses can discover high-value properties at competitive reserve prices.
                    </p>
                </div>

                {/* Core Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400/40 transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 border border-amber-200/50">
                            <ShieldCheck size={22} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Direct & Authentic</h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            All listings are synchronized directly from authorized bank tenders and recovery tribunal notifications.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400/40 transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 border border-amber-200/50">
                            <Landmark size={22} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Multi-Bank Coverage</h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Aggregating residential, commercial, and industrial properties across major national and private banks.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-amber-400/40 transition">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-4 border border-amber-200/50">
                            <FileCheck2 size={22} />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Clear Property Specs</h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                            Structured data with transparent reserve prices, built-up areas, possession status, and branch contacts.
                        </p>
                    </div>
                </div>

                {/* CTA Card */}
                <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-10 text-center shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black tracking-tight">Ready to find your ideal property?</h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                            Explore our current live inventory of verified residential and commercial bank auction deals across India.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/properties"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                            >
                                <span>Browse Properties</span>
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
