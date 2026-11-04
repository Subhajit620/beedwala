import React from "react";

/**
 * Custom architectural residence + ownership key emblem for Fresh Direct Properties.
 * Designed with crisp geometric strokes instead of generic stock/AI icons.
 */
export function DirectPropertyEmblem({ className = "h-6 w-6" }) {
    return (
        <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Architectural Residence Roofline & Frame */}
            <path
                d="M4 13.2L14 5L24 13.2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6.8 11.2V22.5H21.2V11.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Modern Doorway & Window Grid */}
            <rect
                x="11.5"
                y="15"
                width="5"
                height="7.5"
                rx="0.8"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            {/* Verified Check Badge at Top Right */}
            <circle cx="20.5" cy="7.5" r="3.5" fill="currentColor" fillOpacity="0.18" />
            <path
                d="M18.9 7.5L20.1 8.7L22.3 6.4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Custom institutional bank columns + auction gavel crest for SARFAESI Bank Auctions.
 */
export function BankAuctionEmblem({ className = "h-6 w-6" }) {
    return (
        <svg
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Classical Bank Pediment */}
            <path
                d="M3.5 10.5L14 4.5L24.5 10.5H3.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            {/* Treasury Pillars */}
            <path
                d="M7.5 10.5V19.5M12 10.5V19.5M16 10.5V19.5M20.5 10.5V19.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            {/* Base Plinths */}
            <path
                d="M4.5 19.5H23.5M3.5 22.5H24.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

/**
 * Clean geometric verification badge icon (replaces AI-cliche Sparkles).
 */
export function VerifiedSealIcon({ size = 14, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M10 2L12.4 3.8L15.4 3.5L16.3 6.4L18.7 8.2L17.6 11L18.2 14L15.5 15.5L14.2 18.2L11.2 17.6L8.8 18.2L7.5 15.5L4.8 14L5.4 11L4.3 8.2L6.7 6.4L7.6 3.5L10 2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <path
                d="M7.4 10.2L9.2 12L12.8 8.3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Clean architectural grid & pin locator icon (replaces Compass).
 */
export function PropertyFinderIcon({ size = 15, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <rect
                x="2.5"
                y="2.5"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="11.5"
                y="2.5"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="2.5"
                y="11.5"
                width="6"
                height="6"
                rx="1.2"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <circle cx="14.5" cy="14.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
    );
}

/**
 * Clean upward valuation / market activity icon (replaces Flame).
 */
export function MarketActivityIcon({ size = 13, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M3 14.5L8 9.5L11.5 13L17 6.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13 6.5H17V10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Clean property advisory desk icon (replaces Bot/Sparkles in ChatAssistant).
 */
export function AdvisoryDeskIcon({ size = 18, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11V15.5C18 16.6046 17.1046 17.5 16 17.5H13.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <rect
                x="3"
                y="10.5"
                width="3.2"
                height="5"
                rx="1.4"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <rect
                x="15.8"
                y="10.5"
                width="3.2"
                height="5"
                rx="1.4"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            <path
                d="M9.5 17.5H12.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}
