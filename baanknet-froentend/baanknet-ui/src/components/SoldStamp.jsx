import React, { useId } from "react";

/**
 * Official Circular Auction Seal ("SOLD OUT")
 * Combines a circular double-ring notary seal (with curved SVG perimeter text)
 * and an embossed central "SOLD OUT" crossbar plate.
 *
 * Variants:
 * - "card": Sized for PropertyCard (Grid), FreshPropertyCard & Admin Preview
 * - "compact": Sized for List view thumbnails
 * - "hero": Sized for full PropertyGallery hero stage
 */
export default function SoldStamp({ variant = "card" }) {
    const uid = useId().replace(/:/g, "");
    const topArcId = `sold-top-arc-${uid}`;
    const bottomArcId = `sold-bottom-arc-${uid}`;

    const sizeConfig =
        variant === "hero"
            ? {
                  wrapper: "h-44 w-44 sm:h-52 sm:w-52",
                  ribbon: "py-1.5 px-3 text-lg sm:text-xl tracking-[0.22em] border-y-2",
                  dot: "h-1.5 w-1.5"
              }
            : variant === "compact"
            ? {
                  wrapper: "h-24 w-24",
                  ribbon: "py-0.5 px-1.5 text-[10px] tracking-[0.14em] border-y",
                  dot: "h-1 w-1"
              }
            : {
                  wrapper: "h-32 w-32 sm:h-36 sm:w-36",
                  ribbon: "py-1 px-2 text-xs sm:text-sm tracking-[0.18em] border-y-[1.5px]",
                  dot: "h-1.5 w-1.5"
              };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-[1.5px] pointer-events-none select-none">
            <div
                className={`relative -rotate-12 flex items-center justify-center rounded-full bg-slate-950/80 shadow-[0_14px_35px_rgba(0,0,0,0.65)] ring-2 ring-white/25 transition-transform duration-300 group-hover:scale-105 ${sizeConfig.wrapper}`}
            >
                {/* Circular SVG Double-Ring Notary Seal + Curved Text */}
                <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full overflow-visible"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Top clockwise arc for "★ BIDWALLAH VERIFIED ★" */}
                        <path
                            id={topArcId}
                            d="M 18,60 A 42,42 0 1,1 102,60"
                            fill="none"
                        />
                        {/* Bottom counter-clockwise arc for "DEAL CLOSED • ARCHIVED" */}
                        <path
                            id={bottomArcId}
                            d="M 102,60 A 42,42 0 1,1 18,60"
                            fill="none"
                        />
                    </defs>

                    {/* Outer Crimson Seal Ring */}
                    <circle
                        cx="60"
                        cy="60"
                        r="56"
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="3.5"
                    />

                    {/* Subtle Inner White Accent Ring */}
                    <circle
                        cx="60"
                        cy="60"
                        r="51.5"
                        fill="none"
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="1"
                    />

                    {/* Inner Dashed Stamp Ring */}
                    <circle
                        cx="60"
                        cy="60"
                        r="33"
                        fill="rgba(225, 29, 72, 0.14)"
                        stroke="#fb7185"
                        strokeWidth="1.5"
                        strokeDasharray="3.5 2.5"
                    />

                    {/* Curved Top Perimeter Text */}
                    <text
                        fill="#fecdd3"
                        fontSize="7.2"
                        fontWeight="900"
                        letterSpacing="1.7px"
                    >
                        <textPath
                            href={`#${topArcId}`}
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            ★ BIDWALLAH VERIFIED ★
                        </textPath>
                    </text>

                    {/* Curved Bottom Perimeter Text */}
                    <text
                        fill="#fda4af"
                        fontSize="6.8"
                        fontWeight="800"
                        letterSpacing="1.6px"
                    >
                        <textPath
                            href={`#${bottomArcId}`}
                            startOffset="50%"
                            textAnchor="middle"
                        >
                            • OFFICIAL DEAL CLOSED •
                        </textPath>
                    </text>
                </svg>

                {/* Central Embossed "SOLD OUT" Crossbar Plate */}
                <div
                    className={`absolute inset-x-[-6%] flex items-center justify-between rounded-md border-x-2 border-white/95 bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 font-black uppercase text-white shadow-[0_6px_20px_rgba(225,29,72,0.65)] ${sizeConfig.ribbon}`}
                >
                    <span className={`rounded-full bg-white/90 shrink-0 ${sizeConfig.dot}`} />
                    <span className="leading-none drop-shadow-xs">SOLD OUT</span>
                    <span className={`rounded-full bg-white/90 shrink-0 ${sizeConfig.dot}`} />
                </div>
            </div>
        </div>
    );
}
