import api from "./api";

export async function fetchFreshProperties(admin = false) {
    return (await api.get(admin ? "/admin/fresh-properties" : "/fresh-properties")).data;
}

export async function saveFreshProperty(id, data) {
    return (await (id ? api.put(`/admin/fresh-properties/${id}`, data) : api.post("/admin/fresh-properties", data))).data;
}

export async function deleteFreshProperty(id) {
    return (await api.delete(`/admin/fresh-properties/${id}`)).data;
}
