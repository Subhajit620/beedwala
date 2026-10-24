import { formatINR } from "./formatters";

/**
 * Statutory Bank Auction Schedule & Calendar Utilities
 * Computes compliant dates under SARFAESI Act, 2002 (Rules 8 & 9)
 */

export function getAuctionSchedule(property) {
    if (!property) return null;

    const price = Number(property.propertyPrice) || 0;
    const emdAmount = property.emdAmount && Number(property.emdAmount) > 0
        ? Number(property.emdAmount)
        : Math.round(price * 0.10); // Statutory 10% EMD

    const createdOnDate = property.createdOn ? new Date(property.createdOn) : new Date();
    const now = new Date();

    let auctionDate;
    if (property.auctionDate && !isNaN(new Date(property.auctionDate).getTime())) {
        auctionDate = new Date(property.auctionDate);
    } else {
        // Compute scheduled date based on 30-day statutory notice cycle
        const statutoryDate = new Date(createdOnDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        statutoryDate.setHours(11, 0, 0, 0); // 11:00 AM IST e-auction window

        // If statutoryDate is in the past, align with the upcoming bi-weekly bank auction cycle
        if (statutoryDate < now) {
            const daysOffset = 7 + ((property.sourcePropertyId ? parseInt(property.sourcePropertyId.slice(-2), 10) || 3 : 5) % 10);
            auctionDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
            auctionDate.setHours(11, 0, 0, 0);
        } else {
            auctionDate = statutoryDate;
        }
    }

    // EMD deadline is 24 hours prior to e-auction at 17:00 IST
    let emdSubmissionDate;
    if (property.emdSubmissionDate && !isNaN(new Date(property.emdSubmissionDate).getTime())) {
        emdSubmissionDate = new Date(property.emdSubmissionDate);
    } else {
        emdSubmissionDate = new Date(auctionDate.getTime() - 24 * 60 * 60 * 1000);
        emdSubmissionDate.setHours(17, 0, 0, 0);
    }

    // Inspection window: 5 days before EMD to 2 days before EMD
    const inspectionStartDate = new Date(emdSubmissionDate.getTime() - 4 * 24 * 60 * 60 * 1000);
    inspectionStartDate.setHours(10, 0, 0, 0);

    const inspectionEndDate = new Date(emdSubmissionDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    inspectionEndDate.setHours(16, 0, 0, 0);

    // Time difference calculations
    const msToAuction = auctionDate.getTime() - now.getTime();
    const msToEmd = emdSubmissionDate.getTime() - now.getTime();

    const isEmdPassed = msToEmd <= 0;
    const isAuctionPassed = msToAuction <= 0;

    let status = "upcoming";
    if (isAuctionPassed) {
        status = "completed";
    } else if (msToEmd > 0 && msToEmd < 48 * 60 * 60 * 1000) {
        status = "closing_soon";
    } else if (isEmdPassed && !isAuctionPassed) {
        status = "live_window";
    }

    return {
        auctionDate,
        emdSubmissionDate,
        inspectionStartDate,
        inspectionEndDate,
        emdAmount,
        status,
        msToAuction,
        msToEmd
    };
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHmmssZ)
 */
function toGCalIso(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, "");
}

/**
 * Generate 1-Click Google Calendar Add Event URL
 */
export function generateGoogleCalendarUrl(property, schedule) {
    if (!property || !schedule) return "#";

    const title = `[Bank Auction] ${property.bankName || "Authorized Bank"} - ${property.propertyHeading || property.propertyTitle || "Property Auction"}`;
    
    // 2-hour live bidding window
    const startDate = schedule.auctionDate;
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

    const datesParam = `${toGCalIso(startDate)}/${toGCalIso(endDate)}`;

    const details = [
        `BIDWALLAH VERIFIED BANK AUCTION NOTICE`,
        `======================================`,
        `Property: ${property.propertyHeading || property.propertyTitle}`,
        `Reserve Price: ${formatINR(property.propertyPrice)}`,
        `Mandatory 10% EMD Amount: ${formatINR(schedule.emdAmount)}`,
        `EMD Submission Cutoff: ${schedule.emdSubmissionDate.toLocaleString("en-IN")}`,
        `Lending Bank: ${property.bankName || "Nationalized Bank"}`,
        `Branch Address: ${property.bankAddress || "Regional Recovery Branch, Kolkata"}`,
        `Borrower Account: ${property.borrowerName || "SARFAESI Statutory Account"}`,
        `Notice ID: ${property.sourcePropertyId || property.propertyUniqueId || property._id}`,
        ``,
        `Official Listing URL: ${window.location.origin}/properties/${property.sourcePropertyId || property._id}`
    ].join("\n");

    const location = `${property.locality ? property.locality + ", " : ""}${property.cityName || "Kolkata"}, West Bengal, India`;

    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.set("action", "TEMPLATE");
    url.searchParams.set("text", title);
    url.searchParams.set("dates", datesParam);
    url.searchParams.set("details", details);
    url.searchParams.set("location", location);

    return url.toString();
}

/**
 * Generate & Trigger Download of RFC 5545 iCalendar (.ics) File
 */
export function downloadIcsCalendarFile(property, schedule) {
    if (!property || !schedule) return;

    const startDate = schedule.auctionDate;
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const nowIso = toGCalIso(new Date());
    const startIso = toGCalIso(startDate);
    const endIso = toGCalIso(endDate);

    const cleanTitle = (property.propertyHeading || property.propertyTitle || "Bank Auction Property").replace(/,/g, "\\,");
    const bankName = (property.bankName || "Authorized Bank").replace(/,/g, "\\,");
    const location = `${property.locality ? property.locality + "\\, " : ""}${property.cityName || "Kolkata"}\\, West Bengal\\, India`;

    const description = `BIDWALLAH BANK AUCTION NOTICE\\n` +
        `Reserve Price: ${formatINR(property.propertyPrice)}\\n` +
        `Mandatory 10% EMD: ${formatINR(schedule.emdAmount)}\\n` +
        `EMD Cutoff: ${schedule.emdSubmissionDate.toLocaleDateString("en-IN")}\\n` +
        `Bank: ${bankName}\\n` +
        `Notice ID: ${property.sourcePropertyId || property._id}`;

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//BidWallah//Bank Auction Discovery//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:bw-auction-${property.sourcePropertyId || property._id}@bidwallah.com`,
        `DTSTAMP:${nowIso}`,
        `DTSTART:${startIso}`,
        `DTEND:${endIso}`,
        `SUMMARY:[Bank Auction] ${bankName} - ${cleanTitle}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT24H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: 10% EMD Submission Deadline Tomorrow",
        "END:VALARM",
        "BEGIN:VALARM",
        "TRIGGER:-PT2H",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Live Bank E-Auction starts in 2 hours",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Auction-Notice-${property.sourcePropertyId || "bidwallah"}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
