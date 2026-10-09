import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Toast() {
    const { toasts, removeToast } = useApp();

    if (!toasts || toasts.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />;
            case "warning":
                return <AlertCircle size={18} className="text-amber-500 shrink-0" />;
            default:
                return <Info size={18} className="text-amber-500 shrink-0" />;
        }
    };

    const getBadgeClass = (type) => {
        switch (type) {
            case "success":
                return "border-emerald-200/80 bg-white/95 text-slate-800 shadow-emerald-500/10";
            case "warning":
                return "border-amber-200/80 bg-white/95 text-slate-800 shadow-amber-500/10";
            default:
                return "border-amber-200/80 bg-white/95 text-slate-800 shadow-amber-500/10";
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-up ${getBadgeClass(
                        toast.type
                    )}`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        {getIcon(toast.type)}
                        <span className="text-xs font-semibold truncate">{toast.message}</span>
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
