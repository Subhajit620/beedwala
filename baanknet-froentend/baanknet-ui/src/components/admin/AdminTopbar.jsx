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
    Settings,
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
                addToast("Crawler sync finished successfully", "success");
            }
        } catch (err) {
            console.error("Quick sync error:", err);
            addToast("Sync trigger encountered an issue", "warning");
        } finally {
            setSyncing(false);
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === "/admin") return "Overview";
        if (path === "/admin/fresh-properties") return "Direct Listings";
        if (path === "/admin/properties") return "Auction Directory";
        if (path === "/admin/properties/new") return "New Property";
        if (path.startsWith("/admin/properties/edit")) return "Edit Property";
        if (path === "/admin/banks") return "Partner Banks";
        if (path === "/admin/duplicates") return "Deduplication";
        if (path === "/admin/audit-logs") return "Audit Log";
        if (path === "/admin/inquiries") return "Buyer Inquiries";
        if (path === "/admin/sync") return "Crawler Sync";
        if (path === "/admin/analytics") return "Market Reports";
        if (path === "/admin/settings") return "Settings";
        return "Backoffice";
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-gray-200/80 bg-white/70 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
            {/* Left: Mobile Toggle & Breadcrumb Title */}
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <button
                    onClick={onOpenMobile}
                    className="shrink-0 rounded-lg border border-gray-200 bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200 lg:hidden cursor-pointer"
                    aria-label="Open menu"
                >
                    <Menu size={18} />
                </button>

                <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="hidden sm:inline text-gray-400 font-medium">Admin</span>
                    <span className="hidden sm:inline text-gray-300">/</span>
                    <h1 className="truncate font-semibold text-gray-900">
                        {getPageTitle()}
                    </h1>
                </div>
            </div>

            {/* Right: Search, Actions, Profile */}
            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={onOpenCommandPalette}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200 md:hidden cursor-pointer"
                    aria-label="Search"
                    title="Search"
                >
                    <Search size={15} />
                </button>

                <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
                    <Search size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notices, banks, IDs..."
                        className="h-8 w-48 lg:w-64 rounded-lg border border-gray-200 bg-gray-100 pl-8 pr-11 text-xs font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition"
                    />
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 text-gray-400 hover:text-gray-700"
                        >
                            <X size={13} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onOpenCommandPalette}
                            title="Command Palette (Ctrl+K)"
                            className="absolute right-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
                        >
                            ⌘K
                        </button>
                    )}
                </form>

                <button
                    onClick={handleQuickSync}
                    disabled={syncing}
                    title="Run Crawler Sync"
                    className="hidden xl:inline-flex items-center gap-1.5 h-8 rounded-lg border border-gray-200 bg-gray-100 px-2.5 text-xs font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw size={13} className={syncing ? "animate-spin text-red-600" : "text-gray-500"} />
                    <span>{syncing ? "Syncing..." : "Sync"}</span>
                </button>

                <Link
                    to="/admin/fresh-properties"
                    title="Manage Direct Sale Properties"
                    className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-gray-300 bg-gray-100 px-2.5 text-xs font-semibold text-gray-800 hover:bg-gray-200 transition"
                >
                    <span className="hidden sm:inline">Direct Sale</span>
                    <span className="sm:hidden">Direct</span>
                </Link>

                <Link
                    to="/admin/properties/new"
                    title="Create New Listing"
                    className="inline-flex items-center gap-1 h-8 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white hover:bg-red-700 shadow-2xs transition"
                >
                    <Plus size={14} />
                    <span className="hidden sm:inline">New Listing</span>
                </Link>

                {/* Admin Profile Dropdown */}
                <div className="relative pl-1 border-l border-gray-200">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100 transition cursor-pointer"
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-2xs">
                            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                        </div>
                        <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
                    </button>

                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50">
                                <div className="px-2.5 py-2 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-900">{adminUser?.name || "Administrator"}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{adminUser?.email || "admin@bidwallah.com"}</p>
                                </div>

                                <div className="py-1 space-y-0.5">
                                    <Link
                                        to="/admin/settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <Settings size={13} className="text-slate-400" />
                                        <span>Settings</span>
                                    </Link>
                                    <Link
                                        to="/"
                                        target="_blank"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <ExternalLink size={13} className="text-slate-400" />
                                        <span>Public Site</span>
                                    </Link>
                                </div>

                                <div className="pt-1 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    >
                                        <LogOut size={13} />
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
