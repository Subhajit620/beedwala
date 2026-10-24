import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    PlusCircle,
    Mail,
    RefreshCw,
    BarChart3,
    Settings,
    LogOut,
    ExternalLink,
    Shield,
    Sparkles,
    ChevronRight,
    Landmark,
    CopyCheck,
    History,
    X,
    Users
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import logoImg from "../../assets/logo.jpg";

export default function AdminSidebar({ mobileOpen, onCloseMobile, newInquiriesCount = 0 }) {
    const { adminUser, logout } = useAdminAuth();

    const navSections = [
        {
            title: "MAIN MENU",
            items: [
                {
                    name: "Dashboard",
                    path: "/admin",
                    end: true,
                    icon: LayoutDashboard
                },
                {
                    name: "All Properties",
                    path: "/admin/properties",
                    icon: Building2
                },
                {
                    name: "Add New Property",
                    path: "/admin/properties/new",
                    icon: PlusCircle
                },
                {
                    name: "Partner Banks",
                    path: "/admin/banks",
                    icon: Landmark
                }
            ]
        },
        {
            title: "LEADS & SALES",
            items: [
                {
                    name: "Buyer Inquiries",
                    path: "/admin/inquiries",
                    icon: Mail,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} New` : null,
                    badgeClass: "bg-rose-500 text-white"
                }
            ]
        },
        {
            title: "DATA & PIPELINE",
            items: [
                {
                    name: "Crawler & Sync",
                    path: "/admin/sync",
                    icon: RefreshCw
                },
                {
                    name: "Clean Duplicates",
                    path: "/admin/duplicates",
                    icon: CopyCheck
                },
                {
                    name: "Market Analytics",
                    path: "/admin/analytics",
                    icon: BarChart3
                }
            ]
        },
        {
            title: "MANAGEMENT",
            items: [
                {
                    name: "Audit Trail",
                    path: "/admin/audit-logs",
                    icon: History
                },
                {
                    name: "System Settings",
                    path: "/admin/settings",
                    icon: Settings
                }
            ]
        }
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onCloseMobile}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-slate-950 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                }`}
            >
                {/* Brand & Portal Header */}
                <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/80">
                    <Link to="/admin" className="flex items-center gap-3 group">
                        <div className="rounded-xl bg-white p-1.5 shadow-md group-hover:scale-105 transition">
                            <img src={logoImg} alt="Bidwallah Logo" className="h-7 w-auto object-contain" />
                        </div>
                        <div>
                            <span className="block text-xs font-black tracking-wider text-white uppercase">
                                Baanknet
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                <Shield size={10} />
                                <span>ADMIN PANEL</span>
                            </span>
                        </div>
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        onClick={onCloseMobile}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1.5">
                            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {section.title}
                            </div>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.end}
                                            onClick={onCloseMobile}
                                            className={({ isActive }) =>
                                                `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition duration-150 ${
                                                    isActive
                                                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <Icon
                                                            size={18}
                                                            className={`transition ${
                                                                isActive
                                                                    ? "text-slate-950"
                                                                    : "text-slate-500 group-hover:text-amber-400"
                                                            }`}
                                                        />
                                                        <span>{item.name}</span>
                                                    </div>

                                                    {item.badge ? (
                                                        <span
                                                            className={`flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black ${
                                                                isActive
                                                                    ? "bg-slate-950 text-amber-400"
                                                                    : item.badgeClass || "bg-amber-500 text-slate-950"
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    ) : (
                                                        <ChevronRight
                                                            size={14}
                                                            className={`opacity-0 group-hover:opacity-100 transition ${
                                                                isActive ? "opacity-100 text-slate-950" : "text-slate-600"
                                                            }`}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View Public Website */}
                <div className="px-4 pb-3">
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-amber-400 transition"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>View Public Website</span>
                        </div>
                        <ExternalLink size={14} className="text-slate-500" />
                    </Link>
                </div>

                {/* User Profile & Sign Out Footer */}
                <div className="border-t border-slate-800 bg-slate-950 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-sm">
                                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            <div className="overflow-hidden">
                                <div className="truncate text-xs font-bold text-white">
                                    {adminUser?.name || "Administrator"}
                                </div>
                                <div className="truncate text-[10px] text-slate-400">
                                    {adminUser?.email || "admin@bidwallah.com"}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            title="Sign Out"
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
