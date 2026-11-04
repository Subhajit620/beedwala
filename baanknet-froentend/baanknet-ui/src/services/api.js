import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 25000,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor to attach JWT / Admin token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("bw_admin_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor with automatic retry for transient network / 5xx errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error?.config;
        if (!config) return Promise.reject(error);

        const method = (config.method || "get").toLowerCase();
        const status = error?.response?.status;
        const isRetryable = !status || status >= 500 || error.code === "ECONNABORTED";

        config.__retryCount = config.__retryCount || 0;
        if (method === "get" && isRetryable && config.__retryCount < 2) {
            config.__retryCount += 1;
            await new Promise((resolve) => setTimeout(resolve, 600 * config.__retryCount));
            return api(config);
        }

        return Promise.reject(error);
    }
);

export default api;
