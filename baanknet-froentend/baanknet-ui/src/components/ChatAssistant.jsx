import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, Building2, MapPin, MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { fetchChatStatus, sendChatMessage } from "../services/chatService";

const STORAGE_KEY = "bw_chat_history_v1";
const MAX_STORED = 30;

const GENERAL_SUGGESTIONS = [
    "Flats in Kolkata under ₹50 lakh",
    "How do I buy a bank auction property?",
    "What is SARFAESI?",
    "Physical vs symbolic possession?",
    "Which banks have the most listings?",
    "Upcoming auctions this month"
];

const PROPERTY_SUGGESTIONS = [
    "Explain this property",
    "What are the EMD and auction dates?",
    "Is this a safe purchase?",
    "Show similar properties nearby"
];

const WELCOME = {
    role: "assistant",
    text:
        "Hi! I'm the **Bidwallah Assistant** 👋\n\nI can help you:\n- Find bank auction properties by city, budget, type or bank\n- Explain any property, its EMD and auction dates\n- Understand the auction process, SARFAESI and possession types\n\nWhat are you looking for today?"
};

// ---------- Tiny safe markdown renderer (bold + bullet / numbered lists) ----------
function renderInline(text, keyPrefix) {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
            <strong key={`${keyPrefix}-${i}`} className="font-bold text-slate-900">
                {part.slice(2, -2)}
            </strong>
        ) : (
            <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
        )
    );
}

function MessageText({ text }) {
    const blocks = [];
    let list = null;
    text.split("\n").forEach((raw) => {
        const line = raw.trimEnd();
        const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (bullet) {
            if (!list) {
                list = { ordered: /^\s*\d/.test(line), items: [] };
                blocks.push(list);
            }
            list.items.push(bullet[1]);
            return;
        }
        list = null;
        if (line.trim()) blocks.push({ p: line.replace(/^#+\s*/, "") });
        else blocks.push({ gap: true });
    });

    return (
        <div className="space-y-1.5">
            {blocks.map((b, i) => {
                if (b.items) {
                    const Tag = b.ordered ? "ol" : "ul";
                    return (
                        <Tag key={i} className={`${b.ordered ? "list-decimal" : "list-disc"} pl-4 space-y-1 marker:text-amber-500`}>
                            {b.items.map((it, j) => (
                                <li key={j}>{renderInline(it, `${i}-${j}`)}</li>
                            ))}
                        </Tag>
                    );
                }
                if (b.gap) return null;
                return <p key={i}>{renderInline(b.p, `p${i}`)}</p>;
            })}
        </div>
    );
}

function PropertyMiniCard({ p, onNavigate }) {
    return (
        <Link
            to={`/properties/${encodeURIComponent(p.id)}`}
            onClick={onNavigate}
            className="flex gap-2.5 rounded-xl border border-slate-200 bg-white p-2 hover:border-amber-400 hover:shadow-sm transition"
        >
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                {p.image ? (
                    <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                ) : (
                    <Building2 size={20} className="text-slate-400" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-slate-900">{p.title}</p>
                <p className="text-[12px] font-black text-emerald-700">{p.priceText}</p>
                <p className="flex items-center gap-1 truncate text-[10.5px] text-slate-500">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{[p.location, p.bank].filter(Boolean).join(" • ")}</span>
                </p>
            </div>
        </Link>
    );
}

/**
 * Floating AI assistant available on all public pages.
 * Knows live listings (via the backend tools) and the auction knowledge base.
 */
export default function ChatAssistant() {
    const location = useLocation();
    const propertyMatch = location.pathname.match(/^\/properties\/([^/]+)/);
    const currentPropertyId = propertyMatch ? decodeURIComponent(propertyMatch[1]) : undefined;

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
            return Array.isArray(saved) && saved.length ? saved : [WELCOME];
        } catch {
            return [WELCOME];
        }
    });
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(null); // null = unknown, { enabled }
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    // Persist conversation for the browser session (survives page navigation)
    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
        } catch {
            /* storage full / disabled — ignore */
        }
    }, [messages]);

    // Check whether the assistant is configured the first time it's opened
    useEffect(() => {
        if (!open || status) return;
        fetchChatStatus()
            .then((s) => setStatus({ enabled: Boolean(s.enabled) }))
            .catch(() => setStatus({ enabled: false, offline: true }));
    }, [open, status]);

    // Auto-scroll and focus
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, sending, open]);
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 150);
    }, [open]);

    // Esc closes the panel
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const send = useCallback(
        async (text) => {
            const message = (text ?? input).trim();
            if (!message || sending) return;

            const history = messages
                .filter((m) => m !== WELCOME && !m.error && m.text !== WELCOME.text)
                .map((m) => ({ role: m.role, text: m.text }));

            setMessages((prev) => [...prev, { role: "user", text: message }]);
            setInput("");
            setSending(true);
            try {
                const res = await sendChatMessage(message, history, currentPropertyId);
                setMessages((prev) => [...prev, { role: "assistant", text: res.reply, properties: res.properties || [] }]);
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    (err?.code === "ECONNABORTED"
                        ? "That took too long. Please try again."
                        : "I couldn't reach the assistant. Please check your connection and try again.");
                setMessages((prev) => [...prev, { role: "assistant", text: msg, error: true }]);
            } finally {
                setSending(false);
            }
        },
        [input, sending, messages, currentPropertyId]
    );

    const resetChat = () => {
        setMessages([WELCOME]);
        setInput("");
    };

    const suggestions = currentPropertyId ? PROPERTY_SUGGESTIONS : GENERAL_SUGGESTIONS;
    const showSuggestions = messages.length <= 1 || (currentPropertyId && messages[messages.length - 1]?.role === "assistant" && messages.length <= 3);
    const disabled = status && !status.enabled;

    return (
        <>
            {/* Floating launcher (raised on property pages where a mobile action bar sits at the bottom) */}
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Open Bidwallah AI assistant"
                    className={`fixed right-4 sm:right-6 z-[45] group flex items-center gap-2 rounded-full bg-slate-950 pl-3.5 pr-4 py-3 text-amber-400 shadow-xl shadow-slate-900/30 ring-1 ring-amber-500/40 hover:bg-slate-900 hover:scale-[1.03] active:scale-95 transition ${
                        currentPropertyId ? "bottom-24 lg:bottom-6" : "bottom-5 sm:bottom-6"
                    }`}
                >
                    <span className="relative flex h-6 w-6 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/30" />
                        <Sparkles size={18} className="relative" />
                    </span>
                    <span className="text-xs font-bold hidden sm:inline">Ask AI Assistant</span>
                </button>
            )}

            {open && (
                <div
                    role="dialog"
                    aria-label="Bidwallah AI assistant"
                    className="fixed z-[60] inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(640px,calc(100vh-3rem))] sm:w-[400px] flex flex-col bg-slate-50 sm:rounded-3xl shadow-2xl shadow-slate-900/30 ring-1 ring-slate-200 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 text-white">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/40">
                            <Bot size={19} className="text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black leading-tight">
                                Bidwallah <span className="text-amber-400">Assistant</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
                                <span className={`h-1.5 w-1.5 rounded-full ${disabled ? "bg-rose-500" : "bg-emerald-400"}`} />
                                {disabled ? (status.offline ? "Offline" : "Not configured") : "AI • Live property data"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={resetChat}
                            title="New conversation"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <RotateCcw size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            title="Close"
                            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3" aria-live="polite">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[88%] space-y-2 ${m.role === "user" ? "items-end" : ""}`}>
                                    <div
                                        className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                                            m.role === "user"
                                                ? "bg-slate-950 text-white rounded-br-md whitespace-pre-wrap"
                                                : m.error
                                                ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200 rounded-bl-md"
                                                : "bg-white text-slate-700 ring-1 ring-slate-200 rounded-bl-md shadow-xs"
                                        }`}
                                    >
                                        {m.role === "user" ? m.text : <MessageText text={m.text} />}
                                    </div>
                                    {m.properties?.length > 0 && (
                                        <div className="space-y-1.5">
                                            {m.properties.map((p) => (
                                                <PropertyMiniCard key={p.id} p={p} onNavigate={() => window.innerWidth < 640 && setOpen(false)} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-slate-200">
                                    {[0, 150, 300].map((d) => (
                                        <span
                                            key={d}
                                            className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce"
                                            style={{ animationDelay: `${d}ms` }}
                                        />
                                    ))}
                                    <span className="ml-1 text-[11px] text-slate-400">Searching listings…</span>
                                </div>
                            </div>
                        )}

                        {disabled && (
                            <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900 ring-1 ring-amber-200">
                                {status.offline
                                    ? "The assistant server can't be reached right now. You can still browse properties."
                                    : "The AI assistant isn't configured yet (missing GEMINI_API_KEY on the server)."}
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && !sending && !disabled && (
                        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-2 [scrollbar-width:none]">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => send(s)}
                                    className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-slate-700 hover:bg-amber-50 hover:border-amber-400 transition cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Composer */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            send();
                        }}
                        className="border-t border-slate-200 bg-white p-3"
                    >
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                maxLength={1000}
                                disabled={disabled}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                placeholder={currentPropertyId ? "Ask about this property…" : "Ask about properties, auctions, banks…"}
                                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13px] outline-none focus:border-amber-500 focus:bg-white transition disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending || disabled}
                                aria-label="Send message"
                                className="h-[42px] w-[42px] shrink-0 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                <Send size={17} />
                            </button>
                        </div>
                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <MessageCircle size={10} />
                            AI answers may contain errors — always verify with the bank's official sale notice.
                        </p>
                    </form>
                </div>
            )}
        </>
    );
}
