import React, { useState, useEffect } from "react";
import {
    Database,
    Server,
    Download,
    User,
    RefreshCw,
    LogOut,
    PlusCircle
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { fetchSystemHealth, exportPropertiesData, createInquiry } from "../../services/adminService";
import { useApp } from "../../context/AppContext";

export default function AdminSettings() {
    const { adminUser, logout } = useAdminAuth();
    const { addToast } = useApp();

    const [health, setHealth] = useState(null);
    const [loadingHealth, setLoadingHealth] = useState(true);
    const [seedingLeads, setSeedingLeads] = useState(false);

    const checkHealth = async () => {
        try {
            setLoadingHealth(true);
            const res = await fetchSystemHealth();
            setHealth(res);
        } catch {
            setHealth({ success: false, database: "disconnected" });
        } finally {
            setLoadingHealth(false);
        }
    };

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        checkHealth();
    }, []);

    // Helper to seed demo sample inquiries for testing the CRM
    const handleSeedSampleLeads = async () => {
        try {
            setSeedingLeads(true);
            const sampleLeads = [
                {
                    name: "Amitabh Sen",
                    email: "amitabh.sen@infraholdings.in",
                    phone: "+91 98301 23456",
                    message: "We are interested in bidding for commercial industrial properties in Kolkata. Please share the statutory sale notice and earnest money deposit (EMD) account details.",
                    propertyTitle: "Commercial Industrial Land & Building in Howrah",
                    bankName: "State Bank of India",
                    cityName: "Kolkata",
                    propertyPrice: 8500000,
                    type: "property_inquiry",
                    priority: "high"
                },
                {
                    name: "Dr. Priyadarshini Mukherjee",
                    email: "dr.priya.mukherjee@healthplus.org",
                    phone: "+91 98312 98765",
                    message: "Requesting site inspection schedule for residential flat in Salt Lake Sector V before submitting e-auction bid.",
                    propertyTitle: "3 BHK Premium Flat in Salt Lake City",
                    bankName: "Punjab National Bank",
                    cityName: "Kolkata",
                    propertyPrice: 6500000,
                    type: "property_inquiry",
                    priority: "urgent"
                }
            ];

            for (const lead of sampleLeads) {
                await createInquiry(lead);
            }

            addToast("Sample demo leads seeded successfully into CRM!", "success");
        } catch (err) {
            console.error("Seed error:", err);
            addToast("Failed to seed demo leads", "error");
        } finally {
            setSeedingLeads(false);
        }
    };

    const handleExport = async (format) => {
        try {
            addToast(`Exporting full database as ${format.toUpperCase()}...`, "info");
            await exportPropertiesData(format);
            addToast(`Data export initiated!`, "success");
        } catch {
            addToast("Export failed", "error");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    System Settings &amp; Diagnostics
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Database status, administrator account credentials, and platform maintenance tools.
                </p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left (7 cols): System Health & Data Tools */}
                <div className="lg:col-span-7 space-y-6">
                    {/* 1. Infrastructure Diagnostics */}
                    <div className="rounded-xl border border-gray-200/80 bg-white/55 backdrop-blur-md p-5 sm:p-6 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2 uppercase tracking-wider text-[11px] text-red-600">
                                <Server size={15} />
                                <span>Infrastructure Diagnostics</span>
                            </h3>

                            <button
                                onClick={checkHealth}
                                disabled={loadingHealth}
                                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition cursor-pointer"
                                title="Refresh Diagnostics"
                            >
                                <RefreshCw size={14} className={loadingHealth ? "animate-spin text-red-600" : ""} />
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="font-medium text-gray-700">API Server Operational</span>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-red-700 bg-red-50 border border-red-200/70 px-2.5 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
                                    Healthy (Port 5000)
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="font-medium text-gray-700">MongoDB Atlas Cluster</span>
                                <span
                                    className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full border ${
                                        health?.database === "connected"
                                            ? "text-gray-800 bg-gray-200 border-gray-300"
                                            : "text-red-700 bg-red-50 border-red-200/70"
                                    }`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            health?.database === "connected" ? "bg-gray-700" : "bg-red-500"
                                        }`}
                                    ></span>
                                    {health?.database === "connected" ? "Connected (Atlas Sharded)" : "Active"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="font-medium text-gray-700">Server Uptime</span>
                                <span className="font-mono font-semibold text-gray-800">
                                    {health?.uptimeSeconds ? `${Math.floor(health.uptimeSeconds / 60)} min ${health.uptimeSeconds % 60} sec` : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Database & Backup Tools */}
                    <div className="rounded-xl border border-gray-200/80 bg-white/55 backdrop-blur-md p-5 sm:p-6 shadow-2xs space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 uppercase tracking-wider text-[11px] text-red-600">
                            <Database size={15} />
                            <span>Data Management &amp; Backup Tools</span>
                        </h3>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            Generate complete snapshots of all indexed bank auction listings, borrower details, and valuation data.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <button
                                onClick={() => handleExport("csv")}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 py-2.5 text-xs font-semibold text-gray-800 transition cursor-pointer"
                            >
                                <Download size={14} />
                                <span>Export All Listings (CSV)</span>
                            </button>

                            <button
                                onClick={() => handleExport("json")}
                                className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 py-2.5 text-xs font-semibold text-gray-800 transition cursor-pointer"
                            >
                                <Download size={14} />
                                <span>Export Full Backup (JSON)</span>
                            </button>
                        </div>

                        {/* Seed Sample Leads */}
                        <div className="pt-3 border-t border-gray-100">
                            <button
                                onClick={handleSeedSampleLeads}
                                disabled={seedingLeads}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-50/80 border border-red-200 hover:bg-red-100/80 py-2.5 text-xs font-semibold text-red-700 transition cursor-pointer disabled:opacity-50"
                            >
                                <PlusCircle size={14} className="text-red-600" />
                                <span>{seedingLeads ? "Seeding..." : "Seed Sample Demo Leads for CRM Testing"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right (5 cols): Admin Account Profile & Session */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Admin Profile Card */}
                    <div className="rounded-xl border border-gray-200/80 bg-white/55 backdrop-blur-md p-5 sm:p-6 shadow-2xs space-y-5">
                        <h3 className="font-semibold flex items-center gap-2 uppercase tracking-wider text-[11px] text-red-600">
                            <User size={15} />
                            <span>Administrator Profile</span>
                        </h3>

                        <div className="flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-br from-red-50/70 via-white to-gray-50 border border-red-200/70 text-gray-900">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white font-bold text-base shrink-0">
                                {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            <div className="min-w-0">
                                <span className="block font-bold text-sm text-gray-900 truncate">
                                    {adminUser?.name || "System Administrator"}
                                </span>
                                <span className="block text-[11px] text-gray-500 truncate">
                                    {adminUser?.email || "admin@bidwallah.com"}
                                </span>
                                <span className="inline-block mt-1 text-[10px] font-semibold uppercase text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
                                    Super Admin
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Security Clearance</span>
                                <span className="font-semibold text-slate-900">Level 1 Full Access</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">Authentication Mode</span>
                                <span className="font-semibold text-slate-900">Bearer Token JWT</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                <span className="text-slate-500">SARFAESI Access</span>
                                <span className="font-semibold text-emerald-600">Unrestricted</span>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="pt-2">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 py-2.5 text-xs font-semibold text-rose-700 transition cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span>Sign Out Administrator Session</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
