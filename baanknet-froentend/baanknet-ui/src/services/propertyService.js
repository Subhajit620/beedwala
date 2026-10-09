import api from "./api";

/**
 * Property API service
 * Fully configured for server-side filtering & pagination
 */

export async function fetchProperties(params = {}) {
    const response = await api.get("/properties", { params });
    return response.data;
}

export async function fetchPropertyStats() {
    const response = await api.get("/properties/stats");
    return response.data;
}

export async function fetchPropertyById(id) {
    const response = await api.get(`/properties/${id}`);
    return response.data;
}
