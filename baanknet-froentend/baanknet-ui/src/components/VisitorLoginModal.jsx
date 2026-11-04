import React, { useState } from "react";
import {
    Lock,
    User,
    Phone,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    X,
    Building2,
    AlertCircle
} from "lucide-react";
import { VerifiedSealIcon } from "./BrandIcons";
import { useApp } from "../context/AppContext";
import api from "../services/api";

/**
 * Clean, friendly Sign-In Prompt Card shown when a visitor tries to view properties without signing in.
 */
export function PropertyLockWall({
    title = "Quick Sign In to View Properties",
    subtitle = "Enter your Name & Mobile Number (takes 5 seconds) to view all Fresh Properties and Bank Auction Listings."
}) {
    const { openVisitorLogin, loginVisitor, visitorCountdown } = useApp();
    const hasAdminToken = typeof window !== "undefined" && Boolean(localStorage.getItem("bw_admin_token"));

    const handleAdminQuickUnlock = () => {
        loginVisitor({
            id: "admin_preview",
            name: "Admin",
            phone: "9999999999",
            email: "admin@bidwallah.com",
            preference: "Both Fresh & Auction Properties",
            signedInAt: new Date().toISOString()
        });
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-white via-amber-50/40 to-slate-50 text-slate-900 p-6 sm:p-10 shadow-lg my-4 animate-fade-in">
            <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />

            <div className="relative z-10 max-w-lg mx-auto text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 border border-amber-200 text-amber-700 shadow-xs">
                    <Lock size={26} />
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    {title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {subtitle}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs text-slate-700">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-2xs">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Fresh Direct Properties (No Auction)</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 shadow-2xs">
                        <CheckCircle2 size={14} className="text-amber-600" />
                        <span>1,499+ Bank Auction Properties</span>
                    </span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => openVisitorLogin(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-md transition cursor-pointer"
                    >
                        <span>Enter Name &amp; Mobile to View Properties</span>
                        <ArrowRight size={16} />
                    </button>

                    {hasAdminToken && (
                        <button
                            type="button"
                            onClick={handleAdminQuickUnlock}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-5 py-3.5 text-xs font-black text-emerald-800 transition cursor-pointer"
                        >
                            <ShieldCheck size={15} className="text-emerald-600" />
                            <span>Unlock as Admin</span>
                        </button>
                    )}
                </div>

                {visitorCountdown > 0 && (
                    <p className="text-[11px] font-medium text-slate-500">
                        Sign-in box opens automatically in <span className="text-amber-700 font-bold">{visitorCountdown}s</span>
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Simple, User-Friendly 15-Second Visitor Sign-In Popup.
 * Only asks for Name + 10-digit Mobile Number (and optional 1-click interest choice),
 * saves the buyer lead into Admin Inquiries CRM, and unlocks all properties immediately.
 */
export default function VisitorLoginModal() {
    const {
        visitorUser,
        isVisitorLoginOpen,
        setIsVisitorLoginOpen,
        visitorLoginMandatory,
        loginVisitor
    } = useApp();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [preference, setPreference] = useState("Both Fresh & Auction Properties");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (visitorUser || !isVisitorLoginOpen) return null;

    const hasAdminToken = typeof window !== "undefined" && Boolean(localStorage.getItem("bw_admin_token"));

    const handleAdminQuickUnlock = () => {
        loginVisitor({
            id: "admin_preview",
            name: "Admin",
            phone: "9999999999",
            email: "admin@bidwallah.com",
            preference: "Both Fresh & Auction Properties",
            signedInAt: new Date().toISOString()
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const cleanName = name.trim();
        const cleanPhone = phone.replace(/[^0-9+]/g, "").trim();

        if (!cleanName) {
            setError("Please enter your name.");
            return;
        }

        if (!cleanPhone || cleanPhone.replace(/\D/g, "").length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name: cleanName,
                phone: cleanPhone,
                preference,
                mode: "register"
            };

            let userData = null;

            try {
                const res = await api.post("/auth/visitor-login", payload);
                if (res.data?.success && res.data?.data) {
                    userData = res.data.data;
                }
            } catch {
                try {
                    const fallbackRes = await api.post("/inquiries", {
                        name: payload.name,
                        phone: payload.phone,
                        type: "visitor_login",
                        priority: "high",
                        subject: "Website Visitor Sign-In Lead",
                        propertyTitle: `Visitor Sign-In • ${payload.preference}`,
                        message: `Visitor signed in to view properties. Interested In: ${payload.preference}`
                    });
                    userData = {
                        id: fallbackRes.data?.data?._id || `usr_${Date.now()}`,
                        ...payload,
                        signedInAt: new Date().toISOString()
                    };
                } catch {
                    userData = {
                        id: `usr_${Date.now()}`,
                        ...payload,
                        signedInAt: new Date().toISOString()
                    };
                }
            }

            loginVisitor(
                userData || {
                    id: `usr_${Date.now()}`,
                    ...payload,
                    signedInAt: new Date().toISOString()
                }
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/35 backdrop-blur-md animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in to view properties"
        >
            <div
                className="absolute inset-0"
                onClick={() => {
                    if (!visitorLoginMandatory) setIsVisitorLoginOpen(false);
                }}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl animate-popup-spring">
                {/* Light & Clean Top Banner */}
                <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-slate-50 px-6 py-4 text-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200/80 text-amber-700 shadow-2xs">
                            <VerifiedSealIcon size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                                Free Instant Access
                            </span>
                            <h3 className="text-base font-black text-slate-900">
                                Sign In to View All Properties
                            </h3>
                        </div>
                    </div>

                    {!visitorLoginMandatory && (
                        <button
                            type="button"
                            onClick={() => setIsVisitorLoginOpen(false)}
                            aria-label="Close sign in popup"
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-800 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Simple 2-Field Form Body */}
                <div className="p-6 space-y-4 bg-white">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Enter your <strong>Name</strong> and <strong>Mobile Number</strong> below to unlock all <strong>Fresh Properties (No Auction)</strong> and <strong>Bank Auction Listings</strong>.
                    </p>

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                            <AlertCircle size={15} className="shrink-0 text-rose-600" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Your Full Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <User size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Rahul Sharma"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Mobile / WhatsApp Number <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center">
                                <Phone size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="10-digit mobile number"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-3.5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                What are you looking for?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "Both Fresh & Auction Properties", label: "Both", icon: VerifiedSealIcon },
                                    { id: "Fresh Property (Direct Sale)", label: "Fresh (No Auction)", icon: ShieldCheck },
                                    { id: "Bank Auction Property", label: "Bank Auction", icon: Building2 }
                                ].map((opt) => {
                                    const Icon = opt.icon;
                                    const active = preference === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setPreference(opt.id)}
                                            className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-bold transition cursor-pointer ${
                                                active
                                                    ? "border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400/30 shadow-2xs"
                                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            <Icon size={12} className={active ? "text-amber-600" : "text-slate-400"} />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 py-3.5 text-sm font-black text-slate-950 shadow-md transition cursor-pointer"
                        >
                            <span>
                                {submitting ? "Unlocking Properties..." : "View All Properties Now"}
                            </span>
                            <ArrowRight size={17} />
                        </button>

                        {hasAdminToken && (
                            <button
                                type="button"
                                onClick={handleAdminQuickUnlock}
                                className="w-full flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 py-2.5 text-xs font-black text-emerald-800 transition cursor-pointer"
                            >
                                <ShieldCheck size={14} className="text-emerald-600" />
                                <span>Continue as Admin (1-Click Unlock)</span>
                            </button>
                        )}
                    </form>

                    <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        <span>100% Free • Direct Admin &amp; Verified Bank Listings</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
