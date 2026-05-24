// Nota: no pongas tu API key en el frontend para producción. Usa un proxy/backend.
// Al inicio de tu archivo de JS
import { ENV } from '../config.js';

const GEMINI_API_KEY = ENV.GEMINI_API_KEY;



// 2. Configuración del "carácter" del bot

let client = null;
let hasAI = false;

let chatToggleButton = null;
let chatPanel = null;
let chatCloseButton = null;
let chatMessages = null;
let chatForm = null;
let chatInput = null;

let typingIndicator = null;
let isSending = false;

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createMessageElement(text, role) {
    const message = document.createElement("div");
    message.className = `chat-message ${role}`;
    message.innerHTML = escapeHtml(text).replace(/\n/g, "<br>");
    return message;
}

function scrollToBottom() {
    if (!chatMessages) return;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function setTypingState(active) {
    isSending = active;
    chatInput.disabled = active;
    const btn = chatForm.querySelector("button");
    if (btn) btn.disabled = active;
    chatInput.placeholder = active ? "Escribiendo..." : "Escribe tu pregunta...";
}

async function askGemini(prompt) {
    if (!hasAI || !client) {
        throw new Error('AI client no disponible');
    }

    // 1. CAPTURAR EL CONTEXTO DE LA PÁGINA
    // Esto lee todo el texto visible en la etiqueta <body> (puedes cambiar 'body' por el ID de tu contenedor principal)
    const textoDeLaPagina = document.body.innerText;

    // 2. CREAR EL MODELO CON EL CONTEXTO INYECTADO
    const model = client.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: `Eres ASTRO, el asistente virtual del entorno bancario Luciastore.
        
        Para que tengas contexto, esto es todo lo que el usuario está viendo en su pantalla ahora mismo:
        --- INICIO DE LA PANTALLA DEL USUARIO ---
        ${textoDeLaPagina}
        --- FIN DE LA PANTALLA DEL USUARIO ---
        
        Usa esa información para guiar al usuario. Si te preguntan dónde está algo, busca en el texto de la pantalla y dile exactamente en qué menú o sección hacer clic. Sé amable, conciso y nunca dejes oraciones incompletas.`
    });

    const generationConfig = {
        temperature: 0.4,
        maxOutputTokens: 800,
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig
    });

    const response = await result.response;
    return response.text().trim() || "Lo siento, no pude generar una respuesta.";
}

function addTypingIndicator() {
    typingIndicator = document.createElement("div");
    typingIndicator.className = "chat-message typing";
    typingIndicator.textContent = "Escribiendo...";
    chatMessages.appendChild(typingIndicator);
    scrollToBottom();
    return typingIndicator;
}

function removeTypingIndicator() {
    if (typingIndicator && chatMessages.contains(typingIndicator)) {
        chatMessages.removeChild(typingIndicator);
    }
    typingIndicator = null;
}

async function initAIClient() {
    try {
        const mod = await import("@google/generative-ai");
        // Importamos la clase correcta del SDK
        const GoogleGenerativeAI = mod?.GoogleGenerativeAI || mod?.default?.GoogleGenerativeAI;
        
        if (!GoogleGenerativeAI) throw new Error('GoogleGenerativeAI no encontrado en el módulo');
        
        // Se instancia pasando directamente la API Key
        client = new GoogleGenerativeAI(GEMINI_API_KEY);
        hasAI = true;
    } catch (err) {
        console.warn('No se pudo cargar @google/generative-ai dinámicamente:', err);
        hasAI = false;
    }
}

function ensureChatUI() {
    // Si ya existe, enlaza elementos
    chatPanel = document.getElementById("chat-panel");
    if (!chatPanel) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <button id="chat-toggle-button" class="chat-toggle-button" type="button">
          <i class="fas fa-comments"></i>
          Chat ASTRO
        </button>

        <div id="chat-panel" class="chat-panel" aria-hidden="true">
          <header class="chat-header">
            <div>
              <div class="chat-title">ASTRO Asistente</div>
              <div class="chat-subtitle">Chat bancario inteligente</div>
            </div>
            <button id="chat-close-button" class="chat-close-button" type="button" aria-label="Cerrar chat">&times;</button>
          </header>

          <div id="chat-messages" class="chat-messages" role="log" aria-live="polite"></div>

          <form id="chat-form" class="chat-form">
            <input id="chat-input" class="chat-input" type="text" placeholder="Escribe tu pregunta..." autocomplete="off" />
            <button class="chat-send-button" type="submit">Enviar</button>
          </form>
        </div>
        `;
        document.body.appendChild(wrapper);
        // now get chatPanel reference
        chatPanel = document.getElementById("chat-panel");
    }

    chatToggleButton = document.getElementById("chat-toggle-button");
    chatCloseButton = document.getElementById("chat-close-button");
    chatMessages = document.getElementById("chat-messages");
    chatForm = document.getElementById("chat-form");
    chatInput = document.getElementById("chat-input");
}

function attachHandlers() {
    if (!chatToggleButton || !chatPanel) return;

    // avoid double-binding
    chatToggleButton.replaceWith(chatToggleButton.cloneNode(true));
    chatToggleButton = document.getElementById("chat-toggle-button");

    chatToggleButton.addEventListener("click", () => {
        chatPanel.classList.toggle("open");
        const isOpen = chatPanel.classList.contains("open");
        chatPanel.setAttribute("aria-hidden", !isOpen);
        if (isOpen) setTimeout(() => chatInput && chatInput.focus(), 80);
    });

    if (chatCloseButton) {
        chatCloseButton.addEventListener("click", () => {
            chatPanel.classList.remove("open");
            chatPanel.setAttribute("aria-hidden", "true");
        });
    }

    if (chatForm) {
        chatForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (isSending) return;
            const prompt = chatInput?.value.trim();
            if (!prompt) return;

            chatMessages.appendChild(createMessageElement(prompt, "user"));
            if (chatInput) chatInput.value = "";
            scrollToBottom();

            setTypingState(true);
            addTypingIndicator();

            try {
                const answer = hasAI ? await askGemini(prompt) : "(Modo demo) Respuesta de ejemplo: disculpa, el servicio de IA no está disponible.";
                removeTypingIndicator();
                chatMessages.appendChild(createMessageElement(answer, "assistant"));
            } catch (error) {
                removeTypingIndicator();
                chatMessages.appendChild(createMessageElement(
                    "Ha ocurrido un error al conectar con Gemini. Intenta de nuevo más tarde.",
                    "assistant"
                ));
                console.error("Gemini error:", error);
            } finally {
                setTypingState(false);
                scrollToBottom();
            }
        });
    }

    // Auto-scroll cuando se añadan nodos
    if (chatMessages) {
        const observer = new MutationObserver(() => scrollToBottom());
        observer.observe(chatMessages, { childList: true, subtree: true });
    }
}

async function initChat() {
    ensureChatUI();
    attachHandlers();
    await initAIClient();
}

// Inicializar al cargar el módulo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
} else {
    initChat();
}
