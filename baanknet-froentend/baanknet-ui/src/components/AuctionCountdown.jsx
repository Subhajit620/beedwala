import React, { useState, useEffect, useMemo } from "react";
import {
    Calendar,
    Clock,
    Download,
    ExternalLink,
    AlertTriangle,
    ShieldAlert
} from "lucide-react";
import {
    getAuctionSchedule,
    generateGoogleCalendarUrl,
    downloadIcsCalendarFile
} from "../utils/auctionScheduler";
import { formatINR } from "../utils/formatters";

const PASSED = { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };

// Remaining time until the auction (pure helper — "now" is passed in)
function computeTimeLeft(schedule, now) {
    if (!schedule) return PASSED;
    const diff = schedule.auctionDate.getTime() - now;
    if (diff <= 0) return PASSED;
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isPassed: false
    };
}

export default function AuctionCountdown({ property, variant = "full" }) {
    const schedule = useMemo(() => getAuctionSchedule(property), [property]);

    // Live ticker calculation
    const [timeLeft, setTimeLeft] = useState(() => computeTimeLeft(schedule, Date.now()));

    // Tick every second for the current schedule. The first tick runs immediately, so switching
    // to another property never shows the previous property's countdown. Stops once the time has passed.
    useEffect(() => {
        if (!schedule) return;
        let interval;
        const tick = () => {
            const next = computeTimeLeft(schedule, Date.now());
            setTimeLeft(next);
            if (next.isPassed) clearInterval(interval);
        };
        const first = setTimeout(tick, 0);
        interval = setInterval(tick, 1000);

        return () => {
            clearTimeout(first);
            clearInterval(interval);
        };
    }, [schedule]);

    if (!property || !schedule) return null;

    const googleCalUrl = generateGoogleCalendarUrl(property, schedule);
    const isClosingSoon = schedule.status === "closing_soon";

    // Compact Badge View (Used on cards or sticky sidebars)
    if (variant === "compact") {
        return (
            <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                        <Clock size={12} className="text-amber-600 animate-pulse" />
                        <span>E-Auction Bidding</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                        {schedule.auctionDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="rounded-xl bg-slate-950 text-white p-1.5">
                        <div className="text-sm font-black text-amber-400">{timeLeft.days}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Days</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 text-white p-1.5">
                        <div className="text-sm font-black text-amber-400">{timeLeft.hours}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Hrs</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 text-white p-1.5">
                        <div className="text-sm font-black text-amber-400">{timeLeft.minutes}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Min</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 text-white p-1.5">
                        <div className="text-sm font-black text-amber-400">{timeLeft.seconds}</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Sec</div>
                    </div>
                </div>
            </div>
        );
    }

    // Full Detailed Auction Timeline Component
    return (
        <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            {/* Top Amber Status Bar */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-amber-500/15 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-[11px] font-black text-amber-300">
                                <Clock size={12} className="text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
                                <span>Statutory Auction Timeline</span>
                            </span>
                            {isClosingSoon && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/30 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-black text-rose-300">
                                    <AlertTriangle size={11} />
                                    <span>EMD Closing Soon</span>
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                            Live E-Auction Countdown
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Authorised E-Bidding window scheduled under SARFAESI Act, 2002.
                        </p>
                    </div>

                    {/* Digital Countdown Timer Boxes */}
                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 min-w-[54px] sm:min-w-[62px]">
                            <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                                {timeLeft.days}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-1">
                                Days
                            </span>
                        </div>
                        <span className="text-amber-400 font-black text-lg">:</span>
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 min-w-[54px] sm:min-w-[62px]">
                            <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                                {String(timeLeft.hours).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-1">
                                Hours
                            </span>
                        </div>
                        <span className="text-amber-400 font-black text-lg">:</span>
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 min-w-[54px] sm:min-w-[62px]">
                            <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                                {String(timeLeft.minutes).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-1">
                                Mins
                            </span>
                        </div>
                        <span className="text-amber-400 font-black text-lg">:</span>
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-3 py-2 min-w-[54px] sm:min-w-[62px]">
                            <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none">
                                {String(timeLeft.seconds).padStart(2, "0")}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-300 font-bold mt-1">
                                Secs
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statutory Key Dates Grid */}
            <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        10% EMD Amount Required
                    </span>
                    <span className="text-lg sm:text-xl font-black text-slate-900 block">
                        {formatINR(schedule.emdAmount)}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                        Refundable for non-winning bidders
                    </span>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        EMD Submission Deadline
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        {schedule.emdSubmissionDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        })}
                    </span>
                    <span className="text-[10px] text-rose-600 font-bold mt-0.5 block">
                        Strictly before 5:00 PM IST
                    </span>
                </div>

                <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Live E-Auction Date
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block">
                        {schedule.auctionDate.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        })}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                        11:00 AM – 1:00 PM IST
                    </span>
                </div>
            </div>

            {/* Stepper Roadmap (Visual Timeline) */}
            <div className="p-5 sm:p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-500" />
                    <span>Statutory Bidding Steps & Milestone Dates</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                    {/* Step 1 */}
                    <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[11px] font-black">
                                1
                            </span>
                            <span className="text-xs font-bold text-slate-800">Notice Issued</span>
                        </div>
                        <span className="text-[11px] text-slate-600">
                            {property.createdOn
                                ? new Date(property.createdOn).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric"
                                  })
                                : "Gazette Published"}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Official bank public notice</span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[11px] font-black">
                                2
                            </span>
                            <span className="text-xs font-bold text-slate-800">Physical Inspection</span>
                        </div>
                        <span className="text-[11px] text-slate-600">
                            {schedule.inspectionStartDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })}{" "}
                            –{" "}
                            {schedule.inspectionEndDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Asset site visit with bank officer</span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-amber-400 text-[11px] font-black">
                                3
                            </span>
                            <span className="text-xs font-bold text-slate-800">10% EMD Cutoff</span>
                        </div>
                        <span className="text-[11px] text-slate-600">
                            {schedule.emdSubmissionDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">DD / NEFT deposit submission</span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex flex-col p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-[11px] font-black">
                                4
                            </span>
                            <span className="text-xs font-bold text-slate-800">Live E-Auction</span>
                        </div>
                        <span className="text-[11px] text-slate-600">
                            {schedule.auctionDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short"
                            })}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">Authorized bidding portal</span>
                    </div>
                </div>

                {/* Calendar Export Action Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldAlert size={14} className="text-amber-600" />
                        <span>Never miss this auction — sync with your personal calendar</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Google Calendar Link */}
                        <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 px-3.5 py-2 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
                        >
                            <Calendar size={13} className="text-amber-600" />
                            <span>Add to Google Calendar</span>
                            <ExternalLink size={12} className="text-slate-400 ml-0.5" />
                        </a>

                        {/* Download iCal (.ics) */}
                        <button
                            type="button"
                            onClick={() => downloadIcsCalendarFile(property, schedule)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-900 px-3.5 py-2 text-xs font-black text-amber-400 transition cursor-pointer shadow-2xs"
                        >
                            <Download size={13} />
                            <span>Download iCal (.ics)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
