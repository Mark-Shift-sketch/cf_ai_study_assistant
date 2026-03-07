const API_URL = "https://cf_ai_chat_agent.arcansesmarkdominic.workers.dev/api/chat";

async function sendMessage() {
    const input = document.getElementById("message");
    const chat = document.getElementById("chat");
    const message = input.value.trim();

    if (!message) return;

    let session = localStorage.getItem("session");
    if (!session) {
        session = crypto.randomUUID();
        localStorage.setItem("session", session);
    }

    chat.innerHTML += `<div class="user">You: ${message}</div>`;

    const loadingId = `loading-${Date.now()}`;
    chat.innerHTML += `<div class="loading" id="${loadingId}">AI is thinking...</div>`;

    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message, session })
        });

        const data = await res.json();

        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) loadingDiv.remove();

        chat.innerHTML += `<div class="ai"><b>AI:</b> ${data.reply || data.error || "No response"}</div>`;
    } catch (error) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) loadingDiv.remove();

        chat.innerHTML += `<div class="ai"><b>AI:</b> Request failed: ${error.message}</div>`;
        console.error("Fetch error:", error);
    }

    chat.scrollTop = chat.scrollHeight;
}