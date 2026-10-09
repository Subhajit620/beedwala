const https = require("https");
const { chromium } = require("playwright");
const config = require("./config");
const { retryWithBackoff } = require("./utils/retry");
const logger = require("./utils/logger");

// Custom HTTPS Agent to handle custom SSL/TLS certificates gracefully
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    keepAlive: true,
    timeout: 30000
});

let playwrightContext = null;
let playwrightBrowser = null;

/**
 * Lazily initializes a Playwright request context as a fallback engine if needed.
 */
async function getPlaywrightRequestContext() {
    if (!playwrightContext) {
        playwrightBrowser = await chromium.launch({ headless: true });
        playwrightContext = await playwrightBrowser.newContext({
            ignoreHTTPSErrors: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        });
    }
    return playwrightContext;
}

/**
 * Closes Playwright instance if opened.
 */
async function closePlaywrightEngine() {
    if (playwrightBrowser) {
        try {
            await playwrightBrowser.close();
        } catch (e) {
            // Ignore closing errors
        }
        playwrightBrowser = null;
        playwrightContext = null;
    }
}

/**
 * Performs a direct HTTPS POST request.
 * @param {string} urlString
 * @param {Object} data
 * @returns {Promise<Object>} Parsed JSON response.
 */
function makeDirectHttpsRequest(urlString, data) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const postData = JSON.stringify(data);

        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: "POST",
            agent: httpsAgent,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
                "Accept": "application/json, text/plain, */*",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Origin": "https://baanknet.com",
                "Referer": "https://baanknet.com/property-listing"
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let responseBody = "";

            res.setEncoding("utf8");
            res.on("data", (chunk) => {
                responseBody += chunk;
            });

            res.on("end", () => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const error = new Error(`BAANKNET API returned HTTP ${res.statusCode}`);
                    error.response = { status: res.statusCode, data: responseBody };
                    return reject(error);
                }

                try {
                    const parsed = JSON.parse(responseBody);
                    resolve(parsed);
                } catch (parseError) {
                    const error = new Error(`Failed to parse BAANKNET API response as JSON: ${parseError.message}`);
                    error.rawBody = responseBody;
                    reject(error);
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.on("timeout", () => {
            req.destroy();
            const error = new Error("BAANKNET API request timed out (30s)");
            error.code = "ETIMEDOUT";
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Fetches properties from BAANKNET public API with retry and fallback engine.
 * @param {Object} options
 * @param {number} [options.stateId]
 * @param {number} [options.cityId]
 * @param {Array} [options.propTypeOfActionId]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @param {string} [options.postedSince=""]
 * @param {string} [options.sortType="mostrecent"]
 * @returns {Promise<{ success: boolean, total: number, currentPage: number, totalPages: number, data: Array }>}
 */
async function fetchProperties({
    stateId = config.defaultSearch.stateId,
    cityId = config.defaultSearch.cityId,
    propTypeOfActionId = config.defaultSearch.propTypeOfActionId,
    page = 1,
    limit = config.pageSize,
    postedSince = "",
    sortType = "mostrecent"
} = {}) {
    const payload = {
        search: {
            stateId,
            cityId,
            propTypeOfActionId: propTypeOfActionId || []
        },
        range: {},
        sort: {
            type: sortType,
            postedSince: postedSince || ""
        },
        page,
        limit
    };

    const fetchOperation = async () => {
        try {
            // 1. Primary: Direct HTTPS Request (Ultra-fast, zero browser overhead)
            const json = await makeDirectHttpsRequest(config.apiUrl, payload);

            if (!json || !json.data) {
                throw new Error("Invalid response format from BAANKNET API (missing data field)");
            }

            return {
                success: Boolean(json.success),
                total: Number(json.data.total) || 0,
                currentPage: Number(json.data.currentPage) || page,
                totalPages: Number(json.data.totalPages) || 1,
                data: Array.isArray(json.data.data) ? json.data.data : []
            };
        } catch (directError) {
            logger.warn(`Direct HTTPS request failed for page ${page} (${directError.message}). Attempting via Playwright Request engine...`);

            // 2. Fallback: Playwright Request Context
            const pwContext = await getPlaywrightRequestContext();
            const pwResponse = await pwContext.request.post(config.apiUrl, {
                data: payload,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                timeout: 45000
            });

            if (!pwResponse.ok()) {
                const err = new Error(`Playwright Request returned HTTP ${pwResponse.status()}`);
                err.response = { status: pwResponse.status() };
                throw err;
            }

            const json = await pwResponse.json();
            if (!json || !json.data) {
                throw new Error("Invalid response format from BAANKNET API via Playwright engine");
            }

            return {
                success: Boolean(json.success),
                total: Number(json.data.total) || 0,
                currentPage: Number(json.data.currentPage) || page,
                totalPages: Number(json.data.totalPages) || 1,
                data: Array.isArray(json.data.data) ? json.data.data : []
            };
        }
    };

    return retryWithBackoff(fetchOperation, {
        maxRetries: config.maxRetries,
        baseDelayMs: 1500,
        contextName: `Fetch Properties Page ${page}`
    });
}

module.exports = {
    fetchProperties,
    closePlaywrightEngine
};
