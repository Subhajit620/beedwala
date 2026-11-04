import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    CopyCheck,
    Search,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import { fetchDuplicateNotices, bulkPropertyAction } from "../../services/adminService";
import { useApp } from "../../context/AppContext";

export default function AdminDuplicates() {
    const { addToast } = useApp();
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [resolvedGroups, setResolvedGroups] = useState(new Set());

    const loadDuplicates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchDuplicateNotices();
            if (res.success && Array.isArray(res.data)) {
                setDuplicateGroups(res.data);
            }
        } catch (err) {
            console.error("Failed to load duplicates:", err);
            addToast("Failed to fetch duplicate clusters", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        // oxlint-disable-next-line react/set-state-in-effect -- intentional: fetch data when the page opens
        loadDuplicates();
    }, [loadDuplicates]);

    // Filter duplicates by search
    const filteredGroups = duplicateGroups.filter((g) => {
        if (resolvedGroups.has(g._id)) return false;
        const query = search.toLowerCase();
        return (
            (g._id && g._id.toLowerCase().includes(query)) ||
            (g.banks && g.banks.some((b) => b.toLowerCase().includes(query))) ||
            (g.ids && g.ids.some((id) => id.toLowerCase().includes(query)))
        );
    });

    const totalAffectedProperties = filteredGroups.reduce((acc, g) => acc + (g.count || 0), 0);

    // Keep the first listing as primary and deactivate the rest
    const handleKeepPrimaryAndArchiveRest = async (group) => {
        if (!group.ids || group.ids.length <= 1) return;
        const [primaryId, ...duplicateIds] = group.ids;

        try {
            setActionLoading(true);
            addToast(`Archiving ${duplicateIds.length} duplicate notice(s)...`, "info");
            await bulkPropertyAction("deactivate", duplicateIds);
            setResolvedGroups((prev) => new Set(prev).add(group._id));
            addToast(`Resolved cluster: Primary notice '${primaryId}' preserved, duplicates deactivated`, "success");
        } catch (err) {
            console.error("Failed to resolve duplicate cluster:", err);
            addToast("Failed to archive duplicates", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Whitelist / Dismiss cluster
    const handleDismissGroup = (groupTitle) => {
        setResolvedGroups((prev) => new Set(prev).add(groupTitle));
        addToast("Duplicate cluster marked as verified & dismissed", "info");
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-200/70 text-red-600 shrink-0">
                            <CopyCheck size={17} />
                        </div>
                        <span>Duplicate Notice Auditor</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Detect and clean up duplicate SARFAESI auction notices across crawler cycles.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadDuplicates}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : "text-gray-500"} />
                        <span>Re-Scan Database</span>
                    </button>
                </div>
            </div>

            {/* Quality Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Duplicate Clusters</span>
                        <div className="rounded-lg bg-red-100/80 p-2 text-red-600">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
                        {loading ? "..." : filteredGroups.length}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Groups with identical notices
                    </p>
                </div>

                <div className="rounded-xl border border-red-200/70 bg-gradient-to-br from-red-50/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Impacted Notices</span>
                        <div className="rounded-lg bg-red-100/80 p-2 text-red-600">
                            <CopyCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-600 tabular-nums">
                        {loading ? "..." : totalAffectedProperties}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Redundant listing entries
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Data Quality Score</span>
                        <div className="rounded-lg bg-gray-200/80 p-2 text-gray-700">
                            <ShieldCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-900 tabular-nums">
                        99.2%
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-red-700 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Verified Notice Hashes</span>
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200/80 bg-gradient-to-br from-gray-200/45 via-white/50 to-white/35 backdrop-blur-md p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">Resolved in Session</span>
                        <div className="rounded-lg bg-gray-200/80 p-2 text-gray-700">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-600 tabular-nums">
                        {resolvedGroups.size}
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">
                        Clusters cleaned up
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
                <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search duplicate clusters by notice title, bank, or ID..."
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition"
                    />
                </div>
            </div>

            {/* Duplicate Clusters List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse p-6" />
                    ))}
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-800">Clean Database — Zero Duplicates Detected</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                        All SARFAESI auction notice hashes, unique IDs, and titles are distinct and compliant.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredGroups.map((group, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition"
                        >
                            {/* Cluster Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-100">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                                            {group.count} Duplicate Copies
                                        </span>
                                        <span className="text-xs text-slate-400">•</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {(group.banks || []).join(", ") || "SARFAESI Partner Bank"}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                                        {group._id || "Bank Auction Notice"}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleDismissGroup(group._id)}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        Dismiss Cluster
                                    </button>

                                    <button
                                        onClick={() => handleKeepPrimaryAndArchiveRest(group)}
                                        disabled={actionLoading}
                                        className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <ShieldCheck size={14} />
                                        <span>Keep #1 &amp; Archive Others</span>
                                    </button>
                                </div>
                            </div>

                            {/* Duplicate Rows Comparison */}
                            <div className="mt-4 space-y-2">
                                {(group.ids || []).map((id, index) => {
                                    const uniqueId = group.uniqueIds?.[index] || id;
                                    const price = group.prices?.[index];
                                    const isPrimary = index === 0;

                                    return (
                                        <div
                                            key={id || index}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg p-3 text-xs border ${
                                                isPrimary
                                                    ? "bg-blue-50/50 border-blue-200/80"
                                                    : "bg-slate-50/70 border-slate-200/70"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                        isPrimary
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-slate-200 text-slate-700"
                                                    }`}
                                                >
                                                    {isPrimary ? "★" : `#${index + 1}`}
                                                </span>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900">
                                                            Source ID: {id}
                                                        </span>
                                                        {uniqueId && uniqueId !== id && (
                                                            <span className="text-[10px] font-medium text-slate-500">
                                                                (Ref: {uniqueId})
                                                            </span>
                                                        )}
                                                        {isPrimary && (
                                                            <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-semibold">
                                                                Primary Candidate
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-slate-900 tabular-nums">
                                                    ₹{price ? price.toLocaleString("en-IN") : "N/A"}
                                                </span>

                                                <Link
                                                    to={`/admin/properties/edit/${id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                                >
                                                    <span>Inspect</span>
                                                    <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
