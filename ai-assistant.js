// ═══════════════════════════════════════════════════════════════════
// Floating AI Chat Assistance Component for PT SMM Dashboard
// ═══════════════════════════════════════════════════════════════════

(function () {
  if (window.__smmAiAssistantInstalled) return;
  window.__smmAiAssistantInstalled = true;

  const PAGE_LABELS = {
    overview: "Plant Overview",
    jetflow: "Jetflow Dyeing Machines",
    calator: "Calator Inspection & Stenter",
    dryer: "Dryer Stenter",
    kalender: "Kalender Finishing",
    utilities: "Utilities (Power & Steam)",
    chemical: "Chemical Dispensing",
    solar: "Solar Fueling System",
    alarms: "Alarms & Deviation Events",
    trends: "Historical Trends",
    health: "Data Health & Collector",
  };

  function getActivePageKey() {
    if (window.state && window.state.page) return window.state.page;
    const breadcrumb = document.getElementById("breadcrumb-page");
    if (breadcrumb && breadcrumb.textContent) {
      const text = breadcrumb.textContent.trim().toLowerCase();
      for (const [k, v] of Object.entries(PAGE_LABELS)) {
        if (v.toLowerCase().includes(text) || text.includes(k)) return k;
      }
    }
    const activeNav = document.querySelector(".nav-item.active");
    if (activeNav && activeNav.dataset.page) return activeNav.dataset.page;
    return "overview";
  }

  function getPageLabel(key) {
    return PAGE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  function getSelectedMachine() {
    const page = getActivePageKey();
    if (window.state && window.state.selected && window.state.selected[page]) {
      return window.state.selected[page];
    }
    return null;
  }

  function getUserSession() {
    const nameEl = document.getElementById("session-user-name");
    const roleEl = document.getElementById("session-user-role");
    return {
      userName: nameEl?.textContent?.trim() || "Operator",
      userRole: roleEl?.textContent?.trim() || "Authorized user",
    };
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatMarkdown(text) {
    if (!text) return "";
    let html = escapeHtml(text);

    // Code blocks ```code```
    html = html.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Italic *text*
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Headers ###
    html = html.replace(/^### (.*$)/gim, "<h4>$1</h4>");
    html = html.replace(/^## (.*$)/gim, "<h3>$1</h3>");
    // List items - item
    html = html.replace(/^- (.*$)/gim, "<li>$1</li>");
    // Wrap consecutive <li> into <ul>
    html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    // Paragraph breaks
    html = html.replace(/\n\n/g, "</p><p>");
    html = `<p>${html.replace(/\n/g, "<br>")}</p>`;
    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, "");
    return html;
  }

  const STORAGE_KEY_HISTORY = "smm_ai_chat_history_v1";
  const STORAGE_KEY_PROMPT = "smm_ai_custom_prompt_v1";
  const STORAGE_KEY_ROLE = "smm_ai_custom_role_v1";
  const STORAGE_KEY_MODEL = "smm_ai_custom_model_v1";

  function loadChatHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveChatHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(-40)));
    } catch {}
  }

  function getCustomSettings() {
    return {
      customPrompt: localStorage.getItem(STORAGE_KEY_PROMPT) || "",
      customRole: localStorage.getItem(STORAGE_KEY_ROLE) || "",
      selectedModel: localStorage.getItem(STORAGE_KEY_MODEL) || "mlx-community/Llama-3.2-1B-Instruct-4bit",
    };
  }

  function saveCustomSettings(settings = {}) {
    if (settings.customPrompt !== undefined) localStorage.setItem(STORAGE_KEY_PROMPT, settings.customPrompt);
    if (settings.customRole !== undefined) localStorage.setItem(STORAGE_KEY_ROLE, settings.customRole);
    if (settings.selectedModel !== undefined) localStorage.setItem(STORAGE_KEY_MODEL, settings.selectedModel);
  }

  let isAiOnline = false;
  let activeAiEngine = "offline";
  let activeAiModel = "offline";
  let isSending = false;

  async function checkAiStatus() {
    try {
      const res = await fetch("/api/v1/ai-status", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        isAiOnline = Boolean(data.online);
        activeAiEngine = data.engine || "offline";
        activeAiModel = data.activeModel || "offline";
        if (isAiOnline && activeAiModel && activeAiModel !== "offline") {
          localStorage.setItem(STORAGE_KEY_MODEL, activeAiModel);
        }
        updateStatusBadge();
        return;
      }
    } catch {}

    // Fallback path
    try {
      const fallbackRes = await fetch("/api/ai-status", { cache: "no-store" });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        isAiOnline = Boolean(data.online);
        activeAiEngine = data.engine || "offline";
        activeAiModel = data.activeModel || "offline";
        updateStatusBadge();
        return;
      }
    } catch {}

    isAiOnline = false;
    activeAiEngine = "offline";
    activeAiModel = "offline";
    updateStatusBadge();
  }

  function updateStatusBadge() {
    const badge = document.getElementById("aiFabBadge");
    const pill = document.getElementById("aiContextPill");
    const footerModel = document.getElementById("aiFooterModel");

    const pageName = getPageLabel(getActivePageKey());
    const statusText = isAiOnline ? "🟢 AI Online" : "🔴 AI Offline";

    if (badge) {
      if (isAiOnline) {
        badge.className = "ai-fab-badge";
        badge.innerHTML = "<span>●</span> ON";
      } else {
        badge.className = "ai-fab-badge offline";
        badge.innerHTML = "<span>●</span> OFF";
      }
    }

    if (pill) {
      pill.innerHTML = `Konteks: ${pageName} · ${statusText}`;
    }

    if (footerModel) {
      footerModel.textContent = isAiOnline
        ? `${activeAiEngine.toUpperCase()}: ${activeAiModel}`
        : "Server AI Offline";
    }
  }

  function createAiWidget() {
    if (document.getElementById("smmAiAssistantRoot")) return;

    const root = document.createElement("div");
    root.id = "smmAiAssistantRoot";
    root.className = "ai-fab-container";

    root.innerHTML = `
      <!-- Chat Window Drawer -->
      <div class="ai-chat-window hidden" id="aiChatWindow" role="dialog" aria-label="Asisten AI PT SMM">
        <div class="ai-chat-header">
          <div class="ai-chat-title-group">
            <div class="ai-chat-avatar">✨</div>
            <div>
              <h3>AI Assistant PT SMM</h3>
              <div class="ai-chat-context-pill" id="aiContextPill">Konteks: Plant Overview · 🔴 Memeriksa...</div>
            </div>
          </div>
          <div class="ai-chat-header-actions">
            <button class="ai-chat-btn-icon" id="aiPromptSettingsBtn" title="Pengaturan Prompt & Persona AI" type="button">⚙️</button>
            <button class="ai-chat-btn-icon" id="aiClearBtn" title="Hapus Riwayat Chat" type="button">🗑️</button>
            <button class="ai-chat-btn-icon" id="aiMinimizeBtn" title="Tutup Asisten" type="button">✕</button>
          </div>
        </div>

        <!-- Prompt Settings Subpanel -->
        <div class="ai-settings-panel hidden" id="aiSettingsPanel">
          <div class="ai-settings-head">
            <h4>⚙️ Pengaturan Prompt & Persona AI</h4>
            <button class="ai-chat-btn-icon" id="aiCloseSettingsBtn" type="button">✕</button>
          </div>
          <div class="ai-settings-body">
            <label class="ai-settings-label">
              <span>Persona / Peran AI:</span>
              <input class="ai-settings-input" id="aiRoleInput" placeholder="Contoh: Senior Automation & MES Specialist PT SMM..." />
            </label>
            <label class="ai-settings-label">
              <span>Instruksi Khusus (Custom Prompt):</span>
              <textarea class="ai-settings-textarea" id="aiCustomPromptInput" rows="2" placeholder="Contoh: Utamakan analisis suhu chamber Dryer dan efisiensi celup Jetflow..."></textarea>
            </label>
            <div class="ai-settings-actions">
              <button class="ai-settings-btn-ghost" id="aiResetPromptBtn" type="button">Reset Default</button>
              <button class="ai-settings-btn-primary" id="aiSavePromptBtn" type="button">Simpan</button>
            </div>
          </div>
        </div>

        <!-- Chat Body -->
        <div class="ai-chat-body" id="aiChatBody">
          <!-- Suggestion Chips -->
          <div class="ai-suggestions-container" id="aiSuggestions">
            <button class="ai-suggestion-chip" type="button">Status mesin Jetflow & Calator saat ini?</button>
            <button class="ai-suggestion-chip" type="button">Berapa mesin yang sedang running & idle?</button>
            <button class="ai-suggestion-chip" type="button">Apakah ada alarm aktif atau peringatan?</button>
            <button class="ai-suggestion-chip" type="button">Cek volume & level tangki solar fueling</button>
            <button class="ai-suggestion-chip" type="button">Bagaimana suhu chamber Dryer terkini?</button>
          </div>
          <div id="aiMessageList"></div>
        </div>

        <!-- Footer / Input Area -->
        <div class="ai-chat-footer">
          <form class="ai-chat-input-form" id="aiChatForm">
            <textarea
              class="ai-chat-textarea"
              id="aiChatInput"
              rows="1"
              placeholder="Tanya telemetri, batch, alarm, atau status mesin..."
              required
            ></textarea>
            <button class="ai-chat-send-btn" id="aiSendBtn" type="submit" title="Kirim Pesan">➤</button>
          </form>
          <div class="ai-chat-model-info">
            <span id="aiFooterModel">Memeriksa status AI...</span>
            <span>RAG Live Telemetry (5s)</span>
          </div>
        </div>
      </div>

      <!-- Floating Action Button -->
      <button class="ai-fab-button" id="aiFabBtn" type="button" aria-label="Buka AI Chat Assistant">
        <span class="ai-fab-icon">✨</span>
        <span class="ai-fab-badge" id="aiFabBadge"><span>●</span> ...</span>
      </button>
      <div class="ai-fab-tooltip">AI Automation Assistant</div>
    `;

    document.body.appendChild(root);
    bindEvents();
    renderHistory();
    checkAiStatus();

    // Polling AI status every 15 seconds
    setInterval(checkAiStatus, 15000);
  }

  function renderHistory() {
    const list = document.getElementById("aiMessageList");
    if (!list) return;

    const history = loadChatHistory();
    list.innerHTML = "";

    if (history.length === 0) {
      const welcome = document.createElement("div");
      welcome.className = "ai-msg assistant";
      welcome.innerHTML = `
        <div class="ai-msg-avatar">✨</div>
        <div class="ai-msg-bubble">
          <p>Halo! Saya <strong>Asisten AI Otomasi PT SMM</strong>. Saya memiliki akses langsung ke data telemetri mesin, batch produksi, alarm, instrumen, dan tangki solar dari database operasional.</p>
          <p>Silakan tanyakan status mesin aktual atau klik saran pertanyaan di atas.</p>
        </div>
      `;
      list.appendChild(welcome);
      return;
    }

    for (const msg of history) {
      appendMessageToDom(msg.role, msg.text, msg.time, msg.model);
    }
    scrollToBottom();
  }

  function appendMessageToDom(role, text, timeStr, model) {
    const list = document.getElementById("aiMessageList");
    if (!list) return;

    const el = document.createElement("div");
    el.className = `ai-msg ${role}`;

    const time = timeStr || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const formatted = formatMarkdown(text);

    if (role === "user") {
      el.innerHTML = `
        <div class="ai-msg-bubble">${formatted}</div>
        <div class="ai-msg-avatar">👤</div>
      `;
    } else {
      const meta = model ? `<div class="ai-msg-meta"><span>${model}</span><span>${time}</span></div>` : `<div class="ai-msg-time">${time}</div>`;
      el.innerHTML = `
        <div class="ai-msg-avatar">✨</div>
        <div class="ai-msg-bubble">
          ${formatted}
          ${meta}
        </div>
      `;
    }

    list.appendChild(el);
    scrollToBottom();
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    const list = document.getElementById("aiMessageList");
    if (!list) return;

    const el = document.createElement("div");
    el.id = "aiTypingIndicator";
    el.className = "ai-msg assistant";
    el.innerHTML = `
      <div class="ai-msg-avatar">✨</div>
      <div class="ai-typing">
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
      </div>
    `;
    list.appendChild(el);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById("aiTypingIndicator");
    if (el) el.remove();
  }

  function scrollToBottom() {
    const body = document.getElementById("aiChatBody");
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function createStreamingMessageBubble(model) {
    const list = document.getElementById("aiMessageList");
    if (!list) return null;

    const el = document.createElement("div");
    el.className = "ai-msg assistant";
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    el.innerHTML = `
      <div class="ai-msg-avatar">✨</div>
      <div class="ai-msg-bubble">
        <div class="ai-msg-content"></div>
        <div class="ai-msg-meta"><span>${model || "mlx:Llama-3.2-1B"}</span><span>${time}</span></div>
      </div>
    `;

    list.appendChild(el);
    scrollToBottom();

    const contentEl = el.querySelector(".ai-msg-content");
    return {
      element: el,
      update(text) {
        if (contentEl) {
          contentEl.innerHTML = formatMarkdown(text);
          scrollToBottom();
        }
      }
    };
  }

  async function handleUserSubmit(messageText) {
    const text = (messageText || "").trim();
    if (!text || isSending) return;

    const input = document.getElementById("aiChatInput");
    if (input) input.value = "";

    isSending = true;
    const sendBtn = document.getElementById("aiSendBtn");
    if (sendBtn) sendBtn.disabled = true;

    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    appendMessageToDom("user", text, time);

    const history = loadChatHistory();
    history.push({ role: "user", text, time });
    saveChatHistory(history);

    showTypingIndicator();

    const userSession = getUserSession();
    const settings = getCustomSettings();

    const payload = {
      message: text,
      context: {
        activePage: getActivePageKey(),
        role: userSession.userRole,
        activeRole: userSession.userRole,
        selectedMachine: getSelectedMachine(),
        customRole: settings.customRole || undefined,
        customPrompt: settings.customPrompt || undefined,
        selectedModel: isAiOnline && activeAiModel && activeAiModel !== "offline"
          ? activeAiModel
          : (settings.selectedModel || undefined),
        history: history.slice(-4),
      },
    };

    try {
      const res = await fetch("/api/v1/ai-assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream, application/json",
        },
        body: JSON.stringify(payload),
      });

      removeTypingIndicator();

      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("text/event-stream") && res.body) {
        const streamBubble = createStreamingMessageBubble(activeAiModel);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;
            if (trimmed === "data: [DONE]") continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.token) {
                  fullReply += parsed.token;
                  if (streamBubble) streamBubble.update(fullReply);
                }
              } catch {}
            }
          }
        }

        if (!fullReply) {
          fullReply = "Tidak ada balasan dari server AI.";
          if (streamBubble) streamBubble.update(fullReply);
        }

        history.push({
          role: "assistant",
          text: fullReply,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          model: activeAiModel,
        });
        saveChatHistory(history);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || "Tidak ada balasan dari server AI.";
        const replyModel = data.model || activeAiModel;
        appendMessageToDom("assistant", replyText, null, replyModel);
        history.push({ role: "assistant", text: replyText, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), model: replyModel });
        saveChatHistory(history);
      } else {
        const errorText = `⚠️ Gagal menghubungi server AI (HTTP ${res.status}).`;
        appendMessageToDom("assistant", errorText);
      }
    } catch {
      // Fallback endpoint
      try {
        const fallbackRes = await fetch("/api/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        removeTypingIndicator();

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const replyText = data.reply || "Tidak ada balasan dari server AI.";
          const replyModel = data.model || activeAiModel;
          appendMessageToDom("assistant", replyText, null, replyModel);
          history.push({ role: "assistant", text: replyText, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), model: replyModel });
          saveChatHistory(history);
        } else {
          appendMessageToDom("assistant", "⚠️ Layanan AI tidak dapat dihubungi saat ini.");
        }
      } catch (err) {
        removeTypingIndicator();
        appendMessageToDom("assistant", `⚠️ Koneksi gagal: ${err instanceof Error ? err.message : err}`);
      }
    } finally {
      isSending = false;
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  }

  function bindEvents() {
    const fabBtn = document.getElementById("aiFabBtn");
    const chatWindow = document.getElementById("aiChatWindow");
    const minBtn = document.getElementById("aiMinimizeBtn");
    const clearBtn = document.getElementById("aiClearBtn");
    const form = document.getElementById("aiChatForm");
    const input = document.getElementById("aiChatInput");
    const suggestions = document.getElementById("aiSuggestions");

    const settingsBtn = document.getElementById("aiPromptSettingsBtn");
    const settingsPanel = document.getElementById("aiSettingsPanel");
    const closeSettingsBtn = document.getElementById("aiCloseSettingsBtn");
    const saveSettingsBtn = document.getElementById("aiSavePromptBtn");
    const resetSettingsBtn = document.getElementById("aiResetPromptBtn");
    const roleInput = document.getElementById("aiRoleInput");
    const promptInput = document.getElementById("aiCustomPromptInput");

    fabBtn?.addEventListener("click", () => {
      chatWindow?.classList.toggle("hidden");
      if (!chatWindow?.classList.contains("hidden")) {
        checkAiStatus();
        updateStatusBadge();
        input?.focus();
        scrollToBottom();
      }
    });

    minBtn?.addEventListener("click", () => {
      chatWindow?.classList.add("hidden");
    });

    clearBtn?.addEventListener("click", () => {
      if (confirm("Hapus semua riwayat percakapan AI Assistant?")) {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        renderHistory();
      }
    });

    // Suggestion chips click
    suggestions?.addEventListener("click", (e) => {
      const chip = e.target.closest(".ai-suggestion-chip");
      if (chip) {
        handleUserSubmit(chip.textContent.trim());
      }
    });

    // Form submit
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserSubmit(input?.value);
    });

    // Enter to submit, Shift+Enter for newline
    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserSubmit(input.value);
      }
    });

    // Settings Toggle
    settingsBtn?.addEventListener("click", () => {
      settingsPanel?.classList.toggle("hidden");
      if (!settingsPanel?.classList.contains("hidden")) {
        const current = getCustomSettings();
        if (roleInput) roleInput.value = current.customRole;
        if (promptInput) promptInput.value = current.customPrompt;
      }
    });

    closeSettingsBtn?.addEventListener("click", () => {
      settingsPanel?.classList.add("hidden");
    });

    saveSettingsBtn?.addEventListener("click", () => {
      saveCustomSettings({
        customRole: roleInput?.value?.trim() || "",
        customPrompt: promptInput?.value?.trim() || "",
      });
      settingsPanel?.classList.add("hidden");
    });

    resetSettingsBtn?.addEventListener("click", () => {
      if (roleInput) roleInput.value = "";
      if (promptInput) promptInput.value = "";
      saveCustomSettings({ customRole: "", customPrompt: "" });
      settingsPanel?.classList.add("hidden");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createAiWidget);
  } else {
    createAiWidget();
  }
})();
