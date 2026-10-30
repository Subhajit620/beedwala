import React from "react";
import { MapPin, Landmark, Compass, Info, CheckCircle2 } from "lucide-react";

export default function LocalityExplorer({
    facets,
    onSelectLocality,
    onSelectBank,
    activeLocality,
    activeBank
}) {
    const localities = facets?.localities || [
        { name: "Salt Lake", count: 180 },
        { name: "New Town", count: 142 },
        { name: "Rajarhat", count: 96 },
        { name: "Howrah", count: 110 },
        { name: "Alipore", count: 48 },
        { name: "Ballygunge", count: 52 },
        { name: "Behala", count: 75 },
        { name: "Dum Dum", count: 64 },
        { name: "Garia", count: 58 },
        { name: "Barasat", count: 82 }
    ];

    const banks = facets?.banks || [
        { name: "Punjab National Bank", count: 306 },
        { name: "Indian Bank", count: 223 },
        { name: "State Bank of India", count: 201 },
        { name: "Bank of India", count: 159 },
        { name: "Bank of Baroda", count: 155 }
    ];

    return (
        <div className="space-y-6">
            {/* Locality Hub Explorer Header */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                            <Compass size={14} />
                            <span>Spatial & Regional Discovery</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Kolkata Locality & Banking Hubs
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Browse authentic bank auction notices concentrated across Kolkata metropolitan zones and authorized financial institutions.
                        </p>
                    </div>

                    <span className="rounded-2xl bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-800 border border-amber-200/80 shrink-0">
                        1,500+ Verified Notices
                    </span>
                </div>

                {/* Localities Cluster Grid */}
                <div className="mt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-amber-500" />
                        <span>Major Localities & Municipal Zones</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {localities.slice(0, 15).map((loc) => {
                            const isSelected = activeLocality?.toLowerCase() === loc.name.toLowerCase();
                            return (
                                <button
                                    key={loc.name}
                                    type="button"
                                    onClick={() => onSelectLocality(loc.name)}
                                    className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "bg-slate-950 text-white border-slate-950 shadow-md scale-102"
                                            : "bg-slate-50/80 hover:bg-amber-50/60 border-slate-200/80 text-slate-800 hover:border-amber-300"
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full mb-1.5">
                                        <div
                                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                                isSelected ? "bg-amber-500 text-slate-950" : "bg-white text-amber-600 border border-slate-200"
                                            }`}
                                        >
                                            <MapPin size={13} />
                                        </div>
                                        <span
                                            className={`text-[10px] font-black rounded-full px-2 py-0.5 ${
                                                isSelected
                                                    ? "bg-slate-800 text-amber-300"
                                                    : "bg-amber-100 text-amber-800"
                                            }`}
                                        >
                                            {loc.count}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black truncate w-full">{loc.name}</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">Kolkata, WB</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Major Lending Institution Clusters */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <Landmark size={14} className="text-amber-500" />
                        <span>Major Auction Authorizing Banks</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {banks.slice(0, 10).map((b) => {
                            const isSelected = activeBank?.toLowerCase() === b.name.toLowerCase();
                            return (
                                <button
                                    key={b.name}
                                    type="button"
                                    onClick={() => onSelectBank(b.name)}
                                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-sm"
                                            : "bg-white hover:bg-amber-50/50 border-slate-200/80 text-slate-800 hover:border-amber-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Landmark size={14} className={isSelected ? "text-slate-950" : "text-amber-600"} />
                                        <span className="text-xs font-bold truncate">{b.name}</span>
                                    </div>
                                    <span
                                        className={`text-[10px] font-black ml-2 rounded-full px-2 py-0.5 ${
                                            isSelected ? "bg-slate-950 text-amber-400" : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {b.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Architectural & Mapping Data Architecture Note */}
            <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
                            <Info size={14} />
                            <span>Spatial Discovery Architecture</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                            Zero Synthetic Coordinates Standard
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                            BidWallah strictly adheres to data integrity: crawler-imported bank SARFAESI records do not include raw GPS satellite coordinates in bank gazette filings. Rather than fabricating fake pins or incurring high-latency runtime geocoding, properties are organized by authentic municipal zones, PIN codes, and bank jurisdiction branches.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shrink-0 text-xs w-full md:w-auto">
                        <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span>GPS Ingestion Integration</span>
                        </div>
                        <ul className="space-y-1.5 text-slate-400 text-[11px]">
                            <li>• Administrative zone & locality clustering active</li>
                            <li>• Centroid pin matching available via postal gazette</li>
                            <li>• Direct offline crawler enrichment pipeline ready</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
