/**
 * Formatted structured console logger with timestamps.
 */
function getTimestamp() {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
}

const logger = {
    info: (msg, ...args) => {
        console.log(`[${getTimestamp()}] [INFO]  ${msg}`, ...args);
    },
    warn: (msg, ...args) => {
        console.warn(`[${getTimestamp()}] [WARN]  ${msg}`, ...args);
    },
    error: (msg, ...args) => {
        console.error(`[${getTimestamp()}] [ERROR] ${msg}`, ...args);
    },
    success: (msg, ...args) => {
        console.log(`[${getTimestamp()}] [OK]    ${msg}`, ...args);
    },
    record: (action, propertyId, extra = "") => {
        const paddedAction = action.padEnd(9, " ");
        console.log(`[${getTimestamp()}] ${paddedAction} → ${propertyId} ${extra}`);
    },
    divider: () => {
        console.log("==================================================");
    },
    section: (title) => {
        console.log("\n==================================================");
        console.log(` ${title.toUpperCase()}`);
        console.log("==================================================");
    }
};

module.exports = logger;
