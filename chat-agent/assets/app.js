const API_URL = "https://cf_ai_chat_agent.arcansesmarkdominic.workers.dev/api/chat";

function getSession() {
    let session = localStorage.getItem("session");

    if (!session) {
        session = crypto.randomUUID();
        localStorage.setItem("session", session);
    }

    return session;
}

async function sendMessage() {
    const input = document.getElementById("message");
    const chat = document.getElementById("chat");
    const message = input.value.trim();

    if (!message) return;

    const session = getSession();

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

        chat.innerHTML += `<div class="ai">AI: ${data.reply || data.error || "No response"}</div>`;
    } catch (error) {
        const loadingDiv = document.getElementById(loadingId);
        if (loadingDiv) loadingDiv.remove();

        chat.innerHTML += `<div class="ai">AI: Request failed: ${error.message}</div>`;
        console.error("Fetch error:", error);
    }

    chat.scrollTop = chat.scrollHeight;
}

async function clearChat() {
    const chat = document.getElementById("chat");
    const session = getSession();

    try {
        const res = await fetch(API_URL, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ session })
        });

        const data = await res.json();

        chat.innerHTML = `<div class="ai">${data.message || "Memory cleared"}</div>`;
    } catch (error) {
        chat.innerHTML += `<div class="ai">Clear failed: ${error.message}</div>`;
        console.error("Clear error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("message");

    input.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});