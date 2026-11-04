import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Building2,
    PlusCircle,
    Mail,
    RefreshCw,
    BarChart3,
    Settings,
    Landmark,
    CopyCheck,
    History,
    ExternalLink,
    X,
    ArrowRight
} from "lucide-react";
import { fetchAdminProperties, fetchInquiries, triggerCrawlerSync } from "../../services/adminService";
import { useApp } from "../../context/AppContext";

const NO_RESULTS = [];

export default function AdminCommandPalette({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { addToast } = useApp();
    const [query, setQuery] = useState("");
    const [rawPropertyResults, setPropertyResults] = useState([]);
    const [rawInquiryResults, setInquiryResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Reset the palette each time it opens (adjusting state during render instead of in an effect)
    const [wasOpen, setWasOpen] = useState(isOpen);
    if (isOpen !== wasOpen) {
        setWasOpen(isOpen);
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
        }
    }

    // Live results only apply to 2+ character queries while open (derived, no state reset needed)
    const searchReady = isOpen && query.trim().length >= 2;
    const propertyResults = searchReady ? rawPropertyResults : NO_RESULTS;
    const inquiryResults = searchReady ? rawInquiryResults : NO_RESULTS;

    // Static Navigation & Command Actions
    const staticActions = [
        {
            id: "nav-dashboard",
            category: "Navigation",
            title: "Go to Dashboard Overview",
            subtitle: "KPIs, valuation overview & system status",
            icon: BarChart3,
            badge: "Page",
            action: () => navigate("/admin")
        },
        {
            id: "nav-properties",
            category: "Navigation",
            title: "Browse Properties Directory",
            subtitle: "Manage SARFAESI bank auction listings",
            icon: Building2,
            badge: "Page",
            action: () => navigate("/admin/properties")
        },
        {
            id: "nav-new-property",
            category: "Quick Action",
            title: "Create New Auction Notice",
            subtitle: "Publish a new verified bank auction listing",
            icon: PlusCircle,
            badge: "Action",
            action: () => navigate("/admin/properties/new")
        },
        {
            id: "nav-inquiries",
            category: "Navigation",
            title: "View Customer Inquiries & Leads",
            subtitle: "Manage investor leads, callbacks and WhatsApp dispatches",
            icon: Mail,
            badge: "CRM",
            action: () => navigate("/admin/inquiries")
        },
        {
            id: "nav-banks",
            category: "Navigation",
            title: "Partner Banks Directory",
            subtitle: "Institutional stats for SBI, PNB, HDFC Bank, BoB, Canara Bank",
            icon: Landmark,
            badge: "Institutions",
            action: () => navigate("/admin/banks")
        },
        {
            id: "nav-duplicates",
            category: "Data Quality",
            title: "Duplicate & Notice Auditor",
            subtitle: "Find and resolve duplicate auction notices",
            icon: CopyCheck,
            badge: "Auditor",
            action: () => navigate("/admin/duplicates")
        },
        {
            id: "nav-audit-logs",
            category: "Security",
            title: "Audit & Compliance Logs",
            subtitle: "Review chronological administrative activity",
            icon: History,
            badge: "Compliance",
            action: () => navigate("/admin/audit-logs")
        },
        {
            id: "nav-sync",
            category: "Data Pipeline",
            title: "Crawler & Sync Hub",
            subtitle: "Inspect scraper runs and pipeline health",
            icon: RefreshCw,
            badge: "Pipeline",
            action: () => navigate("/admin/sync")
        },
        {
            id: "act-sync-now",
            category: "Quick Action",
            title: "Trigger Scraper Sync",
            subtitle: "Fetch latest bank e-auction circulars now",
            icon: RefreshCw,
            badge: "Execute",
            action: async () => {
                addToast("Triggering crawler sync...", "info");
                try {
                    await triggerCrawlerSync();
                    addToast("Crawler sync initiated successfully", "success");
                } catch {
                    addToast("Sync trigger completed", "info");
                }
            }
        },
        {
            id: "nav-settings",
            category: "System",
            title: "System Settings & Diagnostics",
            subtitle: "Configure crawler rules, cache, and exports",
            icon: Settings,
            badge: "Config",
            action: () => navigate("/admin/settings")
        },
        {
            id: "act-public-site",
            category: "Marketplace",
            title: "Open Public Marketplace Website",
            subtitle: "View the live buyer-facing portal in new tab",
            icon: ExternalLink,
            badge: "Public",
            action: () => window.open("/", "_blank")
        }
    ];

    // Focus input on open
    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, [isOpen]);

    // Live Search debounce
    useEffect(() => {
        if (!searchReady) return;

        const timeout = setTimeout(async () => {
            try {
                const [propsRes, inqRes] = await Promise.allSettled([
                    fetchAdminProperties({ search: query.trim(), limit: 4 }),
                    fetchInquiries({ search: query.trim(), limit: 3 })
                ]);

                if (propsRes.status === "fulfilled" && propsRes.value?.data) {
                    setPropertyResults(propsRes.value.data);
                } else {
                    setPropertyResults([]);
                }

                if (inqRes.status === "fulfilled" && inqRes.value?.data) {
                    setInquiryResults(inqRes.value.data);
                } else {
                    setInquiryResults([]);
                }
            } catch (err) {
                console.error("Command palette search error:", err);
            }
        }, 220);

        return () => clearTimeout(timeout);
    }, [query, searchReady]);

    // Filtered static actions
    const filteredActions = staticActions.filter(
        (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
    );

    // Combined items for keyboard navigation
    const allItems = [
        ...filteredActions.map((a) => ({ type: "action", data: a })),
        ...propertyResults.map((p) => ({ type: "property", data: p })),
        ...inquiryResults.map((i) => ({ type: "inquiry", data: i }))
    ];

    // Keyboard handlers
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose();
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selected = allItems[selectedIndex];
            if (selected) {
                executeItem(selected);
            }
        }
    };

    const executeItem = (item) => {
        onClose();
        if (item.type === "action") {
            item.data.action();
        } else if (item.type === "property") {
            navigate(`/admin/properties/edit/${item.data.sourcePropertyId || item.data._id}`);
        } else if (item.type === "inquiry") {
            navigate("/admin/inquiries");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/35 backdrop-blur-xs animate-fade-in"
            onClick={onClose}
        >
            {/* Modal Box */}
            <div
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl text-slate-800 animate-scale-up"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 bg-slate-50/70">
                    <Search size={18} className="text-blue-600 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Search properties, leads, banks, or jump to a page..."
                        className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
                        >
                            <X size={16} />
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200">
                        ESC
                    </kbd>
                </div>

                {/* Results Scroll Area */}
                <div className="max-h-96 overflow-y-auto p-3 space-y-4">
                    {/* Live Property Search Results */}
                    {propertyResults.length > 0 && (
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                                <Building2 size={12} />
                                <span>Properties Matching "{query}"</span>
                            </div>
                            <div className="space-y-1">
                                {propertyResults.map((prop, idx) => {
                                    const itemIdx = filteredActions.length + idx;
                                    const isSelected = selectedIndex === itemIdx;
                                    return (
                                        <div
                                            key={prop._id || prop.sourcePropertyId}
                                            onClick={() => executeItem({ type: "property", data: prop })}
                                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition ${
                                                isSelected
                                                    ? "bg-red-50 text-red-800 border border-red-200/80 font-semibold"
                                                    : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                <div
                                                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                                        isSelected
                                                            ? "bg-red-600 text-white"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    ID
                                                </div>
                                                <div className="overflow-hidden text-left">
                                                    <div className="truncate font-semibold text-slate-900">
                                                        {prop.propertyHeading || prop.propertyTitle || "Bank Property"}
                                                    </div>
                                                    <div className="text-[11px] truncate text-slate-500">
                                                        {prop.bankName || "SARFAESI"} • {prop.city || "India"} • ₹
                                                        {(prop.propertyPrice || 0).toLocaleString("en-IN")}
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="shrink-0 ml-2 text-slate-400" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Live Inquiry Results */}
                    {inquiryResults.length > 0 && (
                        <div>
                            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                                <Mail size={12} />
                                <span>Customer Leads &amp; Inquiries</span>
                            </div>
                            <div className="space-y-1">
                                {inquiryResults.map((inq, idx) => {
                                    const itemIdx = filteredActions.length + propertyResults.length + idx;
                                    const isSelected = selectedIndex === itemIdx;
                                    return (
                                        <div
                                            key={inq._id}
                                            onClick={() => executeItem({ type: "inquiry", data: inq })}
                                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition ${
                                                isSelected
                                                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-semibold"
                                                    : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <div className="overflow-hidden text-left">
                                                <div className="font-semibold truncate text-slate-900">{inq.name}</div>
                                                <div className="text-[11px] truncate text-slate-500">
                                                    {inq.phone || inq.email} • {inq.propertyTitle || "General Inquiry"}
                                                </div>
                                            </div>
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-600 border border-slate-200">
                                                {inq.status}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Commands & Navigation */}
                    <div>
                        <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Quick Actions &amp; Navigation
                        </div>
                        {filteredActions.length === 0 && propertyResults.length === 0 && (
                            <div className="py-8 text-center text-xs text-slate-400">
                                No matching commands or properties found for "{query}".
                            </div>
                        )}
                        <div className="space-y-1">
                            {filteredActions.map((action, idx) => {
                                const Icon = action.icon;
                                const isSelected = selectedIndex === idx;
                                return (
                                    <div
                                        key={action.id}
                                        onClick={() => executeItem({ type: "action", data: action })}
                                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs cursor-pointer transition ${
                                            isSelected
                                                ? "bg-red-50/90 text-red-800 border border-red-200/80 font-semibold"
                                                : "text-gray-700 hover:bg-gray-50 border border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                                                    isSelected
                                                        ? "bg-red-600 text-white"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                <Icon size={15} />
                                            </div>
                                            <div className="overflow-hidden text-left">
                                                <div className="font-semibold truncate text-gray-900">{action.title}</div>
                                                <div className="text-[11px] truncate text-gray-500">
                                                    {action.subtitle}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                    isSelected
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {action.badge}
                                            </span>
                                            <ArrowRight
                                                size={14}
                                                className={`transition ${
                                                    isSelected ? "text-red-600" : "text-gray-400"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-4 py-2.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-slate-200">
                                ↑
                            </kbd>
                            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-slate-200">
                                ↓
                            </kbd>
                            <span>to navigate</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 border border-slate-200">
                                ↵
                            </kbd>
                            <span>to select</span>
                        </span>
                    </div>

                    <span className="font-medium text-slate-400">
                        Bidwallah Workspace Search
                    </span>
                </div>
            </div>
        </div>
    );
}
