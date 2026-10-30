import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function BankPartnersMarquee() {
    const navigate = useNavigate();

    const partnerBanks = [
        { name: "Indian Bank", icon: "🏛️", count: "Live Auctions", color: "from-blue-500/10 to-amber-500/10" },
        { name: "State Bank of India", icon: "🏦", count: "SARFAESI", color: "from-sky-500/10 to-amber-500/10" },
        { name: "Punjab National Bank", icon: "🏛️", count: "E-Auctions", color: "from-amber-500/10 to-yellow-500/10" },
        { name: "Bank of Baroda", icon: "🏦", count: "Verified", color: "from-orange-500/10 to-amber-500/10" },
        { name: "Canara Bank", icon: "🏛️", count: "Tenders", color: "from-blue-600/10 to-amber-500/10" },
        { name: "Union Bank of India", icon: "🏦", count: "Asset Sale", color: "from-rose-500/10 to-amber-500/10" },
        { name: "UCO Bank", icon: "🏛️", count: "Direct Bank", color: "from-emerald-500/10 to-amber-500/10" },
        { name: "Central Bank of India", icon: "🏦", count: "Commercial", color: "from-indigo-500/10 to-amber-500/10" },
        { name: "HDFC Bank", icon: "🏛️", count: "Distressed Asset", color: "from-blue-700/10 to-amber-500/10" },
        { name: "ICICI Bank", icon: "🏦", count: "Fast Recovery", color: "from-amber-600/10 to-red-500/10" },
        { name: "Bank of India", icon: "🏛️", count: "DRT Auctions", color: "from-orange-600/10 to-amber-500/10" },
        { name: "Axis Bank", icon: "🏦", count: "E-Tender", color: "from-purple-500/10 to-amber-500/10" }
    ];

    const handleBankClick = (bankName) => {
        navigate(`/search?bank=${encodeURIComponent(bankName)}`);
    };

    return (
        <section className="py-14 bg-white border-y border-slate-200/80 overflow-hidden relative">
            {/* Subtle Gradient background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-50/50 via-transparent to-transparent pointer-events-none"></div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-3 py-1 rounded-full mb-2">
                            <ShieldCheck size={14} className="text-amber-600" />
                            <span>Institutional Banking Network</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                            Partner Public & Private Sector Banks
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Sparkles size={14} className="text-amber-500" />
                        <span>Click any institution to browse its verified SARFAESI auction pipeline</span>
                    </div>
                </div>

                {/* Grid of Bank Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                    {partnerBanks.map((bank, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleBankClick(bank.name)}
                            className="group relative flex flex-col items-center justify-center p-4 rounded-3xl border border-slate-200/90 bg-white hover:bg-gradient-to-b hover:from-amber-50/60 hover:to-white hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer text-center overflow-hidden"
                        >
                            <div className="text-3xl mb-2 group-hover:scale-115 transition-transform duration-200">
                                {bank.icon}
                            </div>
                            <span className="text-xs font-black text-slate-900 group-hover:text-amber-800 line-clamp-1">
                                {bank.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1 group-hover:text-amber-700">
                                {bank.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
