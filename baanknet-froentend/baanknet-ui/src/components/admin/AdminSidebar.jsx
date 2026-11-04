import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Building,
    Plus,
    Mail,
    RefreshCw,
    BarChart3,
    Settings,
    LogOut,
    ExternalLink,
    Landmark,
    CopyCheck,
    History,
    PanelLeftClose,
    PanelLeftOpen,
    X
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import logoImg from "../../assets/logo.jpg";

export default function AdminSidebar({
    mobileOpen,
    onCloseMobile,
    newInquiriesCount = 0,
    width = 256,
    isCollapsed = false,
    onToggleCollapse,
    isResizing = false,
    onStartResize,
    onResetWidth
}) {
    const { adminUser, logout } = useAdminAuth();

    const compact = isCollapsed && !mobileOpen;

    const navSections = [
        {
            title: "Workspace",
            items: [
                {
                    name: "Overview",
                    path: "/admin",
                    end: true,
                    icon: LayoutDashboard
                },
                {
                    name: "Buyer Inquiries",
                    path: "/admin/inquiries",
                    icon: Mail,
                    badge: newInquiriesCount > 0 ? String(newInquiriesCount) : null,
                    badgeCount: newInquiriesCount
                },
                {
                    name: "Direct Listings",
                    path: "/admin/fresh-properties",
                    icon: Building
                },
                {
                    name: "Auction Directory",
                    path: "/admin/properties",
                    end: true,
                    icon: Building2
                },
                {
                    name: "New Property",
                    path: "/admin/properties/new",
                    icon: Plus
                }
            ]
        },
        {
            title: "Operations",
            items: [
                {
                    name: "Partner Banks",
                    path: "/admin/banks",
                    icon: Landmark
                },
                {
                    name: "Crawler Sync",
                    path: "/admin/sync",
                    icon: RefreshCw
                },
                {
                    name: "Market Reports",
                    path: "/admin/analytics",
                    icon: BarChart3
                },
                {
                    name: "Deduplication",
                    path: "/admin/duplicates",
                    icon: CopyCheck
                },
                {
                    name: "Audit Log",
                    path: "/admin/audit-logs",
                    icon: History
                },
                {
                    name: "Settings",
                    path: "/admin/settings",
                    icon: Settings
                }
            ]
        }
    ];

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                style={{ "--sidebar-w": `${width}px` }}
                className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 lg:w-[var(--sidebar-w)] flex-col bg-gray-100/75 backdrop-blur-xl border-r border-gray-200/80 text-gray-600 lg:translate-x-0 ${
                    isResizing ? "" : "transition-[width,transform] duration-200 ease-out"
                } ${mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}`}
            >
                {/* Brand Header */}
                <div
                    className={`flex h-14 items-center border-b border-gray-200/80 bg-white/60 ${
                        compact ? "justify-center px-2" : "justify-between px-4"
                    }`}
                >
                    <Link
                        to="/admin"
                        title="Bidwallah Backoffice"
                        className={`flex items-center gap-2.5 min-w-0 ${compact ? "justify-center" : ""}`}
                    >
                        <div className="shrink-0 rounded-md border border-gray-200 bg-white p-1 shadow-2xs">
                            <img src={logoImg} alt="Bidwallah" className="h-5 w-auto object-contain" />
                        </div>
                        {!compact && (
                            <div className="flex items-baseline gap-1.5 min-w-0">
                                <span className="truncate text-sm font-bold tracking-tight text-gray-900">
                                    Bidwallah
                                </span>
                                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    Admin
                                </span>
                            </div>
                        )}
                    </Link>

                    {!compact && (
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title="Collapse sidebar"
                            className="hidden lg:inline-flex rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer shrink-0"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose size={15} />
                        </button>
                    )}

                    <button
                        onClick={onCloseMobile}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden cursor-pointer shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={16} />
                    </button>
                </div>

                {compact && (
                    <div className="hidden lg:flex justify-center pt-3 px-2">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                        >
                            <PanelLeftOpen size={15} />
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <div className={`flex-1 overflow-y-auto py-4 space-y-6 ${compact ? "px-2" : "px-3"}`}>
                    {navSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                            {!compact ? (
                                <div className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 truncate">
                                    {section.title}
                                </div>
                            ) : (
                                sIdx > 0 && <div className="mx-2 my-2 border-t border-gray-200" />
                            )}
                            <div className="space-y-0.5">
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
                                                `group relative flex items-center rounded-lg text-[13px] transition duration-150 ${
                                                    compact
                                                        ? "justify-center p-2"
                                                        : "justify-between px-2.5 py-2"
                                                } ${
                                                    isActive
                                                        ? "bg-red-600 text-white font-semibold border border-red-600 shadow-xs"
                                                        : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 font-medium border border-transparent"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <div className={`flex items-center min-w-0 ${compact ? "justify-center" : "gap-2.5"}`}>
                                                        <Icon
                                                            size={16}
                                                            className={`shrink-0 transition ${
                                                                isActive
                                                                    ? "text-white"
                                                                    : "text-gray-500 group-hover:text-gray-800"
                                                            }`}
                                                        />
                                                        {!compact && <span className="truncate">{item.name}</span>}
                                                    </div>

                                                    {compact ? (
                                                        item.badgeCount > 0 && (
                                                            <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                                                                {item.badgeCount}
                                                            </span>
                                                        )
                                                    ) : item.badge ? (
                                                        <span
                                                            className={`shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                                                                isActive
                                                                    ? "bg-white text-red-700"
                                                                    : "bg-red-100 text-red-700 border border-red-200"
                                                            }`}
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Public Website Link */}
                <div className={`${compact ? "px-2" : "px-3"} pb-2`}>
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Public Marketplace"
                        className={`flex items-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition ${
                            compact ? "justify-center p-2" : "justify-between px-3 py-2"
                        }`}
                    >
                        <span className={compact ? "sr-only" : "truncate"}>Public Marketplace</span>
                        <ExternalLink size={13} className="text-gray-400 shrink-0" />
                    </Link>
                </div>

                {/* User Profile & Sign Out Footer */}
                <div className="border-t border-gray-200 bg-white p-3">
                    <div className={`flex items-center ${compact ? "flex-col gap-2 justify-center" : "justify-between gap-2"}`}>
                        <div className={`flex items-center min-w-0 ${compact ? "justify-center" : "gap-2.5"}`}>
                            <div
                                title={adminUser?.name || "System Administrator"}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-2xs"
                            >
                                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            {!compact && (
                                <div className="min-w-0">
                                    <div className="truncate text-xs font-semibold text-gray-800">
                                        {adminUser?.name || "Administrator"}
                                    </div>
                                    <div className="truncate text-[11px] text-gray-500">
                                        {adminUser?.email || "admin@bidwallah.com"}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={logout}
                            title="Sign out"
                            className="shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>

                {/* Desktop Right-Edge Drag Handle for Resizing */}
                <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label="Resize sidebar"
                    title="Drag to resize sidebar (double-click to reset)"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onStartResize?.();
                    }}
                    onTouchStart={() => onStartResize?.()}
                    onDoubleClick={onResetWidth}
                    className={`group/handle absolute top-0 right-0 bottom-0 z-50 hidden w-1.5 cursor-col-resize items-center justify-center lg:flex transition-colors ${
                        isResizing ? "bg-red-500/40" : "hover:bg-red-400/40"
                    }`}
                />
            </aside>
        </>
    );
}
