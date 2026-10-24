import api from "./api";

/**
 * Property API service
 * Fully configured for server-side filtering, suggestions, facets, recommendations & pagination
 */

export async function fetchProperties(params = {}) {
    const response = await api.get("/properties", { params });
    return response.data;
}

export async function fetchPropertyStats() {
    const response = await api.get("/properties/stats");
    return response.data;
}

export async function fetchPropertyFacets() {
    const response = await api.get("/properties/facets");
    return response.data;
}

export async function fetchPropertySuggestions(query, limit = 8) {
    if (!query || query.trim().length < 2) {
        return { success: true, suggestions: [] };
    }
    const response = await api.get("/properties/suggestions", {
        params: { q: query.trim(), limit }
    });
    return response.data;
}

export async function fetchPropertyRecommendations(id, limit = 6) {
    const response = await api.get(`/properties/${id}/recommendations`, {
        params: { limit }
    });
    return response.data;
}

export async function fetchPropertyById(id) {
    const response = await api.get(`/properties/${id}`);
    return response.data;
}
