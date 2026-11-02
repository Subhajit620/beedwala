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

// Splits a photo array into small batches (< 400 KB each) so reverse proxies (like Nginx on EC2 with default 1 MB client_max_body_size) never reject requests with HTTP 413
function splitPhotosIntoChunks(photos, maxBytes = 400000) {
    if (!Array.isArray(photos) || photos.length === 0) return [[]];
    const chunks = [];
    let current = [];
    let currentBytes = 0;

    for (const photo of photos) {
        if (!photo) continue;
        const size = String(photo).length;
        if (current.length > 0 && currentBytes + size > maxBytes) {
            chunks.push(current);
            current = [photo];
            currentBytes = size;
        } else {
            current.push(photo);
            currentBytes += size;
        }
    }
    if (current.length > 0) chunks.push(current);
    return chunks.length > 0 ? chunks : [[]];
}

function preparePropertyPayloadAndChunks(propertyData) {
    const rawPhotos = Array.isArray(propertyData?.photos) ? propertyData.photos.filter(Boolean) : [];
    const cover = propertyData?.displayImage || rawPhotos[0] || "";
    const orderedPhotos = cover
        ? [cover, ...rawPhotos.filter((p) => p !== cover)]
        : rawPhotos;
    const chunks = splitPhotosIntoChunks(orderedPhotos, 400000);
    const firstBatch = chunks[0] || [];
    // Avoid sending a duplicate base64 string in displayImage when it matches photos[0]; server sets displayImage = photos[0] automatically
    const wireDisplayImage = cover && String(cover).startsWith("data:") && firstBatch[0] === cover ? "" : cover;

    return {
        firstPayload: {
            ...propertyData,
            displayImage: wireDisplayImage,
            photos: firstBatch
        },
        remainingChunks: chunks.slice(1)
    };
}

export async function createProperty(propertyData) {
    const { firstPayload, remainingChunks } = preparePropertyPayloadAndChunks(propertyData);
    const response = await api.post("/properties", firstPayload);
    let result = response.data;
    const createdId = result?.data?._id || result?.data?.sourcePropertyId;

    if (createdId && remainingChunks.length > 0) {
        for (const chunk of remainingChunks) {
            const appendRes = await api.put(`/properties/${createdId}`, { appendPhotos: chunk });
            result = appendRes.data;
        }
    }
    return result;
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
    const { firstPayload, remainingChunks } = preparePropertyPayloadAndChunks(propertyData);
    const response = await api.put(`/properties/${id}`, firstPayload);
    let result = response.data;

    if (remainingChunks.length > 0) {
        for (const chunk of remainingChunks) {
            const appendRes = await api.put(`/properties/${id}`, { appendPhotos: chunk });
            result = appendRes.data;
        }
    }
    return result;
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
