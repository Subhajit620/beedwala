import React from "react";
import { PhoneCall, Share2 } from "lucide-react";

export default function LeadMagnetWidget() {
    const handleSharePlatformWhatsApp = () => {
        const url = window.location.origin;
        const text = encodeURIComponent(
            `🏛️ *Discover Verified Bank Auction & Direct Sale Properties on Bidwallah*\n\n` +
            `✅ Buy Flats, Houses, Plots & Commercial Properties at *20%–35% below market rate*\n` +
            `✅ 0% Brokerage • Direct Bank & Admin Verified Listings\n\n` +
            `👉 Browse all properties here:\n${url}`
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    return (
        <div className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2">
            <a
                href="tel:+917439409340"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 sm:px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-emerald-900/25 border border-emerald-400/40 transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Call Bidwallah Advisory Desk: +91 74394 09340"
            >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <PhoneCall size={13} className="animate-bounce" />
                </span>
                <span className="tracking-wide">+91 74394 09340</span>
            </a>

            <button
                type="button"
                onClick={handleSharePlatformWhatsApp}
                className="flex items-center gap-1.5 rounded-full bg-slate-950/95 hover:bg-slate-900 px-3 py-2.5 text-xs font-bold text-amber-400 shadow-lg border border-amber-500/30 transition-all duration-200 hover:scale-105 cursor-pointer"
                title="Share Bidwallah with friends & family on WhatsApp"
            >
                <Share2 size={13} />
                <span className="hidden md:inline">Invite on WhatsApp</span>
            </button>
        </div>
    );
}
