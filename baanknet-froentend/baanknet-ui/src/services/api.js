import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 15000,
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

export default api;