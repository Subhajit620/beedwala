import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    Phone,
    Search,
    Trash2,
    MessageSquare,
    Download,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Send,
    LayoutGrid,
    Table as TableIcon,
    ArrowRight,
    Clock,
    User,
    CheckCircle2,
    Calendar,
    Sparkles,
    Building2,
    Filter,
    X,
    ExternalLink
} from "lucide-react";
import { fetchInquiries, updateInquiry, deleteInquiry } from "../../services/adminService";
import { formatDate, formatINR } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import { LoadingSpinner } from "../../components/Loading";

export default function AdminInquiries() {
    const { addToast } = useApp();

    const [inquiries, setInquiries] = useState([]);
    const [statusCounts, setStatusCounts] = useState({ all: 0, new: 0, contacted: 0, in_progress: 0, converted: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // View Mode: 'table' or 'kanban'
    const [viewMode, setViewMode] = useState("table");

    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(25);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Active Lead Detail Modal / Drawer
    const [activeLead, setActiveLead] = useState(null);
    const [newNote, setNewNote] = useState("");
    const [savingNote, setSavingNote] = useState(false);

    const loadInquiries = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: viewMode === "kanban" ? 100 : limit,
                status: statusFilter !== "all" ? statusFilter : undefined,
                search: search || undefined
            };

            const res = await fetchInquiries(params);
            if (res.success) {
                setInquiries(res.data || []);
                setStatusCounts(res.statusCounts || {});
                setTotal(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Failed to load inquiries:", err);
            setError("Failed to load leads list.");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter, search, viewMode]);

    useEffect(() => {
        loadInquiries();
    }, [loadInquiries]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateInquiry(id, { status: newStatus });
            setInquiries((prev) =>
                prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
            );
            if (activeLead && activeLead._id === id) {
                setActiveLead((prev) => ({ ...prev, status: newStatus }));
            }
            addToast(`Lead status updated to ${newStatus.replace("_", " ")}`, "success");
        } catch {
            addToast("Failed to update status", "error");
        }
    };

    const handlePriorityUpdate = async (id, newPriority) => {
        try {
            await updateInquiry(id, { priority: newPriority });
            setInquiries((prev) =>
                prev.map((inq) => (inq._id === id ? { ...inq, priority: newPriority } : inq))
            );
            if (activeLead && activeLead._id === id) {
                setActiveLead((prev) => ({ ...prev, priority: newPriority }));
            }
            addToast(`Priority changed to ${newPriority}`, "success");
        } catch {
            addToast("Failed to update priority", "error");
        }
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim() || !activeLead) return;

        try {
            setSavingNote(true);
            const res = await updateInquiry(activeLead._id, { note: newNote.trim() });
            if (res.success && res.data) {
                setActiveLead(res.data);
                setInquiries((prev) =>
                    prev.map((inq) => (inq._id === activeLead._id ? res.data : inq))
                );
                setNewNote("");
                addToast("Internal admin note saved!", "success");
            }
        } catch {
            addToast("Failed to save note", "error");
        } finally {
            setSavingNote(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead record?")) return;
        try {
            await deleteInquiry(id);
            addToast("Lead record removed", "success");
            if (activeLead && activeLead._id === id) setActiveLead(null);
            loadInquiries();
        } catch {
            addToast("Failed to delete inquiry", "error");
        }
    };

    // 1-Click WhatsApp Tender Dispatcher
    const handleSendWhatsApp = (lead) => {
        if (!lead.phone) {
            addToast("No phone number available for this lead", "warning");
            return;
        }

        const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

        const text = encodeURIComponent(
            `*Greetings from Baanknet / Bidwallah Team* 🏛️\n\n` +
            `Hello *${lead.name}*,\n` +
            `We received your inquiry regarding *${lead.propertyTitle || "Bank Auction Asset"}*.\n\n` +
            `📋 *Property Notice Ref:* ${lead.propertyId || "SARFAESI"}\n` +
            `💰 *Reserve Price:* ${lead.propertyPrice ? formatINR(lead.propertyPrice) : "On Request"}\n\n` +
            `Our legal & auction advisory desk is available to share the complete tender document, encumbrance report, and inspection schedule.\n\n` +
            `Best regards,\n*Baanknet Auction Advisory Desk*`
        );

        window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
        addToast("WhatsApp tender dispatch opened in new tab", "success");
    };

    // Export Leads to CSV
    const handleExportCSV = () => {
        if (inquiries.length === 0) return;
        const headers = ["Name", "Email", "Phone", "Status", "Priority", "PropertyTitle", "PropertyPrice", "Date", "Message"];
        let csv = headers.join(",") + "\n";
        inquiries.forEach((item) => {
            const row = [
                `"${item.name || ""}"`,
                `"${item.email || ""}"`,
                `"${item.phone || ""}"`,
                `"${item.status || ""}"`,
                `"${item.priority || ""}"`,
                `"${(item.propertyTitle || "").replace(/"/g, '""')}"`,
                `"${item.propertyPrice || ""}"`,
                `"${formatDate(item.createdAt) || ""}"`,
                `"${(item.message || "").replace(/"/g, '""')}"`
            ];
            csv += row.join(",") + "\n";
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `baanknet_leads_crm_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast("Leads exported to CSV", "success");
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "new":
                return <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-600 border border-rose-500/20">● NEW LEAD</span>;
            case "contacted":
                return <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-black text-blue-600 border border-blue-500/20">CONTACTED</span>;
            case "in_progress":
                return <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 border border-amber-500/20">DUE DILIGENCE</span>;
            case "converted":
                return <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 border border-emerald-500/20">SUCCESSFUL BID</span>;
            case "closed":
                return <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-500/20">CLOSED / ARCHIVED</span>;
            default:
                return <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{status}</span>;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "urgent":
                return <span className="rounded bg-rose-500 px-1.5 py-0.2 text-[9px] font-black text-white uppercase">Urgent</span>;
            case "high":
                return <span className="rounded bg-amber-500 px-1.5 py-0.2 text-[9px] font-black text-slate-950 uppercase">High</span>;
            case "medium":
                return <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold text-slate-700 uppercase">Medium</span>;
            default:
                return <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-500 uppercase">Low</span>;
        }
    };

    // Kanban Stages definition
    const kanbanStages = [
        { id: "new", title: "New Inquiries", color: "border-rose-400" },
        { id: "contacted", title: "Contacted", color: "border-blue-400" },
        { id: "in_progress", title: "Due Diligence / Visit", color: "border-amber-400" },
        { id: "converted", title: "Successful Bid / Won", color: "border-emerald-400" },
        { id: "closed", title: "Closed / Archived", color: "border-slate-400" }
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Mail className="text-amber-500" size={26} />
                        <span>Investor Inquiries & Leads CRM</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Manage prospective auction bidders, track diligence stages, dispatch WhatsApp tender packs, and log internal notes.
                    </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* View Switcher: Table vs Kanban */}
                    <div className="flex items-center rounded-xl bg-slate-200/80 p-1">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <TableIcon size={14} />
                            <span>Table</span>
                        </button>
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                viewMode === "kanban" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <LayoutGrid size={14} />
                            <span>Kanban</span>
                        </button>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 shadow-xs transition cursor-pointer"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">Export Leads</span>
                    </button>
                </div>
            </div>

            {/* Quick Status Tabs (Table Mode) */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
                {[
                    { id: "all", label: "All Leads", count: statusCounts.all || 0 },
                    { id: "new", label: "New Leads", count: statusCounts.new || 0, badgeColor: "bg-rose-500 text-white" },
                    { id: "contacted", label: "Contacted", count: statusCounts.contacted || 0 },
                    { id: "in_progress", label: "Due Diligence", count: statusCounts.in_progress || 0 },
                    { id: "converted", label: "Won / Converted", count: statusCounts.converted || 0 },
                    { id: "closed", label: "Closed", count: statusCounts.closed || 0 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setStatusFilter(tab.id);
                            setPage(1);
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                            statusFilter === tab.id
                                ? "bg-slate-950 text-amber-400 shadow-xs"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                                tab.badgeColor || (statusFilter === tab.id ? "bg-amber-400 text-slate-950" : "bg-slate-100 text-slate-600")
                            }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search leads by investor name, email, phone number, property title..."
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/15 transition"
                    />
                </div>
            </div>

            {/* Loading / Error States */}
            {loading ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            ) : viewMode === "kanban" ? (
                /* KANBAN PIPELINE BOARD VIEW */
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {kanbanStages.map((stage) => {
                        const stageLeads = inquiries.filter((inq) => inq.status === stage.id);

                        return (
                            <div
                                key={stage.id}
                                className={`flex flex-col rounded-2xl border bg-slate-100/70 p-3 max-h-[75vh] ${stage.color}`}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            {stage.title}
                                        </h3>
                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-700">
                                            {stageLeads.length}
                                        </span>
                                    </div>
                                </div>

                                {/* Cards Scroll Container */}
                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                    {stageLeads.length === 0 ? (
                                        <div className="py-8 text-center text-[11px] text-slate-400 font-semibold italic">
                                            No leads in this stage
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <div
                                                key={lead._id}
                                                className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:shadow-md hover:border-amber-400 transition"
                                            >
                                                <div className="flex items-start justify-between gap-1.5">
                                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                                        {lead.name}
                                                    </h4>
                                                    {getPriorityBadge(lead.priority)}
                                                </div>

                                                <div className="mt-1 text-[11px] text-slate-500 truncate">
                                                    {lead.propertyTitle || "General Auction Inquiry"}
                                                </div>

                                                {lead.propertyPrice && (
                                                    <div className="mt-1 text-[10px] font-bold text-emerald-600">
                                                        ₹{lead.propertyPrice.toLocaleString("en-IN")}
                                                    </div>
                                                )}

                                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                                                    {/* Quick Contact Icons */}
                                                    <div className="flex items-center gap-1">
                                                        {lead.phone && (
                                                            <button
                                                                onClick={() => handleSendWhatsApp(lead)}
                                                                title="Send WhatsApp Tender"
                                                                className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                                                            >
                                                                <Send size={13} />
                                                            </button>
                                                        )}
                                                        {lead.email && (
                                                            <a
                                                                href={`mailto:${lead.email}`}
                                                                title="Send Email"
                                                                className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                                                            >
                                                                <Mail size={13} />
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Open Drawer CTA */}
                                                    <button
                                                        onClick={() => setActiveLead(lead)}
                                                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline"
                                                    >
                                                        Details →
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : inquiries.length === 0 ? (
                /* Empty Table State */
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                    <Mail size={40} className="mx-auto text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">No customer inquiries found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                        Inquiries submitted from public auction factsheet modals will appear here in real-time.
                    </p>
                </div>
            ) : (
                /* TABLE VIEW */
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    <th className="py-3.5 px-4 sm:px-6">Investor / Contact</th>
                                    <th className="py-3.5 px-4">Property Inquired</th>
                                    <th className="py-3.5 px-4">Status & Stage</th>
                                    <th className="py-3.5 px-4">Priority</th>
                                    <th className="py-3.5 px-4">Received</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inquiries.map((inq) => (
                                    <tr key={inq._id} className="hover:bg-slate-50/60 transition">
                                        {/* Investor Profile */}
                                        <td className="py-3.5 px-4 sm:px-6">
                                            <div className="font-bold text-slate-900">{inq.name}</div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                                {inq.phone && (
                                                    <a
                                                        href={`tel:${inq.phone}`}
                                                        className="hover:text-amber-600 flex items-center gap-1"
                                                    >
                                                        <Phone size={11} />
                                                        <span>{inq.phone}</span>
                                                    </a>
                                                )}
                                                {inq.email && (
                                                    <a
                                                        href={`mailto:${inq.email}`}
                                                        className="hover:text-amber-600 flex items-center gap-1"
                                                    >
                                                        <Mail size={11} />
                                                        <span>{inq.email}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </td>

                                        {/* Property Inquired */}
                                        <td className="py-3.5 px-4 max-w-xs">
                                            <div className="font-bold text-slate-800 truncate" title={inq.propertyTitle}>
                                                {inq.propertyTitle || "General Auction Inquiry"}
                                            </div>
                                            {inq.propertyPrice ? (
                                                <div className="text-[10px] font-semibold text-emerald-600">
                                                    ₹{inq.propertyPrice.toLocaleString("en-IN")}
                                                </div>
                                            ) : null}
                                        </td>

                                        {/* Status / Stage Dropdown */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            <select
                                                value={inq.status || "new"}
                                                onChange={(e) => handleStatusUpdate(inq._id, e.target.value)}
                                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 transition cursor-pointer"
                                            >
                                                <option value="new">● New Lead</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="in_progress">Due Diligence</option>
                                                <option value="converted">Won / Closed</option>
                                                <option value="closed">Archived</option>
                                            </select>
                                        </td>

                                        {/* Priority */}
                                        <td className="py-3.5 px-4 whitespace-nowrap">
                                            {getPriorityBadge(inq.priority)}
                                        </td>

                                        {/* Date */}
                                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                                            {formatDate(inq.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {inq.phone && (
                                                    <button
                                                        onClick={() => handleSendWhatsApp(inq)}
                                                        title="WhatsApp Dispatch"
                                                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setActiveLead(inq)}
                                                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                                >
                                                    View Lead
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(inq._id)}
                                                    title="Delete Lead"
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Table Mode) */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:px-6">
                            <div className="text-xs font-semibold text-slate-500">
                                Showing <span className="font-bold text-slate-900">{inquiries.length}</span> of{" "}
                                <span className="font-bold text-slate-900">{total}</span> leads
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-bold text-slate-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Lead Detail & Notes Drawer / Modal */}
            {activeLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-scale-up">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 font-black text-amber-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">{activeLead.name}</h3>
                                    <p className="text-xs text-slate-500">
                                        Received on {formatDate(activeLead.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setActiveLead(null)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Contact & Stage Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Email & Phone
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 mt-1">
                                        {activeLead.email || "No email provided"}
                                    </div>
                                    <div className="text-xs font-bold text-slate-800">
                                        {activeLead.phone || "No phone provided"}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Pipeline Stage & Priority
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(activeLead.status)}
                                        {getPriorityBadge(activeLead.priority)}
                                    </div>
                                </div>
                            </div>

                            {/* Property Notice Details */}
                            {activeLead.propertyTitle && (
                                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                        Inquired Property Notice
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                                        {activeLead.propertyTitle}
                                    </h4>
                                    {activeLead.propertyPrice && (
                                        <div className="text-xs font-bold text-emerald-700 mt-1">
                                            Reserve Price: ₹{activeLead.propertyPrice.toLocaleString("en-IN")}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer Message */}
                            {activeLead.message && (
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                        Customer Inquiry Message
                                    </span>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
                                        "{activeLead.message}"
                                    </div>
                                </div>
                            )}

                            {/* Internal Admin Notes Thread */}
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                    Internal Admin Due-Diligence Notes ({activeLead.notes?.length || 0})
                                </span>

                                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                                    {(!activeLead.notes || activeLead.notes.length === 0) ? (
                                        <p className="text-xs text-slate-400 italic">No notes logged yet.</p>
                                    ) : (
                                        activeLead.notes.map((n, i) => (
                                            <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-xs">
                                                <p className="text-slate-800 font-medium">{n.content}</p>
                                                <span className="text-[10px] text-slate-400 mt-1 block">
                                                    {n.author || "Admin"} • {formatDate(n.createdAt)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add Note Form */}
                                <form onSubmit={handleAddNote} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add internal note / callback summary..."
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-amber-500 focus:bg-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={savingNote || !newNote.trim()}
                                        className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-900 disabled:opacity-40 transition"
                                    >
                                        Save Note
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                onClick={() => setActiveLead(null)}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Close
                            </button>

                            <div className="flex items-center gap-2">
                                {activeLead.phone && (
                                    <button
                                        onClick={() => handleSendWhatsApp(activeLead)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                    >
                                        <Send size={14} />
                                        <span>Dispatch WhatsApp Pack</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
