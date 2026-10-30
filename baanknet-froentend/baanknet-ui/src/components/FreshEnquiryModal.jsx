import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Phone, Send, X } from "lucide-react";
import { createInquiry } from "../services/adminService";
import { formatINR } from "../utils/formatters";

/**
 * "I'm interested" form for Fresh (direct-sale, no auction) properties.
 * Creates a lead in the admin Inquiries page with type "fresh_property".
 * Unlike a fake "success", failures are shown so the buyer can retry or call directly.
 */
export default function FreshEnquiryModal({ property, onClose }) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        message: `Hi, I'm interested in "${property.title}" (${formatINR(property.price)}) in ${property.city}. Please contact me with more details and a visit time.`
    });
    const [status, setStatus] = useState("idle"); // idle | sending | sent
    const [error, setError] = useState("");

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && status !== "sending" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, status]);

    const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
    const phoneDigits = form.phone.replace(/\D/g, "");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) return setError("Please enter your name.");
        if (phoneDigits.length < 10 && !form.email.trim()) return setError("Please enter a valid phone number (or an email).");

        setStatus("sending");
        try {
            await createInquiry({
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
                subject: `Fresh property enquiry: ${property.title}`,
                propertyId: `FRESH-${property._id}`,
                propertyTitle: property.title,
                cityName: property.city,
                propertyPrice: property.price,
                type: "fresh_property",
                priority: "high"
            });
            setStatus("sent");
        } catch (err) {
            setStatus("idle");
            setError(err?.response?.data?.message || "Couldn't send your enquiry. Please check your connection and try again.");
        }
    };

    const contactDigits = (property.contactPhone || "").replace(/\D/g, "");
    const waNumber = contactDigits.length === 10 ? `91${contactDigits}` : contactDigits;

    return (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label="Enquire about this property">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={() => status !== "sending" && onClose()} />

            <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Direct sale · No auction</p>
                        <h3 className="truncate text-base font-black text-slate-900">{property.title}</h3>
                        <p className="text-xs text-slate-500">
                            {property.city}, {property.state} · <span className="font-bold text-slate-800">{formatINR(property.price)}</span>
                        </p>
                    </div>
                    <button type="button" onClick={onClose} disabled={status === "sending"} aria-label="Close" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {status === "sent" ? (
                    <div className="px-6 py-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={36} />
                        </div>
                        <h4 className="mt-4 text-xl font-black text-slate-900">Enquiry sent!</h4>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
                            Thank you, {form.name.split(" ")[0]}. Our team has received your interest in this property and will contact you
                            {phoneDigits.length >= 10 ? ` on ${form.phone.trim()}` : ""} shortly.
                        </p>
                        <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-bold text-amber-400 hover:bg-slate-800 cursor-pointer">
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-3.5 px-6 py-5">
                        <div className="grid gap-3.5 sm:grid-cols-2">
                            <label className="block text-xs font-bold text-slate-700">
                                Your name *
                                <input value={form.name} onChange={update("name")} autoComplete="name" maxLength={80} required className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-amber-500 focus:bg-white" />
                            </label>
                            <label className="block text-xs font-bold text-slate-700">
                                Phone number *
                                <input value={form.phone} onChange={update("phone")} type="tel" inputMode="tel" autoComplete="tel" maxLength={18} placeholder="10-digit mobile" className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-amber-500 focus:bg-white" />
                            </label>
                        </div>
                        <label className="block text-xs font-bold text-slate-700">
                            Email <span className="font-normal text-slate-400">(optional)</span>
                            <input value={form.email} onChange={update("email")} type="email" autoComplete="email" maxLength={120} className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-amber-500 focus:bg-white" />
                        </label>
                        <label className="block text-xs font-bold text-slate-700">
                            Message
                            <textarea value={form.message} onChange={update("message")} rows={3} maxLength={1000} className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:bg-white" />
                        </label>

                        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">{error}</p>}

                        <button type="submit" disabled={status === "sending"} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-amber-400 hover:bg-slate-800 disabled:opacity-60 cursor-pointer">
                            {status === "sending" ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
                            {status === "sending" ? "Sending…" : "Send enquiry to Bidwallah"}
                        </button>

                        {contactDigits.length >= 8 && (
                            <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3.5">
                                <a href={`tel:${property.contactPhone.replace(/\s/g, "")}`} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-amber-400">
                                    <Phone size={14} /> Call now
                                </a>
                                <a
                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(form.message)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                    <MessageCircle size={14} /> WhatsApp
                                </a>
                            </div>
                        )}
                        <p className="text-center text-[11px] text-slate-400">Your details are shared only with the Bidwallah team for this property.</p>
                    </form>
                )}
            </div>
        </div>
    );
}
