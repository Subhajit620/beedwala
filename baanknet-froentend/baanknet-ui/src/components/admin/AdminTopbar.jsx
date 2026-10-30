import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Menu,
    Search,
    Plus,
    RefreshCw,
    ExternalLink,
    LogOut,
    ChevronDown,
    Shield,
    X
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { triggerCrawlerSync } from "../../services/adminService";
import { useApp } from "../../context/AppContext";

export default function AdminTopbar({ onOpenMobile, onOpenCommandPalette }) {
    const { adminUser, logout } = useAdminAuth();
    const { addToast } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/admin/properties?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleQuickSync = async () => {
        try {
            setSyncing(true);
            addToast("Initiating crawler synchronization...", "info");
            const res = await triggerCrawlerSync();
            if (res.success) {
                addToast("Crawler sync finished successfully!", "success");
            }
        } catch (err) {
            console.error("Quick sync error:", err);
            addToast("Sync trigger encountered an issue", "warning");
        } finally {
            setSyncing(false);
        }
    };

    // Determine readable page title from current pathname
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/admin") return "Dashboard Overview";
        if (path === "/admin/fresh-properties") return "Fresh Properties";
        if (path === "/admin/properties") return "Properties Directory";
        if (path === "/admin/properties/new") return "Add New Auction Notice";
        if (path.startsWith("/admin/properties/edit")) return "Edit Property Notice";
        if (path === "/admin/banks") return "Partner Bank Institutions";
        if (path === "/admin/duplicates") return "Smart Duplicate Auditor";
        if (path === "/admin/audit-logs") return "Security & Compliance Logs";
        if (path === "/admin/inquiries") return "Leads & Customer Inquiries";
        if (path === "/admin/sync") return "Crawler & Sync Hub";
        if (path === "/admin/analytics") return "Market & Valuation Analytics";
        if (path === "/admin/settings") return "System Settings & Diagnostics";
        return "Admin Portal";
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMobile}
                    className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
                    aria-label="Open Sidebar Menu"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                        {getPageTitle()}
                    </h1>
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-amber-600">{getPageTitle()}</span>
                    </div>
                </div>
            </div>

            {/* Right: Quick Search Form, Command Palette, Actions, Profile */}
            <div className="flex items-center gap-2.5 sm:gap-4">
                {/* Interactive Quick Search Form in Admin Topbar */}
                <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                    <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Quick search notices, banks, IDs..."
                        className="h-10 w-48 lg:w-64 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition shadow-2xs"
                    />
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                        >
                            <X size={13} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onOpenCommandPalette}
                            title="Open Command Palette (Ctrl+K)"
                            className="absolute right-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 bg-white border border-slate-200 shadow-2xs hover:bg-slate-100"
                        >
                            ⌘K
                        </button>
                    )}
                </form>

                {/* Trigger Sync Button */}
                <button
                    onClick={handleQuickSync}
                    disabled={syncing}
                    title="Run Crawler Sync"
                    className="hidden lg:inline-flex items-center gap-1.5 h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-amber-300 transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={14} className={syncing ? "animate-spin text-amber-600" : "text-slate-500"} />
                    <span>{syncing ? "Syncing..." : "Sync Data"}</span>
                </button>

                {/* Add Property CTA */}
                <Link
                    to="/admin/properties/new"
                    className="inline-flex items-center gap-1.5 h-10 rounded-xl bg-slate-950 px-3.5 sm:px-4 text-xs font-bold text-amber-400 hover:bg-slate-900 hover:shadow-md hover:shadow-amber-500/10 transition cursor-pointer active:scale-95"
                >
                    <Plus size={16} className="text-amber-400" />
                    <span className="hidden sm:inline">Add Listing</span>
                </Link>

                {/* Admin Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 sm:px-3 sm:py-2 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-amber-400">
                            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <div className="hidden sm:block text-left leading-tight">
                            <span className="block text-xs font-bold text-slate-900">
                                {adminUser?.name || "Administrator"}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-semibold">Super Admin</span>
                        </div>
                        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-scale-up">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-xs font-bold text-slate-900">{adminUser?.name || "Admin"}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{adminUser?.email || "admin@bidwallah.com"}</p>
                                </div>

                                <div className="py-1 space-y-0.5">
                                    <Link
                                        to="/admin/settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <Shield size={14} className="text-slate-400" />
                                        <span>Security & Settings</span>
                                    </Link>
                                    <Link
                                        to="/"
                                        target="_blank"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <ExternalLink size={14} className="text-slate-400" />
                                        <span>View Public Website</span>
                                    </Link>
                                </div>

                                <div className="pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        <LogOut size={14} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
