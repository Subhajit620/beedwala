import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading properties..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-3" />
            <p className="text-sm font-medium text-slate-500">{text}</p>
        </div>
    );
}

export function PropertyCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="h-56 w-full skeleton-box"></div>
            <div className="p-5 space-y-3">
                <div className="h-4 w-1/3 skeleton-box rounded"></div>
                <div className="h-6 w-5/6 skeleton-box rounded"></div>
                <div className="h-6 w-1/2 skeleton-box rounded mt-2"></div>
                <div className="h-4 w-2/3 skeleton-box rounded"></div>
                <div className="h-10 w-full skeleton-box rounded-xl mt-4"></div>
            </div>
        </div>
    );
}

export function PropertyGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
            ))}
        </div>
    );
}

export default function Loading() {
    return <LoadingSpinner />;
}
