import api from "./api";

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

export async function fetchFreshProperties(admin = false) {
    return (await api.get(admin ? "/admin/fresh-properties" : "/fresh-properties")).data;
}

export async function saveFreshProperty(id, data) {
    const rawPhotos = Array.isArray(data?.photos) ? data.photos.filter(Boolean) : [];
    const chunks = splitPhotosIntoChunks(rawPhotos, 400000);
    const firstPayload = { ...data, photos: chunks[0] || [] };
    const remainingChunks = chunks.slice(1);

    const firstRes = await (id
        ? api.put(`/admin/fresh-properties/${id}`, firstPayload)
        : api.post("/admin/fresh-properties", firstPayload));
    let result = firstRes.data;
    const targetId = id || result?.data?._id;

    if (targetId && remainingChunks.length > 0) {
        for (const chunk of remainingChunks) {
            const appendRes = await api.put(`/admin/fresh-properties/${targetId}`, { appendPhotos: chunk });
            result = appendRes.data;
        }
    }
    return result;
}

export async function deleteFreshProperty(id) {
    return (await api.delete(`/admin/fresh-properties/${id}`)).data;
}
