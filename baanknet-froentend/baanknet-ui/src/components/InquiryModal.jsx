import React, { useState } from "react";
import { X, CheckCircle2, Phone, Mail, User, ShieldCheck, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { formatINR } from "../utils/formatters";
import { createInquiry } from "../services/adminService";

export default function InquiryModal({ property, isOpen, onClose }) {
    const { addToast } = useApp();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(
        "I am interested in this bank auction property. Please share the statutory sale notice, inspection schedule, and EMD guidelines."
    );
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !property) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                message: message.trim(),
                propertyId: property.sourcePropertyId || property._id,
                propertyTitle: property.propertyHeading || property.propertyTitle || "Bank Auction Property",
                bankName: property.bankName || "",
                cityName: property.cityName || "",
                propertyPrice: property.propertyPrice,
                type: "property_inquiry",
                priority: "high"
            };

            await createInquiry(payload);
            setSubmitted(true);
            addToast("Inquiry submitted successfully! The Bidwallah bank desk will contact you.", "success");
        } catch (err) {
            console.error("Inquiry error:", err);
            // Don't pretend it worked — the lead would be lost. Keep the form filled so the user can retry.
            addToast(err?.response?.data?.message || "Couldn't send your inquiry. Please check your connection and try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-scale-up">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600 text-white">
                            <Phone size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Contact Bidwallah Bank Desk
                            </h3>
                            <p className="text-xs text-slate-500">
                                Official inquiry for Asset ID: <span className="font-mono font-bold text-slate-700">{property.sourcePropertyId || property._id}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7">
                    {submitted ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 mx-auto">
                                <CheckCircle2 size={36} />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">
                                Inquiry Dispatched!
                            </h4>
                            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                                Your interest in <strong>{property.propertyHeading || property.propertyTitle || "this asset"}</strong> has been registered with the authorized banking desk on Bidwallah. An officer will assist you with inspection and tender documentation.
                            </p>
                            <div className="pt-4">
                                <button
                                    onClick={handleReset}
                                    className="rounded-xl bg-slate-950 hover:bg-slate-800 text-white px-6 py-2.5 text-xs font-bold transition cursor-pointer"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Property Summary Pill */}
                            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                        {property.bankName || "Authorized Bank Asset"}
                                    </span>
                                    <span className="font-bold text-slate-900 truncate block max-w-[240px]">
                                        {property.cityName || "India"} • {property.propertyType || "Property"}
                                    </span>
                                </div>

                                <span className="text-sm font-black text-amber-800">
                                    {formatINR(property.propertyPrice)}
                                </span>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                    <User size={16} className="text-slate-400 mr-2 shrink-0" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Phone & Email in 2 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mobile Phone <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <Phone size={16} className="text-slate-400 mr-2 shrink-0" />
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                        <Mail size={16} className="text-slate-400 mr-2 shrink-0" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="rahul@example.com"
                                            className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Specific Query / Assistance Required
                                </label>
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/15 transition">
                                    <textarea
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none resize-none font-normal"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Trust Notice */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                                <span>Direct official banking connection. Zero intermediary brokerage.</span>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 py-3 px-4 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <span>Dispatching...</span>
                                    ) : (
                                        <>
                                            <Send size={14} />
                                            <span>Send Official Inquiry</span>
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
