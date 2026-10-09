require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://aspiringlifedrive_db_user:Magicalthread786%23@cluster0.ng665uf.mongodb.net/baanknet?retryWrites=true&w=majority&appName=Cluster0";
const BAANKNET_API_URL = process.env.BAANKNET_API_URL || "https://baanknet.com/api/v1/property/detail/property-filter";
const PAGE_SIZE = parseInt(process.env.PAGE_SIZE, 10) || 10;
const REQUEST_DELAY_MS = parseInt(process.env.REQUEST_DELAY_MS, 10) || 1000;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES, 10) || 3;
const SYNC_INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES, 10) || 30;

const defaultSearch = {
    stateId: 36,
    cityId: 7391,
    propTypeOfActionId: []
};

module.exports = {
    MONGODB_URI,
    BAANKNET_API_URL,
    PAGE_SIZE,
    REQUEST_DELAY_MS,
    MAX_RETRIES,
    SYNC_INTERVAL_MINUTES,
    mongodbUri: MONGODB_URI,
    apiUrl: BAANKNET_API_URL,
    pageSize: PAGE_SIZE,
    requestDelayMs: REQUEST_DELAY_MS,
    maxRetries: MAX_RETRIES,
    syncIntervalMinutes: SYNC_INTERVAL_MINUTES,
    defaultSearch
};
