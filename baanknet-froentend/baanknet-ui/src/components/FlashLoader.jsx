import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, ArrowRight } from "lucide-react";

/**
 * BIDWALLAH — Smooth, Responsive, Professional Hammer Hit Animation
 * 
 * Sequence (3.0s total):
 * - 0.0 – 0.8s: Hammer raised with subtle anticipation movement (0.5s–0.8s)
 * - 0.8 – 1.3s: Natural swinging arc downward, accurate flush impact at 0.98s,
 *               micro-rebound (~3.5px) and solid settle by 1.18s
 * - 1.3 – 1.8s: Controlled rest on block, natural slight lift finish
 * - 1.8 – 3.0s: Smooth, premium logo reveal of BIDWALLAH + "BID SMART. WIN BIG."
 * 
 * Audio:
 * - Subtle aerodynamic whoosh right before strike (0.78s–0.98s)
 * - One crisp, deep wooden impact sound synchronized at 0.98s
 * 
 * Multi-device Responsive:
 * - Fully fluid on Mobile (<640px), Tablet (640–1024px), and Desktop (>1024px)
 * - Strict negative constraints: Zero particles, sparks, explosions, or camera shake
 */
export default function FlashLoader({ onComplete }) {
    // Phase only changes 3 times per run (0 = preparing, 1 = struck, 2 = ready),
    // so React re-renders ~3 times instead of 50x/sec. All motion is GPU-driven CSS.
    const [phase, setPhase] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [isMounted, setIsMounted] = useState(true);
    const [replayKey, setReplayKey] = useState(0);

    const audioCtxRef = useRef(null);
    const timersRef = useRef([]);
    // Refs keep the master timeline stable: toggling sound or a parent re-render
    // (new onComplete identity) must never restart / desync the sequence.
    const soundEnabledRef = useRef(soundEnabled);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
    useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

    // Audio Context Getter
    const getAudioContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // 1. Subtle aerodynamic whoosh before strike (0.78s)
    const playAirWhoosh = useCallback(() => {
        try {
            if (!soundEnabledRef.current) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;
            const bufferSize = Math.floor(ctx.sampleRate * 0.22); // 220ms
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(260, now);
            filter.frequency.exponentialRampToValueAtTime(700, now + 0.18);
            filter.Q.value = 3.2;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.005, now);
            gain.gain.linearRampToValueAtTime(0.045, now + 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
        } catch (e) {
            console.warn("Audio whoosh note:", e);
        }
    }, [getAudioContext]);

    // 2. Crisp, deep wooden impact hit (0.98s)
    const playWoodenImpact = useCallback(() => {
        try {
            if (!soundEnabledRef.current) return;
            const ctx = getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // Sharp hardwood contact tap transient
            const clickOsc = ctx.createOscillator();
            const clickGain = ctx.createGain();
            clickOsc.type = "sine";
            clickOsc.frequency.setValueAtTime(800, now);
            clickOsc.frequency.exponentialRampToValueAtTime(280, now + 0.02);
            clickGain.gain.setValueAtTime(0.45, now);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);
            clickOsc.connect(clickGain);
            clickGain.connect(ctx.destination);
            clickOsc.start(now);
            clickOsc.stop(now + 0.026);

            // Dense mahogany sounding block resonance impulse
            const bufferSize = Math.floor(ctx.sampleRate * 0.075);
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const bpFilter = ctx.createBiquadFilter();
            bpFilter.type = "bandpass";
            bpFilter.frequency.setValueAtTime(450, now);
            bpFilter.Q.setValueAtTime(5.0, now);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.55, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.072);

            noise.connect(bpFilter);
            bpFilter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);

            // Low-end solid body thump
            const bodyOsc = ctx.createOscillator();
            const bodyGain = ctx.createGain();
            bodyOsc.type = "triangle";
            bodyOsc.frequency.setValueAtTime(160, now);
            bodyOsc.frequency.exponentialRampToValueAtTime(50, now + 0.07);
            bodyGain.gain.setValueAtTime(0.38, now);
            bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.088);

            bodyOsc.connect(bodyGain);
            bodyGain.connect(ctx.destination);
            bodyOsc.start(now);
            bodyOsc.stop(now + 0.092);
        } catch (e) {
            console.warn("Audio impact note:", e);
        }
    }, [getAudioContext]);

    const clearTimers = () => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    };

    const finish = useCallback((delay) => {
        setIsExiting(true);
        timersRef.current.push(
            setTimeout(() => {
                setIsMounted(false);
                if (onCompleteRef.current) onCompleteRef.current();
            }, delay)
        );
    }, []);

    // Master 3.0s timeline — a handful of one-shot timers aligned with the CSS keyframes.
    // Visual motion is entirely CSS (compositor thread), so it stays 60fps even if JS is busy.
    useEffect(() => {
        const at = (ms, fn) => timersRef.current.push(setTimeout(fn, ms));

        at(780, playAirWhoosh);                         // whoosh right before strike
        at(980, () => { playWoodenImpact(); setPhase(1); }); // impact frame
        at(1800, () => setPhase(2));                    // logo reveal
        at(3000, () => finish(500));                    // graceful exit

        return clearTimers;
    }, [playAirWhoosh, playWoodenImpact, finish, replayKey]);

    if (!isMounted) return null;

    const handleSkip = () => {
        clearTimers();
        finish(350);
    };

    const handleReplay = (e) => {
        e.stopPropagation();
        clearTimers();
        setIsExiting(false);
        setPhase(0);
        setReplayKey((k) => k + 1); // remounts the stage → every CSS animation restarts in sync
    };

    return (
        <div
            key={replayKey}
            className={`flash-root fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#060607] text-white select-none overflow-hidden font-sans p-3 sm:p-6 md:p-8 ${
                isExiting ? "is-exiting pointer-events-none" : "pointer-events-auto"
            }`}
        >
            {/*
              Single CSS timeline (3.0s). Every layer — gavel, shadow, ripple, scene,
              logo and progress bar — reads from the same clock, so they stay frame-synced.
              Only transform / opacity / filter are animated (GPU-composited, no layout).
            */}
            <style>{`
                /* ---------- Easing tokens ---------- */
                .flash-root {
                    --ease-std:    cubic-bezier(0.65, 0, 0.35, 1);    /* smooth in-out      */
                    --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);     /* expo-out (reveals) */
                    --ease-strike: cubic-bezier(0.55, 0, 0.95, 0.5);  /* gravity / accelerating */
                    --ease-pop:    cubic-bezier(0.25, 0.9, 0.4, 1);   /* rebound decel      */
                    --ease-drop:   cubic-bezier(0.5, 0, 0.85, 0.4);   /* settle accel       */
                    opacity: 1;
                    transition: opacity 0.5s var(--ease-std), transform 0.5s var(--ease-std);
                }
                .flash-root.is-exiting {
                    opacity: 0;
                    transform: scale(1.015);
                }

                /*
                 * Gavel swing — pure rotation about the grip (wrist pivot 450,247),
                 * so the head travels on a true arc and lands flush on the block.
                 * Positive angles lift the head. Each segment has its own easing.
                 */
                @keyframes natural-hammer-swing {
                    /* 0.00–0.50s: raised, with a barely-perceptible "breath" */
                    0%    { transform: rotate(25deg);   animation-timing-function: var(--ease-std); }
                    16.7% { transform: rotate(26deg);   animation-timing-function: var(--ease-std); }
                    /* 0.50–0.80s: anticipation — drawn back a touch further */
                    26.7% { transform: rotate(31deg);   animation-timing-function: var(--ease-strike); }
                    /* 0.80–0.98s: accelerating arc → flush impact at 0.98s */
                    32.7% { transform: rotate(0deg);    animation-timing-function: var(--ease-pop); }
                    /* 0.98–1.06s: micro-rebound (~4px at the face) */
                    35.3% { transform: rotate(1.5deg);  animation-timing-function: var(--ease-drop); }
                    /* 1.06–1.16s: settles firmly */
                    38.7% { transform: rotate(0deg);    animation-timing-function: linear; }
                    /* 1.16–1.40s: controlled rest */
                    46.7% { transform: rotate(0deg);    animation-timing-function: var(--ease-std); }
                    /* 1.40–1.80s: auctioneer lifts slightly to finish */
                    60%   { transform: rotate(7deg);    animation-timing-function: linear; }
                    100%  { transform: rotate(7deg); }
                }

                /* Contact shadow — keyframes and easings mirror the swing exactly */
                @keyframes contact-shadow-arc {
                    0%    { opacity: 0.20; transform: scale(0.84); animation-timing-function: var(--ease-std); }
                    16.7% { opacity: 0.20; transform: scale(0.84); animation-timing-function: var(--ease-std); }
                    26.7% { opacity: 0.16; transform: scale(0.80); animation-timing-function: var(--ease-strike); }
                    32.7% { opacity: 0.92; transform: scale(1);    animation-timing-function: var(--ease-pop); }
                    35.3% { opacity: 0.70; transform: scale(0.96); animation-timing-function: var(--ease-drop); }
                    38.7% { opacity: 0.92; transform: scale(1);    animation-timing-function: linear; }
                    46.7% { opacity: 0.92; transform: scale(1);    animation-timing-function: var(--ease-std); }
                    60%   { opacity: 0.45; transform: scale(0.88); animation-timing-function: linear; }
                    100%  { opacity: 0.45; transform: scale(0.88); }
                }

                /* Soft brass ripple across the inlay on impact (no particles/sparks) */
                @keyframes impact-ripple {
                    0%, 32.6% { opacity: 0;    transform: scale(0.55); }
                    32.7%     { opacity: 0.75; transform: scale(0.55); animation-timing-function: var(--ease-out); }
                    48%       { opacity: 0;    transform: scale(1.9); }
                    100%      { opacity: 0;    transform: scale(1.9); }
                }

                /* Whole scene: gentle entrance, then recedes as the logo takes over */
                @keyframes scene-life {
                    0%    { opacity: 0; transform: translateY(10px) scale(0.97); filter: blur(4px); animation-timing-function: var(--ease-out); }
                    12%   { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); }
                    58%   { opacity: 1; transform: translateY(0) scale(1);       filter: blur(0); animation-timing-function: var(--ease-std); }
                    78%   { opacity: 0; transform: translateY(-6px) scale(0.94); filter: blur(6px); }
                    100%  { opacity: 0; transform: translateY(-6px) scale(0.94); filter: blur(6px); }
                }

                /* Logo: staggered blur-to-sharp reveal starting at 1.8s */
                @keyframes logo-rise {
                    from { opacity: 0; transform: translateY(12px) scale(0.985); filter: blur(10px); }
                    to   { opacity: 1; transform: translateY(0) scale(1);        filter: blur(0); }
                }
                @keyframes tracking-settle {
                    from { letter-spacing: 0.32em; }
                    to   { letter-spacing: 0.1em; }
                }

                @keyframes progress-fill {
                    from { transform: scaleX(0); }
                    to   { transform: scaleX(1); }
                }

                .natural-hammer-motion {
                    transform-box: view-box;
                    transform-origin: 450px 247px;
                    animation: natural-hammer-swing 3s both;
                    will-change: transform;
                }
                .hammer-shadow-motion {
                    transform-box: view-box;
                    transform-origin: 300px 280px;
                    animation: contact-shadow-arc 3s both;
                    will-change: transform, opacity;
                }
                .impact-ripple {
                    transform-box: view-box;
                    transform-origin: 300px 280px;
                    animation: impact-ripple 3s both;
                    will-change: transform, opacity;
                }
                .scene-life {
                    animation: scene-life 3s both;
                    will-change: transform, opacity, filter;
                }
                .logo-item {
                    opacity: 0;
                    animation: logo-rise 0.9s var(--ease-out) both;
                    will-change: transform, opacity, filter;
                }
                .logo-item-1 { animation-delay: 1.80s; }
                .logo-item-2 { animation-delay: 1.92s; }
                .logo-item-2 h1 { animation: tracking-settle 1.1s var(--ease-out) 1.92s both; }
                .logo-item-3 { animation-delay: 2.08s; }
                .progress-fill {
                    transform-origin: left center;
                    animation: progress-fill 3s linear both;
                    will-change: transform;
                }
                .status-text { animation: logo-rise 0.4s var(--ease-out) both; }

                /* Accessibility: respect reduced-motion — show final composition, no swing */
                @media (prefers-reduced-motion: reduce) {
                    .natural-hammer-motion, .hammer-shadow-motion, .impact-ripple,
                    .scene-life, .logo-item, .logo-item-2 h1, .status-text {
                        animation-duration: 0.01s !important;
                        animation-delay: 0s !important;
                    }
                    .scene-life { animation: none; opacity: 0; }
                }
            `}</style>

            {/* 1. Top Header Controls: Sound Toggle, Replay, Skip (Responsive layout) */}
            <div className="w-full max-w-5xl flex items-center justify-between z-30 px-1">
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] sm:text-xs font-mono tracking-widest text-zinc-400 uppercase font-medium">
                        BIDWALLAH VERIFICATION
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <button
                        type="button"
                        onClick={() => setSoundEnabled((prev) => !prev)}
                        className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-lg border border-white/[0.08] transition cursor-pointer"
                        title={soundEnabled ? "Mute audio" : "Enable sound"}
                    >
                        {soundEnabled ? (
                            <>
                                <Volume2 size={13} className="text-amber-400" />
                                <span className="hidden xs:inline">Sound</span>
                            </>
                        ) : (
                            <>
                                <VolumeX size={13} className="text-zinc-500" />
                                <span className="hidden xs:inline text-zinc-500">Muted</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleReplay}
                        className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1.5 rounded-lg border border-white/[0.08] transition cursor-pointer"
                        title="Replay sequence"
                    >
                        <RotateCcw size={12} />
                        <span className="hidden sm:inline">Replay</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 hover:text-white bg-white/[0.08] hover:bg-white/[0.15] px-3 py-1.5 rounded-lg border border-white/[0.12] transition cursor-pointer"
                    >
                        <span>Enter</span>
                        <ArrowRight size={12} />
                    </button>
                </div>
            </div>

            {/* 2. Main Centered Stage (Responsive container adapting to Mobile, Tablet, Desktop) */}
            <div className="relative w-full max-w-xl sm:max-w-2xl aspect-[4/3] sm:aspect-[16/10] my-auto flex items-center justify-center z-20">
                {/* Gavel Scene — enters softly, recedes with blur as the logo arrives (CSS-timed) */}
                <div className="scene-life absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                        viewBox="0 0 600 460"
                        className="w-full h-full max-h-[75vh] overflow-visible select-none"
                    >
                        <defs>
                            {/* Realistic Hardwood Grain Gradient */}
                            <linearGradient id="hardwood-shader" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f2615" />
                                <stop offset="25%" stopColor="#3c1d10" />
                                <stop offset="65%" stopColor="#281109" />
                                <stop offset="100%" stopColor="#150804" />
                            </linearGradient>

                            {/* Sounding Block Top Surface Wood Texture */}
                            <radialGradient id="block-surface-wood" cx="48%" cy="45%" r="55%">
                                <stop offset="0%" stopColor="#482214" />
                                <stop offset="40%" stopColor="#33170d" />
                                <stop offset="85%" stopColor="#1f0c06" />
                                <stop offset="100%" stopColor="#130703" />
                            </radialGradient>

                            {/* Polished Satin Brass Inlays */}
                            <linearGradient id="brass-accent" x1="0%" y1="0%" x2="100%" y2="50%">
                                <stop offset="0%" stopColor="#facc15" />
                                <stop offset="35%" stopColor="#ca8a04" />
                                <stop offset="70%" stopColor="#854d0e" />
                                <stop offset="90%" stopColor="#eab308" />
                                <stop offset="100%" stopColor="#713f12" />
                            </linearGradient>

                            {/* Gavel turned-wood & brass shaders (cylindrical lighting) */}
                            <linearGradient id="head-wood" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#2a1209" />
                                <stop offset="22%" stopColor="#5a2c17" />
                                <stop offset="45%" stopColor="#3e1d0f" />
                                <stop offset="100%" stopColor="#140703" />
                            </linearGradient>

                            <linearGradient id="handle-wood" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#5a2c17" />
                                <stop offset="40%" stopColor="#3e1d0f" />
                                <stop offset="100%" stopColor="#140703" />
                            </linearGradient>

                            <linearGradient id="brass-vertical" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fde68a" />
                                <stop offset="45%" stopColor="#ca8a04" />
                                <stop offset="100%" stopColor="#713f12" />
                            </linearGradient>

                            {/* Soft Floor Shadow */}
                            <radialGradient id="floor-ambient-shadow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                                <stop offset="55%" stopColor="#000000" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                            </radialGradient>

                            {/* Precise Dynamic Contact Shadow under Gavel Head */}
                            <radialGradient id="strike-contact-shadow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
                                <stop offset="50%" stopColor="#000000" stopOpacity="0.45" />
                                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Ground Shadow on Table Plane */}
                        <ellipse
                            cx="300"
                            cy="352"
                            rx="155"
                            ry="30"
                            fill="url(#floor-ambient-shadow)"
                        />

                        {/* --- Auction Sounding Block --- */}
                        <g id="sounding-block-group">
                            {/* Lower Base Pedestal Depth */}
                            <path
                                d="M 182,312 C 182,332 418,332 418,312 L 418,326 C 418,346 182,346 182,326 Z"
                                fill="#120603"
                            />
                            {/* Lower Tier Rim */}
                            <ellipse cx="300" cy="312" rx="118" ry="23" fill="#220e06" stroke="#38170b" strokeWidth="1" />

                            {/* Upper Tier Cylinder Depth */}
                            <path
                                d="M 198,280 C 198,298 402,298 402,280 L 402,296 C 402,314 198,314 198,296 Z"
                                fill="#1b0a05"
                            />
                            {/* Upper Tier Brass Inlay Accent */}
                            <path
                                d="M 198,280 C 198,298 402,298 402,280"
                                fill="none"
                                stroke="url(#brass-accent)"
                                strokeWidth="1.2"
                                opacity="0.85"
                            />

                            {/* Polished Top Striking Surface */}
                            <ellipse
                                cx="300"
                                cy="280"
                                rx="102"
                                ry="20.5"
                                fill="url(#block-surface-wood)"
                                stroke="#3d1a0d"
                                strokeWidth="1.2"
                            />

                            {/* Center Inlaid Brass Ring on Surface */}
                            <ellipse
                                cx="300"
                                cy="280"
                                rx="50"
                                ry="10"
                                fill="none"
                                stroke="url(#brass-accent)"
                                strokeWidth="1.4"
                                opacity="0.85"
                            />

                            {/* Center Target Inlay */}
                            <ellipse
                                cx="300"
                                cy="280"
                                rx="42"
                                ry="8.4"
                                fill="#1b0904"
                                opacity="0.55"
                            />

                            {/* Synchronized Dynamic Contact Shadow directly under Gavel Face */}
                            <ellipse
                                cx="300"
                                cy="280"
                                rx="28"
                                ry="6"
                                fill="url(#strike-contact-shadow)"
                                className="hammer-shadow-motion"
                            />

                            {/* Soft brass ripple across the inlay at the impact frame */}
                            <ellipse
                                cx="300"
                                cy="280"
                                rx="46"
                                ry="9.2"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="1.2"
                                className="impact-ripple"
                            />
                        </g>

                        {/*
                          --- Authentic Auction Gavel ---
                          Structure (rest pose, side view):
                            • Head: vertical turned barrel centred on x=300, top face y=216,
                              striking face y=280 (flush with the block surface).
                            • Handle: mounted perpendicular through the MIDDLE of the head (y=247),
                              tapering out to a turned grip and brass-capped knob at x≈462.
                            • Pivot: the grip/wrist at (450, 247) — whole assembly swings on an arc.
                        */}
                        <g id="hammer-assembly" className="natural-hammer-motion">
                            {/* Handle (drawn first so its socket end sits behind the head) */}
                            <g id="handle">
                                {/* Tapered turned shaft: slim neck near head, thicker towards the grip */}
                                <path
                                    d="M 312,243.5
                                       L 338,244.6
                                       C 372,243.6 408,242 436,241
                                       L 436,253
                                       C 408,252 372,250.4 338,249.4
                                       L 312,250.5
                                       Z"
                                    fill="url(#handle-wood)"
                                    stroke="#120603"
                                    strokeWidth="0.8"
                                />

                                {/* Light sheen along the top of the shaft */}
                                <path
                                    d="M 324,245.4 C 372,244.6 408,243.2 434,242.4"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="0.9"
                                    strokeLinecap="round"
                                    opacity="0.22"
                                />

                                {/* Brass socket ferrule where handle enters the head */}
                                <rect x="320" y="242.6" width="6" height="8.8" rx="1" fill="url(#brass-vertical)" />

                                {/* Brass grip collar */}
                                <rect x="436" y="239.5" width="6" height="15" rx="1.2" fill="url(#brass-vertical)" />

                                {/* Turned grip knob */}
                                <ellipse cx="453" cy="247" rx="12" ry="8.2" fill="url(#handle-wood)" stroke="#120603" strokeWidth="0.8" />
                                <ellipse cx="451" cy="243.6" rx="6.5" ry="1.8" fill="#ffffff" opacity="0.14" />

                                {/* Brass end cap */}
                                <ellipse cx="465" cy="247" rx="2.6" ry="5" fill="url(#brass-vertical)" />
                            </g>

                            {/* Gavel Head (vertical turned barrel, striking face at bottom) */}
                            <g id="mallet-head">
                                {/* Main barrel body with a slight turned bulge */}
                                <path
                                    d="M 279,224
                                       C 276.5,238 276.5,258 279,272
                                       A 21,4.2 0 0 0 321,272
                                       C 323.5,258 323.5,238 321,224
                                       Z"
                                    fill="url(#head-wood)"
                                    stroke="#120603"
                                    strokeWidth="0.9"
                                />

                                {/* Decorative turned grooves */}
                                <path d="M 278,239 A 22,4.4 0 0 0 322,239" fill="none" stroke="#0e0502" strokeWidth="1.1" opacity="0.8" />
                                <path d="M 278,255 A 22,4.4 0 0 0 322,255" fill="none" stroke="#0e0502" strokeWidth="1.1" opacity="0.8" />

                                {/* Top cap */}
                                <path
                                    d="M 275,216 L 275,224 A 25,5 0 0 0 325,224 L 325,216 Z"
                                    fill="url(#head-wood)"
                                    stroke="#120603"
                                    strokeWidth="0.9"
                                />
                                {/* Top brass band */}
                                <path
                                    d="M 275,222 L 275,225.5 A 25,5 0 0 0 325,225.5 L 325,222 A 25,5 0 0 1 275,222 Z"
                                    fill="url(#brass-accent)"
                                />
                                {/* Top face (visible from slightly above) */}
                                <ellipse cx="300" cy="216" rx="25" ry="5" fill="url(#block-surface-wood)" stroke="url(#brass-accent)" strokeWidth="0.8" />

                                {/* Bottom cap — its lower edge IS the striking face, flush at y=280 */}
                                <path
                                    d="M 275,272 L 275,280 A 25,5 0 0 0 325,280 L 325,272 A 25,5 0 0 1 275,272 Z"
                                    fill="url(#head-wood)"
                                    stroke="#120603"
                                    strokeWidth="0.9"
                                />
                                {/* Bottom brass band */}
                                <path
                                    d="M 275,270.5 L 275,274 A 25,5 0 0 0 325,274 L 325,270.5 A 25,5 0 0 1 275,270.5 Z"
                                    fill="url(#brass-accent)"
                                />

                                {/* Vertical specular highlight for a rounded, turned look */}
                                <rect x="285" y="226" width="3" height="44" rx="1.5" fill="#ffffff" opacity="0.16" />
                                <rect x="282.5" y="217" width="2" height="62" rx="1" fill="#ffffff" opacity="0.07" />
                            </g>
                        </g>
                    </svg>
                </div>

                {/* Logo Reveal — staggered blur-to-sharp, starts at 1.8s on the same CSS clock */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-30 pointer-events-none px-4">
                    <div className="space-y-2.5 sm:space-y-3.5">
                        <span className="logo-item logo-item-1 text-[10px] sm:text-xs font-mono font-medium tracking-[0.3em] uppercase text-amber-500/90 block">
                            INSTITUTIONAL AUCTION PLATFORM
                        </span>

                        {/* Brand Heading */}
                        <div className="logo-item logo-item-2">
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wider uppercase text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.85)]">
                                BID<span className="text-amber-500">WALLAH</span>
                            </h1>
                        </div>

                        {/* Tagline */}
                        <p className="logo-item logo-item-3 text-xs sm:text-sm md:text-base font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                            BID SMART. WIN BIG.
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Minimalist Status / Progress */}
            <div className="w-full max-w-xs z-30 space-y-2 text-center pb-1">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                        className="progress-fill h-full w-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #d97706, #fbbf24)" }}
                    ></div>
                </div>
                {/* key={phase} re-triggers a subtle fade each time the status changes */}
                <p key={phase} className="status-text text-[10px] font-mono text-zinc-400 tracking-wider">
                    {phase === 0
                        ? "PREPARING VERIFICATION"
                        : phase === 1
                        ? "HAMMER STRUCK • VERIFIED"
                        : "BIDWALLAH READY"}
                </p>
            </div>
        </div>
    );
}
