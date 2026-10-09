import React from "react";
import { Building2, RotateCcw } from "lucide-react";

export default function EmptyState({
    title = "No properties found.",
    description = "Try changing your search or filters.",
    onClearFilters
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
                <Building2 size={32} />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500 max-w-md">
                {description}
            </p>

            {onClearFilters && (
                <button
                    onClick={onClearFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                    <RotateCcw size={14} />
                    <span>Clear Filters</span>
                </button>
            )}
        </div>
    );
}
