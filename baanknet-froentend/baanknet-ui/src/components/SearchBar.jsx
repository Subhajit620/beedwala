import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    X,
    Clock,
    Building2,
    Landmark,
    MapPin,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { fetchPropertySuggestions } from "../services/propertyService";
import { formatINR } from "../utils/formatters";

const RECENT_SEARCHES_KEY = "bw_recent_searches";

export default function SearchBar({
    initialValue = "",
    onSearch,
    placeholder = "Search by property title, ID, bank, locality, or category...",
    className = "",
    autoFocus = false
}) {
    const navigate = useNavigate();
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    // Load recent searches from localStorage once, on first render
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            return saved ? JSON.parse(saved).slice(0, 5) : [];
        } catch {
            return [];
        }
    });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Sync external initialValue if it changes (adjusting state during render avoids an extra effect pass)
    const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
    if (initialValue !== prevInitialValue) {
        setPrevInitialValue(initialValue);
        setQuery(initialValue);
    }

    const saveRecentSearch = (term) => {
        if (!term || term.trim().length < 2) return;
        try {
            const clean = term.trim();
            const filtered = recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
            const updated = [clean, ...filtered].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
            // Ignore storage errors
        }
    };

    const clearRecentSearches = (e) => {
        e.stopPropagation();
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch {
            // Ignore
        }
    };

    // Debounced suggestion fetch
    const fetchSuggestions = useCallback((text) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!text || text.trim().length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceTimer.current = setTimeout(async () => {
            try {
                const res = await fetchPropertySuggestions(text, 8);
                if (res?.success && Array.isArray(res.suggestions)) {
                    setSuggestions(res.suggestions);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.warn("Suggestions fetch failed:", err.message);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 280);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setActiveIndex(-1);
        setIsOpen(true);
        fetchSuggestions(val);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setActiveIndex(-1);
        if (onSearch) onSearch("");
        inputRef.current?.focus();
    };

    const executeSearch = (searchTerm) => {
        const term = searchTerm.trim();
        saveRecentSearch(term);
        setIsOpen(false);
        if (onSearch) {
            onSearch(term);
        } else {
            navigate(`/properties?q=${encodeURIComponent(term)}`);
        }
    };

    const handleSuggestionSelect = (item) => {
        setIsOpen(false);

        if (item.type === "property") {
            saveRecentSearch(item.text);
            navigate(`/properties/${item.id}`);
            return;
        }

        if (item.type === "subType") {
            navigate(`/properties?subType=${encodeURIComponent(item.text)}`);
            return;
        }

        if (item.type === "bank") {
            navigate(`/properties?bank=${encodeURIComponent(item.text)}`);
            return;
        }

        if (item.type === "locality") {
            navigate(`/properties?locality=${encodeURIComponent(item.text)}`);
            return;
        }

        setQuery(item.text);
        executeSearch(item.text);
    };

    const handleKeyDown = (e) => {
        const totalItems = suggestions.length;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }
            setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) return;
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (isOpen && activeIndex >= 0 && activeIndex < totalItems) {
                handleSuggestionSelect(suggestions[activeIndex]);
            } else {
                executeSearch(query);
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showRecent = isOpen && query.trim().length < 2 && recentSearches.length > 0;
    const showSuggestions = isOpen && query.trim().length >= 2;

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Search Input Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    executeSearch(query);
                }}
                className="relative flex items-center rounded-2xl bg-white p-1.5 sm:p-2 shadow-lg border border-slate-200/90 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
            >
                <div className="flex flex-1 items-center gap-2.5 sm:gap-3 px-3">
                    <Search size={19} className="text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        autoComplete="off"
                        className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
                    />

                    {loading && (
                        <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />
                    )}

                    {query && !loading && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                            title="Clear search"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs transition shrink-0 cursor-pointer active:scale-95"
                >
                    Search
                </button>
            </form>

            {/* Suggestions & Recent Searches Dropdown */}
            {(showRecent || showSuggestions) && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-scale-up">
                    {/* Recent Searches Header & List */}
                    {showRecent && (
                        <div className="p-3">
                            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Clock size={13} className="text-amber-500" />
                                    Recent Searches
                                </span>
                                <button
                                    type="button"
                                    onClick={clearRecentSearches}
                                    className="text-[10px] text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                >
                                    Clear History
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((term, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => {
                                            setQuery(term);
                                            executeSearch(term);
                                        }}
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock size={13} className="text-slate-400" />
                                            <span>{term}</span>
                                        </div>
                                        <ArrowUpRight size={13} className="text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Server-Backed Suggestions */}
                    {showSuggestions && (
                        <div className="p-2 max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                            {suggestions.length === 0 && !loading && (
                                <div className="py-6 text-center text-xs text-slate-400">
                                    No direct suggestions found for <strong className="text-slate-700">"{query}"</strong>. Press Enter to search all 1,500+ notices.
                                </div>
                            )}

                            {suggestions.map((item, idx) => {
                                const isSelected = idx === activeIndex;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSuggestionSelect(item)}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition cursor-pointer rounded-xl ${
                                            isSelected
                                                ? "bg-amber-500 text-slate-950 font-bold"
                                                : "hover:bg-slate-50 text-slate-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                                                    isSelected
                                                        ? "bg-slate-950 text-amber-400 border-slate-900"
                                                        : "bg-slate-100 text-slate-500 border-slate-200"
                                                }`}
                                            >
                                                {item.type === "bank" && <Landmark size={15} />}
                                                {item.type === "subType" && <Building2 size={15} />}
                                                {item.type === "locality" && <MapPin size={15} />}
                                                {item.type === "property" && <Building2 size={15} />}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-xs font-semibold">
                                                        {item.text}
                                                    </span>
                                                    <span
                                                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                                            isSelected
                                                                ? "bg-slate-900 text-amber-300"
                                                                : "bg-amber-100 text-amber-800"
                                                        }`}
                                                    >
                                                        {item.category}
                                                    </span>
                                                </div>

                                                {item.type === "property" && (
                                                    <div className="flex items-center gap-2 text-[11px] mt-0.5 opacity-80">
                                                        <span>{formatINR(item.price)}</span>
                                                        {item.bank && <span>• {item.bank}</span>}
                                                        {item.locality && <span>• {item.locality}</span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <ArrowUpRight
                                            size={14}
                                            className={`shrink-0 ${isSelected ? "text-slate-950" : "text-slate-400"}`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
