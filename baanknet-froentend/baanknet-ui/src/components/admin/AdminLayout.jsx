import React, { useState, useEffect, useCallback } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Mail,
    Sparkles,
    Building2,
    PlusCircle
} from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminCommandPalette from "./AdminCommandPalette";
import { fetchInquiries } from "../../services/adminService";

const DEFAULT_SIDEBAR_WIDTH = 288;
const MIN_SIDEBAR_WIDTH = 210;
const MAX_SIDEBAR_WIDTH = 440;
const COLLAPSED_SIDEBAR_WIDTH = 76;
const SNAP_COLLAPSE_THRESHOLD = 145;

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

    // Persist width & collapsed state
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

    // Global mouse / touch listeners while dragging the sidebar edge
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

    // Lock body scroll when mobile sidebar is open
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

    // Fetch new inquiries badge count
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

    // Global Ctrl+K / Cmd+K keyboard listener
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
        { name: "Dashboard", path: "/admin", end: true, icon: LayoutDashboard },
        {
            name: "Leads",
            path: "/admin/inquiries",
            icon: Mail,
            badge: newInquiriesCount > 0 ? newInquiriesCount : null
        },
        { name: "Fresh", path: "/admin/fresh-properties", icon: Sparkles },
        { name: "Auction", path: "/admin/properties", end: true, icon: Building2 },
        { name: "Add New", path: "/admin/properties/new", icon: PlusCircle }
    ];

    return (
        <div
            className="min-h-screen w-full overflow-x-hidden bg-slate-100/70 text-slate-900 font-sans"
            style={{ "--admin-sidebar-width": `${effectiveSidebarWidth}px` }}
        >
            {/* Admin Resizable & Responsive Sidebar */}
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

            {/* Main Area (dynamically tracks --admin-sidebar-width on lg+) */}
            <div
                className={`flex min-h-screen min-w-0 flex-col lg:pl-[var(--admin-sidebar-width)] ${
                    isResizing ? "" : "transition-[padding-left] duration-200 ease-out"
                }`}
            >
                <AdminTopbar
                    onOpenMobile={() => setMobileOpen(true)}
                    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />

                <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Quick Navigation Bar (< lg) */}
            <nav
                aria-label="Admin mobile quick navigation"
                className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-200 bg-white/95 px-1 py-1.5 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)] lg:hidden"
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
                                `relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition ${
                                    isActive
                                        ? "text-slate-950 font-black bg-amber-500/15"
                                        : "text-slate-500 hover:text-slate-900"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="relative">
                                        <Icon
                                            size={18}
                                            className={isActive ? "text-amber-600" : "text-slate-400"}
                                        />
                                        {item.badge ? (
                                            <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
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

            {/* Global Command Palette */}
            <AdminCommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />
        </div>
    );
}
