import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({
    initialValue = "",
    onSearch,
    placeholder = "Search by property title, ID, bank, city, or state...",
    className = ""
}) {
    const [query, setQuery] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex items-center rounded-2xl bg-white p-2 shadow-md border border-slate-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/15 transition ${className}`}
        >
            <div className="flex flex-1 items-center gap-3 px-3">
                <Search size={20} className="text-slate-400 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            if (onSearch) onSearch("");
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1"
                    >
                        ✕
                    </button>
                )}
            </div>

            <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition shrink-0 cursor-pointer"
            >
                Search
            </button>
        </form>
    );
}
