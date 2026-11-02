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
    PanelLeftClose,
    PanelLeftOpen,
    GripVertical,
    X
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import logoImg from "../../assets/logo.jpg";

export default function AdminSidebar({
    mobileOpen,
    onCloseMobile,
    newInquiriesCount = 0,
    width = 288,
    isCollapsed = false,
    onToggleCollapse,
    isResizing = false,
    onStartResize,
    onResetWidth
}) {
    const { adminUser, logout } = useAdminAuth();

    // On mobile drawer, always render expanded even if desktop rail is collapsed
    const compact = isCollapsed && !mobileOpen;

    const navSections = [
        {
            title: "DAILY OPERATIONS",
            items: [
                {
                    name: "Dashboard",
                    path: "/admin",
                    end: true,
                    icon: LayoutDashboard
                },
                {
                    name: "Buyer Leads & Inquiries",
                    path: "/admin/inquiries",
                    icon: Mail,
                    badge: newInquiriesCount > 0 ? `${newInquiriesCount} New` : null,
                    badgeCount: newInquiriesCount,
                    badgeClass: "bg-rose-500 text-white"
                },
                {
                    name: "Fresh Properties (Direct)",
                    path: "/admin/fresh-properties",
                    icon: Sparkles
                },
                {
                    name: "Bank Auction Properties",
                    path: "/admin/properties",
                    icon: Building2
                },
                {
                    name: "Add Auction Property",
                    path: "/admin/properties/new",
                    icon: PlusCircle
                }
            ]
        },
        {
            title: "TOOLS & ANALYTICS",
            items: [
                {
                    name: "Partner Banks",
                    path: "/admin/banks",
                    icon: Landmark
                },
                {
                    name: "Crawler & Sync",
                    path: "/admin/sync",
                    icon: RefreshCw
                },
                {
                    name: "Market Analytics",
                    path: "/admin/analytics",
                    icon: BarChart3
                },
                {
                    name: "Clean Duplicates",
                    path: "/admin/duplicates",
                    icon: CopyCheck
                },
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
                style={{ "--sidebar-w": `${width}px` }}
                className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 lg:w-[var(--sidebar-w)] flex-col bg-slate-950 border-r border-slate-800 text-slate-300 lg:translate-x-0 ${
                    isResizing ? "" : "transition-[width,transform] duration-200 ease-out"
                } ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
            >
                {/* Brand & Portal Header */}
                <div
                    className={`flex h-20 items-center border-b border-slate-800/80 bg-slate-950/80 ${
                        compact ? "justify-center px-2" : "justify-between px-4 sm:px-5"
                    }`}
                >
                    <Link
                        to="/admin"
                        title="Bidwallah Admin Panel"
                        className={`flex items-center gap-3 min-w-0 group ${compact ? "justify-center" : ""}`}
                    >
                        <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-md group-hover:scale-105 transition">
                            <img src={logoImg} alt="Bidwallah Logo" className="h-7 w-auto object-contain" />
                        </div>
                        {!compact && (
                            <div className="min-w-0">
                                <span className="block truncate text-xs font-black tracking-wider text-white uppercase">
                                    Bidwallah
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                    <Shield size={10} />
                                    <span className="truncate">ADMIN PANEL</span>
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop Collapse / Expand Toggle Button */}
                    {!compact && (
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title="Collapse sidebar (or drag right edge to resize)"
                            className="hidden lg:inline-flex rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition cursor-pointer shrink-0"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose size={17} />
                        </button>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={onCloseMobile}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Expand Button when in Compact Rail Mode */}
                {compact && (
                    <div className="hidden lg:flex justify-center pt-3 px-2">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                            <PanelLeftOpen size={16} />
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <div className={`flex-1 overflow-y-auto py-5 space-y-5 ${compact ? "px-2" : "px-3.5"}`}>
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1.5">
                            {!compact ? (
                                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                                    {section.title}
                                </div>
                            ) : (
                                sIdx > 0 && <div className="mx-2 my-2 border-t border-slate-800/80" />
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.end}
                                            title={item.name}
                                            onClick={onCloseMobile}
                                            className={({ isActive }) =>
                                                `group relative flex items-center rounded-xl text-xs font-bold transition duration-150 ${
                                                    compact
                                                        ? "justify-center p-2.5"
                                                        : "justify-between px-3.5 py-2.5"
                                                } ${
                                                    isActive
                                                        ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className={`flex items-center min-w-0 ${compact ? "justify-center" : "gap-3"}`}>
                                                        <Icon
                                                            size={18}
                                                            className={`shrink-0 transition ${
                                                                isActive
                                                                    ? "text-slate-950"
                                                                    : "text-slate-500 group-hover:text-amber-400"
                                                            }`}
                                                        />
                                                        {!compact && <span className="truncate">{item.name}</span>}
                                                    </div>

                                                    {/* Unread Badge or Arrow */}
                                                    {compact ? (
                                                        item.badgeCount > 0 && (
                                                            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                                                                {item.badgeCount}
                                                            </span>
                                                        )
                                                    ) : item.badge ? (
                                                        <span
                                                            className={`shrink-0 flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-black ${
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
                                                            className={`shrink-0 opacity-0 group-hover:opacity-100 transition ${
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
                <div className={`${compact ? "px-2" : "px-3.5"} pb-3`}>
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        title="View Public Website"
                        className={`flex items-center rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-bold text-slate-300 hover:bg-slate-900 hover:text-amber-400 transition ${
                            compact ? "justify-center p-2.5" : "justify-between px-3.5 py-2.5"
                        }`}
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Sparkles size={14} className="text-amber-400 shrink-0" />
                            {!compact && <span className="truncate">View Public Website</span>}
                        </div>
                        {!compact && <ExternalLink size={14} className="text-slate-500 shrink-0" />}
                    </Link>
                </div>

                {/* User Profile & Sign Out Footer */}
                <div className="border-t border-slate-800 bg-slate-950 p-3.5">
                    <div className={`flex items-center ${compact ? "flex-col gap-2 justify-center" : "justify-between gap-2"}`}>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div
                                title={adminUser?.name || "Administrator"}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-xs font-black text-slate-950 shadow-sm"
                            >
                                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            {!compact && (
                                <div className="overflow-hidden">
                                    <div className="truncate text-xs font-bold text-white">
                                        {adminUser?.name || "Administrator"}
                                    </div>
                                    <div className="truncate text-[10px] text-slate-400">
                                        {adminUser?.email || "admin@bidwallah.com"}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            title="Sign Out"
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer shrink-0"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Desktop Drag-to-Resize Handle along Right Edge (lg+) */}
                <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Drag to resize sidebar (double-click to reset)"
                    title="Drag to resize sidebar • Double-click to reset width"
                    onMouseDown={onStartResize}
                    onTouchStart={onStartResize}
                    onDoubleClick={onResetWidth}
                    className={`group/resizer hidden lg:flex absolute top-0 bottom-0 -right-1.5 z-50 w-3 cursor-col-resize items-center justify-center select-none`}
                >
                    {/* Highlight Line */}
                    <div
                        className={`h-full w-[3px] rounded-full transition-colors ${
                            isResizing
                                ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                                : "bg-transparent group-hover/resizer:bg-amber-500/70"
                        }`}
                    />

                    {/* Center Grip Pill */}
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 flex h-9 w-4 items-center justify-center rounded-full border transition-all ${
                            isResizing
                                ? "border-amber-400 bg-amber-500 text-slate-950 scale-110 shadow-md"
                                : "border-slate-700 bg-slate-900 text-slate-400 opacity-0 group-hover/resizer:opacity-100 hover:border-amber-400 hover:text-amber-400"
                        }`}
                    >
                        <GripVertical size={11} />
                    </div>

                    {/* Live Width Indicator Pill while Dragging */}
                    {isResizing && (
                        <div className="pointer-events-none absolute top-24 left-4 rounded-lg border border-amber-400/40 bg-slate-950/95 px-2.5 py-1 text-[10px] font-black text-amber-400 whitespace-nowrap shadow-xl">
                            {compact ? "Compact (76px)" : `${width}px`}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
