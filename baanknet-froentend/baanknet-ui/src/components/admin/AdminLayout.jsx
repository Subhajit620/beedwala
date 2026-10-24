import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminCommandPalette from "./AdminCommandPalette";
import { fetchInquiries } from "../../services/adminService";

export default function AdminLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [newInquiriesCount, setNewInquiriesCount] = useState(0);

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
    }, []);

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

    return (
        <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans">
            {/* Admin Responsive Sidebar */}
            <AdminSidebar
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
                newInquiriesCount={newInquiriesCount}
            />

            {/* Main Area */}
            <div className="flex min-h-screen flex-col lg:pl-72">
                <AdminTopbar
                    onOpenMobile={() => setMobileOpen(true)}
                    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Global Command Palette */}
            <AdminCommandPalette
                isOpen={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
            />
        </div>
    );
}
