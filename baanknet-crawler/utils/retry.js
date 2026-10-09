const { delay } = require("./delay");
const logger = require("./logger");

/**
 * Checks whether an HTTP or network error is temporary and eligible for retry.
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryableError(error) {
    if (!error) return false;

    // Network & connection level errors
    const networkErrors = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "EAI_AGAIN",
        "ENOTFOUND",
        "ERR_NETWORK",
        "EHOSTUNREACH"
    ];

    if (error.code && networkErrors.includes(error.code)) {
        return true;
    }

    if (error.message && (
        error.message.includes("timeout") ||
        error.message.includes("Network Error") ||
        error.message.includes("socket hang up")
    )) {
        return true;
    }

    // HTTP Status codes
    const status = error.response ? error.response.status : null;
    if (status) {
        // Retry 408 (Request Timeout), 429 (Rate limit), 500, 502, 503, 504
        if ([408, 429, 500, 502, 503, 504].includes(status)) {
            return true;
        }

        // Do NOT retry 400, 401, 403, 404, etc.
        return false;
    }

    return false;
}

/**
 * Executes an async function with exponential backoff for transient failures.
 * @param {Function} fn - Async function to execute.
 * @param {Object} options
 * @param {number} options.maxRetries - Maximum number of retries (default 3).
 * @param {number} options.baseDelayMs - Base delay in ms (default 1000).
 * @param {string} options.contextName - Operation name for logging.
 * @returns {Promise<any>}
 */
async function retryWithBackoff(fn, { maxRetries = 3, baseDelayMs = 1000, contextName = "Operation" } = {}) {
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        } catch (error) {
            attempt++;

            const retryable = isRetryableError(error);
            const status = error.response?.status ? `(HTTP ${error.response.status})` : "";

            if (!retryable || attempt > maxRetries) {
                if (!retryable && error.response?.status === 403) {
                    logger.error(`${contextName} received HTTP 403 Forbidden. Halting request immediately.`);
                }
                throw error;
            }

            // Exponential backoff: baseDelay * 2^(attempt - 1)
            const backoffMs = baseDelayMs * Math.pow(2, attempt - 1);
            logger.warn(
                `${contextName} failed ${status}: ${error.message}. Retrying attempt ${attempt}/${maxRetries} in ${backoffMs}ms...`
            );

            await delay(backoffMs);
        }
    }
}

module.exports = {
    retryWithBackoff,
    isRetryableError
};
