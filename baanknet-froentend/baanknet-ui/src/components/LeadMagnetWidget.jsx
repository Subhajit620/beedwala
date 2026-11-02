import React, { useState } from "react";
import {
    PhoneCall,
    Share2,
    X,
    CheckCircle2,
    Sparkles,
    User,
    Phone,
    MapPin,
    Send
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { createInquiry } from "../services/adminService";

export default function LeadMagnetWidget() {
    const { visitorUser, addToast } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("Kolkata");
    const [propertyType, setPropertyType] = useState("Residential Flat / House");
    const [budget, setBudget] = useState("₹25L – ₹50L");

    const effectiveName = name || visitorUser?.name || "";
    const effectivePhone = phone || visitorUser?.phone || "";
    const effectiveCity = city || visitorUser?.city || "Kolkata";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const digits = effectivePhone.replace(/\D/g, "");
        if (!effectiveName.trim()) {
            addToast("Please enter your name.", "warning");
            return;
        }
        if (digits.length < 10) {
            addToast("Please enter a valid 10-digit mobile / WhatsApp number.", "warning");
            return;
        }

        setSubmitting(true);
        try {
            await createInquiry({
                name: effectiveName.trim(),
                phone: effectivePhone.trim(),
                email: visitorUser?.email || "",
                cityName: effectiveCity.trim() || "Kolkata",
                type: "callback_request",
                priority: "urgent",
                subject: `Custom Property Match & Callback Request (${budget})`,
                propertyTitle: `Wanted: ${propertyType} • Budget: ${budget} in ${effectiveCity.trim() || "Kolkata"}`,
                message: `Buyer requested a Free Callback & WhatsApp Property List | Looking For: ${propertyType} | Budget: ${budget} | Preferred City/Area: ${effectiveCity.trim() || "Kolkata"}`
            });
            setSubmitted(true);
            addToast("Request received! Our advisor will send matching properties on WhatsApp.", "success");
        } catch (err) {
            addToast(
                err?.response?.data?.message || "Unable to submit right now. Please try again.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Bottom-Left Lead Capture & Viral Referral Bar */}
            <div className="fixed bottom-4 left-3 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setSubmitted(false);
                        setIsOpen(true);
                    }}
                    className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 sm:px-4 py-2.5 text-xs font-black text-white shadow-xl shadow-emerald-900/25 border border-emerald-400/40 transition-all duration-200 hover:scale-105 cursor-pointer"
                    title="Get Free Callback & Matching Properties on WhatsApp"
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <PhoneCall size={13} className="animate-bounce" />
                    </span>
                    <span className="hidden xs:inline">Get Free Callback</span>
                    <span className="xs:hidden">Callback</span>
                </button>

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

            {/* Lead Magnet Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
                    <div className="relative w-full max-w-md max-h-[92dvh] flex flex-col rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
                        {/* Header */}
                        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black">
                                    <PhoneCall size={19} />
                                </div>
                                <div className="min-w-0">
                                    <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                                        <Sparkles size={11} />
                                        <span>Free Advisory Service</span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-black text-white truncate">
                                        Get Matching Properties on WhatsApp
                                    </h3>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto">
                            {submitted ? (
                                <div className="py-4 text-center space-y-4">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900">
                                        We&apos;ve Got Your Requirement!
                                    </h4>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Thank you, <strong>{effectiveName}</strong>. Our property specialist will send the best{" "}
                                        <strong>{propertyType}</strong> options in <strong>{effectiveCity}</strong> ({budget}) to your WhatsApp number <strong>{effectivePhone}</strong> shortly.
                                    </p>

                                    <div className="pt-2 flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSharePlatformWhatsApp}
                                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white transition cursor-pointer"
                                        >
                                            <Share2 size={14} />
                                            <span>Share Bidwallah With Friends on WhatsApp</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                                        >
                                            Close Window
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Tell us your budget &amp; preferred location — our team will shortlist verified <strong>Fresh Direct Sale</strong> &amp; <strong>Bank Auction</strong> properties and send them to your WhatsApp.
                                    </p>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Your Full Name <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
                                            <User size={15} className="text-slate-400 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                required
                                                value={effectiveName}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your full name"
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
                                            <Phone size={15} className="text-emerald-600 mr-2 shrink-0" />
                                            <input
                                                type="tel"
                                                required
                                                value={effectivePhone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="10-digit WhatsApp number"
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Property Type
                                            </label>
                                            <select
                                                value={propertyType}
                                                onChange={(e) => setPropertyType(e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                                            >
                                                <option value="Residential Flat / House">Flat / House</option>
                                                <option value="Land / Plot">Land / Plot</option>
                                                <option value="Commercial Shop / Office">Commercial / Shop</option>
                                                <option value="Fresh Direct Property (No Auction)">Fresh Property Only</option>
                                                <option value="Bank Auction Property">Bank Auction Only</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                Your Budget
                                            </label>
                                            <select
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                                            >
                                                <option value="Under ₹25 Lakh">Under ₹25 Lakh</option>
                                                <option value="₹25L – ₹50L">₹25L – ₹50L</option>
                                                <option value="₹50L – ₹1 Cr">₹50L – ₹1 Cr</option>
                                                <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Preferred City / Locality
                                        </label>
                                        <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-emerald-500 focus-within:bg-white">
                                            <MapPin size={15} className="text-amber-500 mr-2 shrink-0" />
                                            <input
                                                type="text"
                                                value={effectiveCity}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="e.g. Kolkata, Salt Lake, New Town, Howrah"
                                                className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3.5 px-4 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Send size={14} />
                                        <span>{submitting ? "Sending Request..." : "Send Me Matching Properties on WhatsApp"}</span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
