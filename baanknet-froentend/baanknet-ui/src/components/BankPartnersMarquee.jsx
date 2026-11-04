import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { VerifiedSealIcon } from "./BrandIcons";
import { BankLogo } from "./BankLogos";

/**
 * Interactive 3D Perspective Bank Card with realistic depth layers,
 * floating 3D logo pedestal, tactile bottom bevel, and dynamic specular glare.
 */
function Bank3DCard({ bank, onSelect }) {
    const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 30, active: false });

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const ry = (x - 0.5) * 18;
        const rx = (0.5 - y) * 18;
        setTilt({
            rx,
            ry,
            gx: Math.round(x * 100),
            gy: Math.round(y * 100),
            active: true
        });
    };

    const handleMouseLeave = () => {
        setTilt({ rx: 0, ry: 0, gx: 50, gy: 30, active: false });
    };

    return (
        <div
            className="relative"
            style={{ perspective: "950px" }}
        >
            <button
                type="button"
                onClick={() => onSelect(bank.name)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    transform: tilt.active
                        ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px) scale3d(1.03, 1.03, 1.03)`
                        : "rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)",
                    transformStyle: "preserve-3d",
                    transition: tilt.active
                        ? "transform 90ms ease-out, box-shadow 200ms ease"
                        : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 350ms ease"
                }}
                className={`group relative flex w-full flex-col items-center justify-between rounded-2xl border border-gray-200/90 border-b-4 ${bank.bevelColor} bg-gradient-to-b from-white via-white to-gray-50/90 p-4 pt-5 text-center shadow-[0_10px_24px_-10px_rgba(15,23,42,0.14),0_2px_6px_-1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] hover:shadow-[0_22px_38px_-12px_rgba(15,23,42,0.22),0_6px_14px_-4px_rgba(220,38,38,0.12),inset_0_1px_0_rgba(255,255,255,1)] cursor-pointer select-none`}
            >
                {/* Dynamic 3D Specular Light Reflection */}
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200"
                    style={{
                        opacity: tilt.active ? 1 : 0,
                        background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%)`
                    }}
                />

                {/* Soft Brand-Colored Ambient Halo Behind Pedestal */}
                <div
                    className={`pointer-events-none absolute top-3 h-14 w-14 rounded-full blur-xl opacity-45 group-hover:opacity-80 transition duration-300 ${bank.glowColor}`}
                />

                {/* 3D Floating Logo Pedestal (Layer Z + 26px) */}
                <div
                    style={{ transform: "translateZ(26px)" }}
                    className={`relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50 p-2 shadow-[0_10px_18px_-6px_rgba(15,23,42,0.18),0_2px_4px_rgba(15,23,42,0.06),inset_0_1.5px_0_rgba(255,255,255,1)] transition-all duration-300 ${bank.pedestalHover}`}
                >
                    <BankLogo name={bank.name} hovered={tilt.active} className="h-11 w-11 drop-shadow-xs" />
                </div>

                {/* 3D Floating Bank Title & Pill (Layer Z + 16px) */}
                <div
                    style={{ transform: "translateZ(16px)" }}
                    className="w-full space-y-1"
                >
                    <span className="block text-xs font-extrabold text-gray-900 group-hover:text-red-700 transition line-clamp-1">
                        {bank.name}
                    </span>

                    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100/90 border border-gray-200/80 px-2.5 py-0.5 text-[10px] font-bold text-gray-600 group-hover:bg-red-50 group-hover:text-red-700 group-hover:border-red-200 transition">
                        <span>{bank.count}</span>
                        <ArrowUpRight size={10} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                </div>
            </button>
        </div>
    );
}

export default function BankPartnersMarquee() {
    const navigate = useNavigate();

    const partnerBanks = [
        {
            name: "State Bank of India",
            count: "SARFAESI Desk",
            bevelColor: "border-b-sky-500/80 hover:border-sky-400",
            glowColor: "bg-sky-400/35",
            pedestalHover: "group-hover:from-sky-600 group-hover:to-blue-800 group-hover:border-sky-500 group-hover:shadow-sky-500/30"
        },
        {
            name: "HDFC Bank",
            count: "Partner Bank",
            bevelColor: "border-b-red-600/80 hover:border-red-400",
            glowColor: "bg-red-500/35",
            pedestalHover: "group-hover:from-red-600 group-hover:to-rose-800 group-hover:border-red-500 group-hover:shadow-red-500/30"
        },
        {
            name: "Punjab National Bank",
            count: "E-Auctions",
            bevelColor: "border-b-rose-800/80 hover:border-rose-500",
            glowColor: "bg-amber-400/35",
            pedestalHover: "group-hover:from-rose-800 group-hover:to-red-950 group-hover:border-amber-400 group-hover:shadow-rose-700/30"
        },
        {
            name: "Indian Bank",
            count: "Live Auctions",
            bevelColor: "border-b-blue-700/80 hover:border-blue-400",
            glowColor: "bg-blue-500/35",
            pedestalHover: "group-hover:from-blue-700 group-hover:to-indigo-950 group-hover:border-amber-400 group-hover:shadow-blue-700/30"
        },
        {
            name: "Bank of Baroda",
            count: "Verified Notices",
            bevelColor: "border-b-orange-500/80 hover:border-orange-400",
            glowColor: "bg-orange-400/35",
            pedestalHover: "group-hover:from-orange-500 group-hover:to-red-600 group-hover:border-orange-400 group-hover:shadow-orange-500/30"
        },
        {
            name: "Canara Bank",
            count: "Bank Tenders",
            bevelColor: "border-b-cyan-600/80 hover:border-cyan-400",
            glowColor: "bg-cyan-400/35",
            pedestalHover: "group-hover:from-sky-600 group-hover:to-cyan-800 group-hover:border-amber-300 group-hover:shadow-cyan-600/30"
        },
        {
            name: "ICICI Bank",
            count: "Fast Recovery",
            bevelColor: "border-b-orange-600/80 hover:border-orange-400",
            glowColor: "bg-orange-500/35",
            pedestalHover: "group-hover:from-orange-500 group-hover:to-amber-600 group-hover:border-orange-400 group-hover:shadow-orange-500/30"
        },
        {
            name: "Axis Bank",
            count: "E-Tender Desk",
            bevelColor: "border-b-pink-800/80 hover:border-pink-500",
            glowColor: "bg-pink-500/30",
            pedestalHover: "group-hover:from-rose-700 group-hover:to-pink-900 group-hover:border-rose-400 group-hover:shadow-rose-600/30"
        },
        {
            name: "Union Bank of India",
            count: "Asset Recovery",
            bevelColor: "border-b-red-600/80 hover:border-red-400",
            glowColor: "bg-red-400/35",
            pedestalHover: "group-hover:from-red-600 group-hover:to-blue-900 group-hover:border-red-400 group-hover:shadow-red-600/30"
        },
        {
            name: "Bank of India",
            count: "DRT Auctions",
            bevelColor: "border-b-blue-900/80 hover:border-blue-500",
            glowColor: "bg-amber-400/35",
            pedestalHover: "group-hover:from-blue-800 group-hover:to-slate-950 group-hover:border-amber-400 group-hover:shadow-blue-800/30"
        },
        {
            name: "UCO Bank",
            count: "Direct Notices",
            bevelColor: "border-b-sky-700/80 hover:border-sky-400",
            glowColor: "bg-sky-400/35",
            pedestalHover: "group-hover:from-sky-700 group-hover:to-blue-950 group-hover:border-amber-300 group-hover:shadow-sky-700/30"
        },
        {
            name: "Central Bank of India",
            count: "Commercial Desk",
            bevelColor: "border-b-blue-700/80 hover:border-red-400",
            glowColor: "bg-blue-400/35",
            pedestalHover: "group-hover:from-blue-700 group-hover:to-red-700 group-hover:border-red-300 group-hover:shadow-red-600/30"
        }
    ];

    const handleBankClick = (bankName) => {
        navigate(`/search?bank=${encodeURIComponent(bankName)}`);
    };

    return (
        <section className="py-14 sm:py-16 bg-gradient-to-b from-gray-50/70 via-white to-gray-100/60 border-y border-gray-200/80 overflow-hidden relative">
            {/* Ambient 3D Stage Lighting */}
            <div className="pointer-events-none absolute -top-24 left-1/3 h-64 w-96 rounded-full bg-red-100/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-96 rounded-full bg-gray-200/60 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-9">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200/80 px-3 py-1 rounded-full mb-2 shadow-2xs">
                            <ShieldCheck size={14} className="text-red-600" />
                            <span>Institutional Banking Network</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                            Partner Public &amp; Private Sector Banks
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <VerifiedSealIcon size={14} className="text-red-600" />
                        <span>Click any institution to browse its verified SARFAESI auction pipeline</span>
                    </div>
                </div>

                {/* 3D Perspective Grid of Realistic Bank Logos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                    {partnerBanks.map((bank, index) => (
                        <Bank3DCard
                            key={index}
                            bank={bank}
                            onSelect={handleBankClick}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
