import React, { useState } from "react";
import { X, CheckCircle2, Phone, Mail, User, ShieldCheck, Send, Share2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatINR } from "../utils/formatters";
import { createInquiry } from "../services/adminService";

export default function InquiryModal({ property, isOpen, onClose }) {
    const { addToast, visitorUser } = useApp();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(
        "I am interested in this bank auction property. Please call me and share the property details, site visit schedule, and bidding guidelines."
    );
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const effectiveName = name || visitorUser?.name || "";
    const effectivePhone = phone || visitorUser?.phone || "";
    const effectiveEmail = email || visitorUser?.email || "";

    if (!isOpen || !property) return null;

    const propertyId = property.sourcePropertyId || property.propertyUniqueId || property._id;
    const propertyTitle = property.propertyHeading || property.propertyTitle || "Bank Auction Property";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanPhone = effectivePhone.replace(/\D/g, "");
        if (!effectiveName.trim()) {
            addToast("Please enter your full name.", "warning");
            return;
        }
        if (cleanPhone.length < 10 && !effectiveEmail.trim()) {
            addToast("Please enter a valid 10-digit mobile/WhatsApp number.", "warning");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                name: effectiveName.trim(),
                email: effectiveEmail.trim(),
                phone: effectivePhone.trim(),
                message: message.trim(),
                propertyId,
                propertyTitle,
                bankName: property.bankName || "",
                cityName: property.cityName || "",
                propertyPrice: property.propertyPrice,
                type: "property_inquiry",
                priority: "high"
            };

            await createInquiry(payload);
            setSubmitted(true);
            addToast("Callback request registered! Our team will contact you shortly.", "success");
        } catch (err) {
            console.error("Inquiry error:", err);
            addToast(
                err?.response?.data?.message || "Couldn't send your inquiry. Please check your connection and try again.",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleShareWhatsApp = () => {
        const shareUrl = `${window.location.origin}/properties/${propertyId}`;
        const text = encodeURIComponent(
            `🏛️ *Verified Bank Auction Property on Bidwallah*\n\n` +
            `*${propertyTitle}*\n` +
            `💰 *Reserve Price:* ${formatINR(property.propertyPrice)}\n` +
            `📍 *Location:* ${property.locality ? `${property.locality}, ` : ""}${property.cityName || "India"}\n` +
            `🏦 *Bank:* ${property.bankName || "Authorized Bank"}\n\n` +
            `👉 View full details & photos here:\n${shareUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const handleReset = () => {
        setSubmitted(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                            <Phone size={18} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-white truncate">
                                Call {property.contactPhone || "+91 74394 09340"} &amp; Property Details
                            </h3>
                            <p className="text-[11px] text-amber-400 font-semibold truncate">
                                Asset ID: <span className="font-mono">{propertyId}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 overflow-y-auto">
                    {submitted ? (
                        <div className="py-6 text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 mx-auto">
                                <CheckCircle2 size={36} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900">
                                Callback Request Received!
                            </h4>
                            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                                Thank you, <strong>{effectiveName}</strong>! Your interest in{" "}
                                <strong>{propertyTitle}</strong> has been sent to the Bidwallah advisory desk. Our officer will call or WhatsApp you on <strong>{effectivePhone}</strong> shortly.
                            </p>
                            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleShareWhatsApp}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-black transition cursor-pointer"
                                >
                                    <Share2 size={14} />
                                    <span>Share Property on WhatsApp</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full sm:w-auto rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 px-6 py-2.5 text-xs font-bold transition cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            {/* Property Summary Pill */}
                            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-3 flex items-center justify-between gap-2 text-xs">
                                <div className="min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block truncate">
                                        {property.bankName || "Authorized Bank Asset"}
                                    </span>
                                    <span className="font-bold text-slate-900 truncate block">
                                        {propertyTitle}
                                    </span>
                                </div>

                                <span className="text-sm font-black text-amber-800 shrink-0">
                                    {formatINR(property.propertyPrice)}
                                </span>
                            </div>

                            {/* Full Name & Mobile in 2 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Your Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <User size={16} className="text-slate-400 mr-2 shrink-0" />
                                        <input
                                            type="text"
                                            required
                                            value={effectiveName}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g. Rahul Sharma"
                                            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mobile / WhatsApp No. <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <Phone size={16} className="text-amber-600 mr-2 shrink-0" />
                                        <input
                                            type="tel"
                                            required
                                            value={effectivePhone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="10-digit mobile number"
                                            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email (Optional) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Email Address <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                    <Mail size={16} className="text-slate-400 mr-2 shrink-0" />
                                    <input
                                        type="email"
                                        value={effectiveEmail}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="rahul@example.com (optional)"
                                        className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    What would you like to know?
                                </label>
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                    <textarea
                                        rows={2}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none resize-none font-normal"
                                    />
                                </div>
                            </div>

                            {/* Trust Notice & Direct Phone */}
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-[11px] text-emerald-900">
                                <span className="flex items-center gap-1.5 font-semibold">
                                    <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                                    <span>Direct Helpline:</span>
                                </span>
                                <a
                                    href={`tel:${String(property.contactPhone || "7439409340").replace(/\s+/g, "")}`}
                                    className="inline-flex items-center gap-1 font-black text-emerald-700 hover:underline"
                                >
                                    <Phone size={12} />
                                    <span>{property.contactPhone || "+91 74394 09340"}</span>
                                </a>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 py-3.5 px-4 text-xs font-black text-white shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span>Submitting Request...</span>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Send Inquiry &amp; Get Details</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
