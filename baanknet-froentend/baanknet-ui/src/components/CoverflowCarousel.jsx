import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Building2,
    Landmark,
    TrendingDown,
    Flame,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    Ruler,
    Calendar,
    Pause,
    Play
} from "lucide-react";

export const DEFAULT_COVERFLOW_PROPERTIES = [
    {
        id: "cf-1",
        title: "3 BHK Luxury Flat in Salt Lake",
        bank: "State Bank of India",
        price: "₹48,50,000",
        originalValuation: "₹72,00,000",
        discount: "32% Below Circle Rate",
        type: "Residential Flat",
        possession: "Physical Possession",
        location: "Salt Lake Sector V, Kolkata",
        area: "1,350 sq.ft",
        emdBidDate: "Auction: Nov 18, 2026",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
        badge: "HOT SARFAESI DEAL",
        badgeColor: "bg-amber-500 text-slate-950",
        bankLogoColor: "bg-blue-600 text-white",
        query: "Salt Lake"
    },
    {
        id: "cf-2",
        title: "2,400 sq.ft Commercial IT Office",
        bank: "Punjab National Bank",
        price: "₹85,50,000",
        originalValuation: "₹1,30,00,000",
        discount: "35% Below Valuation",
        type: "Commercial Office",
        possession: "Physical Possession",
        location: "Rajarhat IT Corridor, Kolkata",
        area: "2,400 sq.ft",
        emdBidDate: "Auction: Nov 22, 2026",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
        badge: "PRIME COMMERCIAL",
        badgeColor: "bg-blue-500 text-white",
        bankLogoColor: "bg-amber-600 text-white",
        query: "Office"
    },
    {
        id: "cf-3",
        title: "6,500 sq.ft Industrial Warehouse",
        bank: "Bank of Baroda",
        price: "₹1,45,00,000",
        originalValuation: "₹2,05,00,000",
        discount: "28% Below Market",
        type: "Industrial Unit",
        possession: "Physical Possession",
        location: "Howrah Industrial Belt",
        area: "6,500 sq.ft",
        emdBidDate: "Auction: Nov 25, 2026",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80",
        badge: "FACTORY / SHED",
        badgeColor: "bg-purple-600 text-white",
        bankLogoColor: "bg-orange-600 text-white",
        query: "Industrial"
    },
    {
        id: "cf-4",
        title: "4 BHK Premium Villa & Private Lawn",
        bank: "Canara Bank",
        price: "₹1,95,00,000",
        originalValuation: "₹2,80,00,000",
        discount: "30% Instant Equity",
        type: "Luxury Villa",
        possession: "Physical Possession",
        location: "EM Bypass Southern Corridor",
        area: "3,800 sq.ft",
        emdBidDate: "Auction: Dec 02, 2026",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
        badge: "ULTRA LUXURY",
        badgeColor: "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950",
        bankLogoColor: "bg-sky-600 text-white",
        query: "Villa"
    },
    {
        id: "cf-5",
        title: "3,200 sq.ft Freehold Land Plot",
        bank: "Indian Bank",
        price: "₹36,00,000",
        originalValuation: "₹60,00,000",
        discount: "40% Below Circle Rate",
        type: "Freehold Land",
        possession: "Clean Title Deed",
        location: "New Town Action Area III",
        area: "3,200 sq.ft",
        emdBidDate: "Auction: Dec 05, 2026",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80",
        badge: "HIGH GROWTH PLOT",
        badgeColor: "bg-emerald-600 text-white",
        bankLogoColor: "bg-indigo-600 text-white",
        query: "Land"
    },
    {
        id: "cf-6",
        title: "1,100 sq.ft Ground Floor Showroom",
        bank: "Union Bank of India",
        price: "₹62,00,000",
        originalValuation: "₹85,00,000",
        discount: "25% Below Market",
        type: "Retail Showroom",
        possession: "Symbolic Possession",
        location: "Park Street Extension, Kolkata",
        area: "1,100 sq.ft",
        emdBidDate: "Auction: Dec 08, 2026",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80",
        badge: "RETAIL FOOTFALL",
        badgeColor: "bg-rose-600 text-white",
        bankLogoColor: "bg-red-600 text-white",
        query: "Retail"
    }
];

export default function CoverflowCarousel({ items = DEFAULT_COVERFLOW_PROPERTIES, autoPlayInterval = 4200 }) {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isAutoPlayActive, setIsAutoPlayActive] = useState(true);

    const total = items.length;

    // Drag / Touch state with drag resistance tracking
    const [startX, setStartX] = useState(null);
    const [dragDistance, setDragDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const hasDraggedRef = useRef(false);
    const containerRef = useRef(null);

    const nextSlide = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const prevSlide = useCallback(() => {
        setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    }, [total]);

    // Auto-flow timer with hover pause
    useEffect(() => {
        if (!isAutoPlayActive || isHovered || isDragging) return;
        const timer = setInterval(() => {
            nextSlide();
        }, autoPlayInterval);
        return () => clearInterval(timer);
    }, [isAutoPlayActive, isHovered, isDragging, autoPlayInterval, nextSlide]);

    // Touch event handlers
    const handleTouchStart = (e) => {
        setStartX(e.touches[0].clientX);
        setDragDistance(0);
        setIsDragging(true);
        hasDraggedRef.current = false;
    };

    const handleTouchMove = (e) => {
        if (startX === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        setDragDistance(diff);
        if (Math.abs(diff) > 8) {
            hasDraggedRef.current = true;
        }
    };

    const handleTouchEnd = () => {
        if (dragDistance > 40) {
            prevSlide();
        } else if (dragDistance < -40) {
            nextSlide();
        }
        setStartX(null);
        setDragDistance(0);
        setIsDragging(false);
        setTimeout(() => {
            hasDraggedRef.current = false;
        }, 80);
    };

    // Mouse drag handlers
    const handleMouseDown = (e) => {
        setStartX(e.clientX);
        setDragDistance(0);
        setIsDragging(true);
        hasDraggedRef.current = false;
    };

    const handleMouseMove = (e) => {
        if (!isDragging || startX === null) return;
        const diff = e.clientX - startX;
        setDragDistance(diff);
        if (Math.abs(diff) > 8) {
            hasDraggedRef.current = true;
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            if (dragDistance > 40) {
                prevSlide();
            } else if (dragDistance < -40) {
                nextSlide();
            }
        }
        setStartX(null);
        setDragDistance(0);
        setIsDragging(false);
        setTimeout(() => {
            hasDraggedRef.current = false;
        }, 80);
    };

    // Keyboard navigation listener (Left / Right arrow keys)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowLeft") {
                prevSlide();
            } else if (e.key === "ArrowRight") {
                nextSlide();
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener("keydown", handleKeyDown);
            return () => container.removeEventListener("keydown", handleKeyDown);
        }
    }, [prevSlide, nextSlide]);

    const activeItem = items[activeIndex];

    // Normalized drag shift between -0.6 and +0.6 for responsive real-time follower motion
    const dragShift = isDragging ? Math.max(-0.6, Math.min(0.6, dragDistance / 240)) : 0;

    return (
        <div
            ref={containerRef}
            tabIndex={0}
            className="relative w-full select-none outline-none focus:ring-1 focus:ring-amber-400/50 rounded-3xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                handleMouseUp();
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {/* Top Atmospheric Ambient Glow Behind Carousel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] sm:w-[500px] h-[360px] sm:h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18)_0%,rgba(251,191,36,0.10)_40%,transparent_75%)] rounded-full blur-[80px] pointer-events-none -z-10" />

            {/* Dual-Layer Ground Contact & Ambient Floor Cast Shadow */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-5 bg-slate-950/20 blur-lg rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 w-64 sm:w-88 h-9 bg-gradient-to-r from-transparent via-amber-500/22 to-transparent blur-2xl rounded-full pointer-events-none z-0" />

            {/* 3D Coverflow Stage */}
            <div
                className="relative h-[410px] xs:h-[445px] sm:h-[490px] w-full flex items-center justify-center overflow-visible coverflow-stage"
                style={{
                    perspective: "1200px"
                }}
            >
                {/* Smooth Horizontal Stage Edge Fade Vignettes */}
                <div className="absolute inset-y-0 -left-1 w-8 sm:w-14 bg-gradient-to-r from-slate-50/80 via-slate-50/40 to-transparent pointer-events-none z-30" />
                <div className="absolute inset-y-0 -right-1 w-8 sm:w-14 bg-gradient-to-l from-slate-50/80 via-slate-50/40 to-transparent pointer-events-none z-30" />

                {items.map((item, index) => {
                    // Compute symmetrical circular distance (-N/2 to N/2)
                    let rawOffset = index - activeIndex;
                    while (rawOffset > total / 2) rawOffset -= total;
                    while (rawOffset < -total / 2) rawOffset += total;

                    const effectiveOffset = rawOffset + dragShift;
                    const absOffset = Math.abs(effectiveOffset);
                    const isCenter = Math.abs(rawOffset) === 0;
                    const sign = effectiveOffset >= 0 ? 1 : -1;

                    // Calculate continuous 3D transformation values
                    let translateXPercent = 0;
                    if (absOffset <= 1) {
                        translateXPercent = effectiveOffset * 48;
                    } else {
                        translateXPercent = sign * (48 + (absOffset - 1) * 26);
                    }

                    const translateZPx = Math.round(90 - absOffset * 135);
                    const rotateYDeg = Math.round(-sign * Math.min(50, absOffset * 35));
                    const scale = +(Math.max(0.62, 1 - absOffset * 0.15)).toFixed(3);
                    const opacity = absOffset <= 2.2 ? +(Math.max(0, 1 - absOffset * 0.35)).toFixed(2) : 0;
                    const brightness = Math.max(50, Math.round(100 - absOffset * 22));
                    const zIndex = Math.round(30 - absOffset * 10);

                    // Smooth, continuous multi-layer shadow calculated dynamically based on 3D distance
                    const shadowY = Math.round(Math.max(6, 22 - absOffset * 9));
                    const shadowBlur = Math.round(Math.max(14, 44 - absOffset * 16));
                    const darkOpacity = +(Math.max(0.10, 0.30 - absOffset * 0.10)).toFixed(3);
                    const amberOpacity = +(Math.max(0, 0.22 - absOffset * 0.15)).toFixed(3);
                    const dynamicBoxShadow = `0 ${shadowY}px ${shadowBlur}px -8px rgba(15, 23, 42, ${darkOpacity}), 0 ${Math.round(shadowY * 0.7)}px ${Math.round(shadowBlur * 0.65)}px -6px rgba(245, 158, 11, ${amberOpacity})`;

                    return (
                        <div
                            key={item.id}
                            onClick={(e) => {
                                if (hasDraggedRef.current) {
                                    e.preventDefault();
                                    return;
                                }
                                if (isCenter) {
                                    navigate(`/search?q=${encodeURIComponent(item.query || item.title)}`);
                                } else {
                                    setActiveIndex(index);
                                }
                            }}
                            className={`absolute top-2 w-[240px] xs:w-[270px] sm:w-[295px] lg:w-[290px] xl:w-[315px] 2xl:w-[330px] h-[360px] xs:h-[390px] sm:h-[420px] lg:h-[415px] xl:h-[430px] rounded-3xl overflow-hidden cursor-pointer select-none preserve-3d group ${
                                isDragging ? "coverflow-card-dragging" : "coverflow-card"
                            } ${
                                isCenter
                                    ? "ring-2 ring-amber-400/90"
                                    : "hover:ring-1 hover:ring-amber-300/60"
                            }`}
                            style={{
                                transform: `translate3d(${translateXPercent}%, 0px, ${translateZPx}px) rotateY(${rotateYDeg}deg) scale(${scale})`,
                                zIndex,
                                opacity,
                                filter: `brightness(${brightness}%)`,
                                boxShadow: dynamicBoxShadow,
                                pointerEvents: absOffset <= 2.2 ? "auto" : "none"
                            }}
                        >
                            {/* Card Background Image */}
                            <img
                                src={item.image}
                                alt={item.title}
                                draggable={false}
                                className="h-full w-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover:scale-105"
                                loading={index <= 2 ? "eager" : "lazy"}
                            />

                            {/* Deep Luxury Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-transparent opacity-80" />

                            {/* Top Badges Row */}
                            <div className="absolute top-3 inset-x-3 sm:top-3.5 sm:inset-x-3.5 flex items-start justify-between gap-1.5 sm:gap-2 z-20">
                                {/* Bank Tag */}
                                <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black text-amber-400 shadow-lg">
                                    <Landmark size={12} className="text-amber-400 shrink-0" />
                                    <span className="truncate max-w-[100px] sm:max-w-[120px]">{item.bank}</span>
                                </div>

                                {/* Discount / Value Tag */}
                                <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/90 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black text-white shadow-lg">
                                    <TrendingDown size={11} className="shrink-0" />
                                    <span>{item.discount}</span>
                                </div>
                            </div>

                            {/* Center Beacon (Only when active) */}
                            {isCenter && (
                                <div className="absolute top-12 sm:top-14 right-3 sm:right-3.5 z-20 animate-fade-in">
                                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-amber-500/40 backdrop-blur-md px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-amber-300 shadow-md">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>SARFAESI Verified</span>
                                    </div>
                                </div>
                            )}

                            {/* Bottom Card Content Box */}
                            <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-5 z-20 space-y-1.5 sm:space-y-2">
                                {/* Property Category & Possession Type */}
                                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-amber-300 font-bold">
                                    <span className="rounded-md bg-amber-500/15 border border-amber-400/30 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] text-amber-300">
                                        {item.type}
                                    </span>
                                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-slate-300 font-semibold truncate">
                                        <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
                                        <span>{item.possession}</span>
                                    </span>
                                </div>

                                {/* Property Title */}
                                <h3 className="text-xs sm:text-base font-black text-white leading-tight line-clamp-1 group-hover:text-amber-300 transition-colors">
                                    {item.title}
                                </h3>

                                {/* Location */}
                                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 font-medium">
                                    <MapPin size={12} className="text-amber-400 shrink-0" />
                                    <span className="truncate">{item.location}</span>
                                </div>

                                {/* Price & Area Card Footer */}
                                <div className="pt-1.5 sm:pt-2 mt-0.5 sm:mt-1 border-t border-slate-700/80 flex items-center justify-between">
                                    <div>
                                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Reserve Price
                                        </div>
                                        <div className="text-sm sm:text-lg font-black text-emerald-400">
                                            {item.price}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
                                            <Ruler size={10} className="text-amber-400" />
                                            <span>Area</span>
                                        </div>
                                        <div className="text-xs sm:text-sm font-bold text-slate-200">
                                            {item.area}
                                        </div>
                                    </div>
                                </div>

                                {/* Center Click-to-Inspect CTA */}
                                {isCenter && (
                                    <div className="pt-0.5 sm:pt-1 animate-scale-up">
                                        <div className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25 transition-all">
                                            <span>View Factsheet & Notice</span>
                                            <ArrowRight size={12} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Left Navigation Chevron Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                    }}
                    className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-slate-950/85 hover:bg-slate-950 text-amber-400 hover:text-white border border-amber-500/40 hover:border-amber-400 flex items-center justify-center shadow-xl hover:shadow-amber-500/20 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                    aria-label="Previous Coverflow Slide"
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Right Navigation Chevron Button */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                    }}
                    className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-slate-950/85 hover:bg-slate-950 text-amber-400 hover:text-white border border-amber-500/40 hover:border-amber-400 flex items-center justify-center shadow-xl hover:shadow-amber-500/20 backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer"
                    aria-label="Next Coverflow Slide"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Bottom Controls: Pill Indicators, Counter, & Auto-Play Toggle */}
            <div className="mt-3 flex items-center justify-between px-4 sm:px-6">
                {/* Auto Play Indicator */}
                <button
                    type="button"
                    onClick={() => setIsAutoPlayActive(!isAutoPlayActive)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-amber-700 transition cursor-pointer"
                    title={isAutoPlayActive ? "Pause Auto Flow" : "Start Auto Flow"}
                >
                    {isAutoPlayActive ? (
                        <>
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Auto Flow</span>
                            <Pause size={11} className="text-slate-400" />
                        </>
                    ) : (
                        <>
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                            <span>Paused</span>
                            <Play size={11} className="text-slate-400" />
                        </>
                    )}
                </button>

                {/* Coverflow Dots / Pill Navigation */}
                <div className="flex items-center gap-1.5">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                activeIndex === idx
                                    ? "w-7 bg-gradient-to-r from-amber-500 to-amber-600 shadow-sm shadow-amber-500/40"
                                    : "w-2 bg-slate-300 hover:bg-slate-400"
                            }`}
                            aria-label={`Jump to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Slide Counter */}
                <div className="text-[11px] font-bold text-slate-500">
                    <span className="text-slate-900 font-black">{activeIndex + 1}</span> of {total}
                </div>
            </div>
        </div>
    );
}
