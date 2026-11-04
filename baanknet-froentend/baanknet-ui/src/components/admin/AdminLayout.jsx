import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Mail,
    Building,
    Building2,
    Plus
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminCommandPalette from "./AdminCommandPalette";
import { fetchInquiries } from "../../services/adminService";

const DEFAULT_SIDEBAR_WIDTH = 256;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 380;
const COLLAPSED_SIDEBAR_WIDTH = 68;
const SNAP_COLLAPSE_THRESHOLD = 140;

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [newInquiriesCount, setNewInquiriesCount] = useState(0);
    const location = useLocation();

    // Resizable & Collapsible Sidebar state (persisted in localStorage)
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        try {
            const saved = Number(localStorage.getItem("bw_admin_sidebar_width"));
            if (saved >= MIN_SIDEBAR_WIDTH && saved <= MAX_SIDEBAR_WIDTH) {
                return saved;
            }
        } catch {}
        return DEFAULT_SIDEBAR_WIDTH;
    });

    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem("bw_admin_sidebar_collapsed") === "1";
        } catch {}
        return false;
    });

    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem("bw_admin_sidebar_width", String(sidebarWidth));
            localStorage.setItem("bw_admin_sidebar_collapsed", isCollapsed ? "1" : "0");
        } catch {}
    }, [sidebarWidth, isCollapsed]);

    const handleResizeMove = useCallback((clientX) => {
        if (clientX < SNAP_COLLAPSE_THRESHOLD) {
            setIsCollapsed(true);
        } else {
            setIsCollapsed(false);
            const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, clientX));
            setSidebarWidth(Math.round(clamped));
        }
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const onMouseMove = (e) => {
            e.preventDefault();
            handleResizeMove(e.clientX);
        };

        const onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                handleResizeMove(e.touches[0].clientX);
            }
        };

        const stopResizing = () => {
            setIsResizing(false);
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", stopResizing);
        window.addEventListener("touchmove", onTouchMove, { passive: true });
        window.addEventListener("touchend", stopResizing);

        return () => {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", stopResizing);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", stopResizing);
        };
    }, [isResizing, handleResizeMove]);

    const handleResetSidebarWidth = () => {
        setIsCollapsed(false);
        setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
    };

    const effectiveSidebarWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : sidebarWidth;

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileOpen]);

    useEffect(() => {
        let isMounted = true;
        fetchInquiries({ status: "new", limit: 1 })
            .then((res) => {
                if (isMounted && res?.statusCounts?.new !== undefined) {
                    setNewInquiriesCount(res.statusCounts.new);
                }
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [location.pathname]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const mobileBottomNav = [
        { name: "Overview", path: "/admin", end: true, icon: LayoutDashboard },
        {
            name: "Inquiries",
            path: "/admin/inquiries",
            icon: Mail,
            badge: newInquiriesCount > 0 ? newInquiriesCount : null
        },
        { name: "Direct", path: "/admin/fresh-properties", icon: Building },
        { name: "Auctions", path: "/admin/properties", end: true, icon: Building2 },
        { name: "New", path: "/admin/properties/new", icon: Plus }
    ];

    return (
        <div
            className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-gray-200/80 via-[#F3F4F6] to-red-50/50 text-gray-800 font-sans antialiased"
            style={{ "--admin-sidebar-width": `${effectiveSidebarWidth}px` }}
        >
            {/* Subtle Ambient Red & Gray Glassmorphic Backdrop */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
                <div className="absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-gray-400/20 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />
            </div>

            <AdminSidebar
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
                newInquiriesCount={newInquiriesCount}
                width={effectiveSidebarWidth}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
                isResizing={isResizing}
                onStartResize={() => setIsResizing(true)}
                onResetWidth={handleResetSidebarWidth}
            />

            <div
                className={`relative z-10 flex min-h-screen min-w-0 flex-col lg:pl-[var(--admin-sidebar-width)] ${
                    isResizing ? "" : "transition-[padding-left] duration-200 ease-out"
                }`}
            >
                <AdminTopbar
                    onOpenMobile={() => setMobileOpen(true)}
                    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />

                <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-8 pb-24 lg:pb-10 max-w-[1600px] w-full mx-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation (< lg) */}
            <nav
                aria-label="Admin mobile navigation"
                className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200/80 bg-white/75 backdrop-blur-xl px-1 py-1.5 lg:hidden"
            >
                {mobileBottomNav.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition ${
                                    isActive
                                        ? "text-red-700 font-semibold bg-red-50"
                                        : "text-gray-500 hover:text-gray-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative">
                                        <Icon
                                            size={17}
                                            className={isActive ? "text-red-600" : "text-gray-400"}
                                        />
                                        {item.badge ? (
                                            <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-semibold text-white">
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </div>
                                    <span className="truncate max-w-[64px]">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            <AdminCommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />
        </div>
    );
}
