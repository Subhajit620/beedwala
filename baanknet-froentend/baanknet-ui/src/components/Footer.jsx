import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, MapPin, Sparkles, Landmark, Shield } from "lucide-react";
import logoImg from "../assets/logo.jpg";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200/90 bg-slate-950 text-slate-400 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand Column */}
                    <div className="md:col-span-2 space-y-4">
                        <Link to="/" className="inline-block bg-white rounded-2xl p-2.5 shadow-md">
                            <img
                                src={logoImg}
                                alt="Bidwallah Logo"
                                className="h-9 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                            <strong className="text-slate-200">Bidwallah</strong> is India's premier bank auction and distressed asset discovery marketplace, providing transparent access to verified SARFAESI property listings directly from institutional banks.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                                <Sparkles size={13} className="text-amber-400" />
                                <span>Verified Bank Notices</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                                <ShieldCheck size={14} />
                                <span>SARFAESI Title Assured</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-1.5">
                            <Landmark size={14} />
                            <span>Quick Links</span>
                        </h4>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to="/" className="hover:text-amber-400 transition">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/properties" className="hover:text-amber-400 transition">
                                    Browse All Properties
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-amber-400 transition">
                                    About Bidwallah
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-amber-400 transition">
                                    Contact & Banking Desk
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin" className="hover:text-amber-400 text-slate-400 flex items-center gap-1.5 transition">
                                    <Shield size={13} className="text-amber-500" />
                                    <span>Admin Console</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4">
                            Help & Support
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-amber-400 border border-slate-800">
                                    <Mail size={14} />
                                </div>
                                <span className="hover:text-slate-200 transition">support@bidwallah.com</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-amber-400 border border-slate-800">
                                    <MapPin size={14} />
                                </div>
                                <span>Kolkata, West Bengal, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright & Disclaimer */}
                <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
                    <p>© 2026 Bidwallah. All rights reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                        <Link to="/admin" className="text-slate-500 hover:text-amber-400 transition flex items-center gap-1">
                            <Shield size={12} />
                            <span>Administrator Gateway</span>
                        </Link>
                        <span className="hidden sm:inline">•</span>
                        <p>
                            All auction notices synchronized from authorized public records.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
