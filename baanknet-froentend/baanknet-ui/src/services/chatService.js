import api from "./api";

/**
 * Bidwallah AI Assistant API
 * history: [{ role: "user" | "assistant", text }]
 * returns { reply, properties: [{ id, title, priceText, location, type, bank, possession, auctionDate, image }] }
 */
export async function sendChatMessage(message, history = [], currentPropertyId) {
    const response = await api.post(
        "/chat",
        { message, history, currentPropertyId },
        { timeout: 60000 } // tool calls + LLM can take longer than the default 15s
    );
    return response.data;
}

export async function fetchChatStatus() {
    const response = await api.get("/chat/status");
    return response.data;
}
