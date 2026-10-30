import api from "./api";

/**
 * Enterprise Admin Service for managing properties, CRM leads, banks, audit logs, and crawler pipeline
 */

// 1. Admin Authentication
export async function loginAdmin(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
}

export async function getAdminProfile() {
    const response = await api.get("/auth/me");
    return response.data;
}

// 2. Dashboard Analytics
export async function fetchAdminDashboardStats() {
    const response = await api.get("/admin/dashboard-stats");
    return response.data;
}

// 3. Property Management (CRUD & Batch Operations)
export async function fetchAdminProperties(params = {}) {
    const response = await api.get("/properties", {
        params: {
            ...params,
            adminView: "true"
        }
    });
    return response.data;
}

export async function createProperty(propertyData) {
    const response = await api.post("/properties", propertyData);
    return response.data;
}

/**
 * Uploads a property video file (streamed as raw binary) and returns { url, source, size }.
 * @param {File} file
 * @param {(percent: number) => void} [onProgress]
 * @param {AbortSignal} [signal]
 */
export async function uploadPropertyVideo(file, onProgress, signal) {
    const response = await api.post("/uploads/video", file, {
        headers: { "Content-Type": file.type || "video/mp4" },
        timeout: 0, // large files can take minutes
        signal,
        onUploadProgress: (evt) => {
            if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
    });
    return response.data.data;
}

export async function updateProperty(id, propertyData) {
    const response = await api.put(`/properties/${id}`, propertyData);
    return response.data;
}

export async function togglePropertyStatus(id, isActive) {
    const response = await api.patch(`/properties/${id}/status`, { isActive });
    return response.data;
}

export async function deleteProperty(id) {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
}

export async function bulkPropertyAction(action, ids, updatePayload = null) {
    const response = await api.post("/properties/bulk-action", { action, ids, updatePayload });
    return response.data;
}

// 4. Banks Directory
export async function fetchBanksDirectory() {
    const response = await api.get("/admin/banks");
    return response.data;
}

// 5. Smart Duplicate & Data Quality Auditor
export async function fetchDuplicateNotices() {
    const response = await api.get("/admin/duplicates");
    return response.data;
}

// 6. Audit Logs Stream
export async function fetchAuditLogs(params = {}) {
    const response = await api.get("/admin/audit-logs", { params });
    return response.data;
}

// 7. Inquiries & CRM Leads
export async function fetchInquiries(params = {}) {
    const response = await api.get("/inquiries", { params });
    return response.data;
}

export async function createInquiry(data) {
    const response = await api.post("/inquiries", data);
    return response.data;
}

export async function updateInquiry(id, data) {
    const response = await api.patch(`/inquiries/${id}`, data);
    return response.data;
}

export async function deleteInquiry(id) {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
}

// 8. Crawler Sync Logs & Settings
export async function fetchSyncLogs(params = {}) {
    const response = await api.get("/sync/logs", { params });
    return response.data;
}

export async function fetchSyncStatus() {
    const response = await api.get("/sync/status");
    return response.data;
}

export async function triggerCrawlerSync(options = {}) {
    const response = await api.post("/sync/trigger", options);
    return response.data;
}

export async function fetchCrawlerSettings() {
    const response = await api.get("/admin/crawler/settings");
    return response.data;
}

export async function saveCrawlerSettings(settings) {
    const response = await api.post("/admin/crawler/settings", settings);
    return response.data;
}

// 9. System Diagnostics & Exports
export async function fetchSystemHealth() {
    const response = await api.get("/health");
    return response.data;
}

export async function exportPropertiesData(format = "json") {
    if (format === "csv") {
        window.open(`${api.defaults.baseURL}/admin/export?format=csv`, "_blank");
        return { success: true };
    }
    const response = await api.get("/admin/export?format=json");
    return response.data;
}
