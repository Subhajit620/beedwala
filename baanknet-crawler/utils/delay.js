/**
 * Asynchronous delay/sleep helper for rate throttling.
 * @param {number} ms - Milliseconds to pause.
 * @returns {Promise<void>}
 */
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { delay };
