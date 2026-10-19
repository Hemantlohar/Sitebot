(async function () {
  if (window.aiWidgetLoaded) return;
  window.aiWidgetLoaded = true;

  // =========================================================
  // STYLE
  // =========================================================

  const style = document.createElement("style");

  style.innerHTML = `
    .ai-widget-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #888;
      display: inline-block;
      animation: aiWidgetTyping 1.2s infinite;
    }

    .ai-widget-dot:nth-child(2) {
      animation-delay: .2s;
    }

    .ai-widget-dot:nth-child(3) {
      animation-delay: .4s;
    }

    @keyframes aiWidgetTyping {
      0% {
        transform: translateY(0);
        opacity: .3;
      }

      50% {
        transform: translateY(-5px);
        opacity: 1;
      }

      100% {
        transform: translateY(0);
        opacity: .3;
      }
    }
  `;

  document.head.appendChild(style);

  // =========================================================
  // GET BOT ID
  // =========================================================

  const script = document.currentScript;
  const botId = script?.getAttribute("data-bot-id");

  if (!botId) {
    console.error("AI Widget: Missing bot id");
    return;
  }

 const API = new URL(script.src).origin;

  // =========================================================
  // LOAD BOT CONFIG
  // =========================================================

  let bot;

  try {
    const configResponse = await fetch(
      `${API}/api/widget/${botId}`
    );

    const configData = await configResponse.json();

    if (!configData.success) {
      console.error(
        "AI Widget: Couldn't load widget config"
      );
      return;
    }

    bot = configData.config;
  } catch (error) {
    console.error(
      "AI Widget: Config loading failed",
      error
    );
    return;
  }

  console.log("BOT CONFIG:", bot);
  const isDark = bot.theme === "dark";

const theme = {
  chatBackground: isDark
    ? "#18181b"
    : "#ffffff",

  messagesBackground: isDark
    ? "#09090b"
    : "#ffffff",

  assistantBubble: isDark
    ? "#27272a"
    : "#F8FAFC",

  assistantText: isDark
    ? "#f4f4f5"
    : "#111111",

  inputArea: isDark
    ? "#18181b"
    : "#ffffff",

  inputBackground: isDark
    ? "#27272a"
    : "#ffffff",

  inputText: isDark
    ? "#ffffff"
    : "#111111",

  border: isDark
    ? "#3f3f46"
    : "#dddddd",

  suggestionBackground: isDark
    ? "#27272a"
    : "#ffffff",

  suggestionText: isDark
    ? "#f4f4f5"
    : "#111111",
};

  // =========================================================
  // LOCAL STORAGE
  // =========================================================

  const STORAGE_KEY = `ai_chat_${botId}`;

  let savedMessages = [];

  try {
    savedMessages = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(savedMessages)) {
      savedMessages = [];
    }
  } catch (error) {
    console.error(
      "AI Widget: Invalid saved chat history"
    );

    localStorage.removeItem(STORAGE_KEY);
    savedMessages = [];
  }

  let history = [...savedMessages];

  // =========================================================
// VISITOR ID
// =========================================================

const VISITOR_KEY =
  `ai_visitor_id_${botId}`;

let visitorId =
  localStorage.getItem(VISITOR_KEY);

if (!visitorId) {
  visitorId = crypto.randomUUID();

  localStorage.setItem(
    VISITOR_KEY,
    visitorId
  );
}


// =========================================================
// CONVERSATION ID
// =========================================================

const CONVERSATION_KEY =
  `ai_conversation_id_${botId}`;

let conversationId =
  sessionStorage.getItem(CONVERSATION_KEY);

if (!conversationId) {
  conversationId = crypto.randomUUID();

  sessionStorage.setItem(
    CONVERSATION_KEY,
    conversationId
  );
}

  // =========================================================
  // SECURITY HELPER
  // =========================================================

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =========================================================
  // FLOATING BUTTON
  // =========================================================

  const button = document.createElement("button");

  button.type = "button";
  button.setAttribute(
    "aria-label",
    "Open AI chatbot"
  );

  if (bot.logo_url) {
    const logo = document.createElement("img");

    logo.src = bot.logo_url;
    logo.alt = bot.bot_name || "Chatbot";

    Object.assign(logo.style, {
  display: "block",

  width: "100%",
  height: "100%",

  minWidth: "100%",
  minHeight: "100%",

  borderRadius: "50%",

  objectFit: "cover",
  objectPosition: "center",

  padding: "0",
  margin: "0",

  border: "none",
  boxSizing: "border-box",

  pointerEvents: "none",
});

    button.appendChild(logo);
  } else {
    button.textContent = "🤖";
  }

  Object.assign(button.style, {
    position: "fixed",

    right:
      bot.widget_position === "right"
        ? "24px"
        : "auto",

    left:
      bot.widget_position === "left"
        ? "24px"
        : "auto",

    bottom: "24px",

    width: "68px",
height: "68px",

minWidth: "68px",
minHeight: "68px",

padding: "0",
margin: "0",

borderRadius: "50%",
border: "none",

boxSizing: "border-box",

background:
  bot.primary_color || "#2563eb",

    color: "#fff",
    fontSize: "28px",

    cursor: "pointer",

    zIndex: "999999",

    boxShadow:
      "0 12px 35px rgba(0,0,0,.25)",

    transition: "all .25s ease",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    overflow: "hidden",
  });

  button.onmouseenter = () => {
    button.style.transform = "scale(1.08)";
  };

  button.onmouseleave = () => {
    button.style.transform = "scale(1)";
  };

  document.body.appendChild(button);

  // =========================================================
  // CHAT WINDOW
  // =========================================================

  const chat = document.createElement("div");

  Object.assign(chat.style, {
    position: "fixed",

    right:
      bot.widget_position === "right"
        ? "20px"
        : "auto",

    left:
      bot.widget_position === "left"
        ? "20px"
        : "auto",

    bottom: "105px",

    width:
      (bot.widget_width || 380) + "px",

    maxWidth: "calc(100vw - 40px)",

    height: "620px",
    maxHeight: "calc(100vh - 130px)",

    background: theme.chatBackground,

    borderRadius:
      (bot.border_radius || 12) + "px",

    display: "none",
    flexDirection: "column",

    overflow: "hidden",

    boxShadow:
      "0 25px 60px rgba(0,0,0,.25)",

    zIndex: "999999",

    fontFamily: "Arial, sans-serif",
  });

  chat.innerHTML = `
    <div
      style="
        background: linear-gradient(
          135deg,
          ${bot.header_color || "#2563eb"},
          ${bot.primary_color || "#4f46e5"}
        );

        color: white;
        padding: 18px;

        display: flex;
        align-items: center;
        gap: 10px;

        font-weight: 600;
        font-size: 18px;
      "
    >

      ${
        bot.logo_url
          ? `
            <img
              src="${escapeHTML(bot.logo_url)}"
              alt="Bot Logo"
              style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
                background: white;
              "
            />
          `
          : `
            <div
              style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255,255,255,.2);
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              🤖
            </div>
          `
      }

      <div>
        ${escapeHTML(bot.bot_name || "AI Assistant")}
      </div>

      <button
        id="ai-widget-clear-chat"
        type="button"
        style="
          margin-left: auto;
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 13px;
        "
      >
        Clear
      </button>

    </div>


    <div
      id="ai-widget-messages"
      style="
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background: ${theme.messagesBackground};
      "
    >
    </div>


    <div
  style="
    display: flex;
    padding: 10px;
    border-top: 1px solid ${theme.border};
    background: ${theme.inputArea};
  "
>

      <input
        id="ai-widget-input"
        placeholder="Ask anything..."
        autocomplete="off"
        style="
          flex: 1;
          min-width: 0;
          padding: 14px;
          border: 1px solid ${theme.border};
background: ${theme.inputBackground};
color: ${theme.inputText};
          border-radius: 12px;
          outline: none;
        "
      />

      <button
        id="ai-widget-send"
        type="button"
        style="
          margin-left: 10px;
          background:
            ${bot.primary_color || "#2563eb"};
          color: white;
          border: none;
          padding: 14px 18px;
          border-radius: 8px;
          cursor: pointer;
        "
      >
        Send
      </button>

    </div>
  `;

  document.body.appendChild(chat);

  // =========================================================
  // DOM REFERENCES
  // =========================================================

  const messages = chat.querySelector(
    "#ai-widget-messages"
  );

  const input = chat.querySelector(
    "#ai-widget-input"
  );

  const send = chat.querySelector(
    "#ai-widget-send"
  );

  const clear = chat.querySelector(
    "#ai-widget-clear-chat"
  );

  // =========================================================
  // CREATE MESSAGE BUBBLE
  // =========================================================

  function addMessageBubble(role, content) {
    const wrapper =
      document.createElement("div");

    wrapper.style.margin = "10px 0";

    wrapper.style.textAlign =
      role === "user"
        ? "right"
        : "left";

    const bubble =
      document.createElement("div");

    bubble.textContent = content;

    Object.assign(bubble.style, {
      display: "inline-block",

      padding: "14px 18px",

      borderRadius: "18px",

      maxWidth: "80%",

      whiteSpace: "pre-wrap",

      overflowWrap: "break-word",

      background:
  role === "user"
    ? bot.primary_color || "#2563eb"
    : theme.assistantBubble,

color:
  role === "user"
    ? "white"
    : theme.assistantText,
    });

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);

    messages.scrollTop =
      messages.scrollHeight;

    return bubble;
  }

  // =========================================================
  // WELCOME MESSAGE
  // =========================================================

  function renderWelcomeMessage() {
    addMessageBubble(
      "assistant",
      bot.welcome_message ||
        "Hi! How can I help you today?"
    );
  }

  // =========================================================
  // SUGGESTED QUESTIONS
  // =========================================================

  function renderSuggestions() {
    const oldSuggestions =
      messages.querySelector(
        "#ai-widget-suggestions"
      );

    if (oldSuggestions) {
      oldSuggestions.remove();
    }

    const questions =
      bot.suggested_questions || [];

    if (
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return;
    }

    const suggestions =
      document.createElement("div");

    suggestions.id =
      "ai-widget-suggestions";

    Object.assign(suggestions.style, {
      padding: "10px 0",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    });

    questions.forEach((question) => {
      const chip =
        document.createElement("button");

      chip.type = "button";
      chip.innerText = question;

      Object.assign(chip.style, {
  padding: "8px 12px",

  borderRadius: "20px",

  border:
    `1px solid ${theme.border}`,

  background:
    theme.suggestionBackground,

  color:
    theme.suggestionText,

  cursor: "pointer",

  fontSize: "13px",
});

      chip.onclick = () => {
        input.value = question;
        sendMessage();
      };

      suggestions.appendChild(chip);
    });

    messages.appendChild(suggestions);
  }

  // =========================================================
  // RESTORE PREVIOUS CHAT
  // =========================================================

  if (savedMessages.length > 0) {
    savedMessages.forEach((msg) => {
      if (
        msg &&
        typeof msg.content === "string" &&
        (msg.role === "user" ||
          msg.role === "assistant")
      ) {
        addMessageBubble(
          msg.role,
          msg.content
        );
      }
    });
  } else {
    renderWelcomeMessage();
    renderSuggestions();
  }

  // =========================================================
  // CLEAR CHAT
  // =========================================================

 clear.onclick = () => {
  history = [];

  localStorage.removeItem(STORAGE_KEY);

  // Create a new conversation
  conversationId = crypto.randomUUID();

  sessionStorage.setItem(
    CONVERSATION_KEY,
    conversationId
  );

  messages.innerHTML = "";

  renderWelcomeMessage();
  renderSuggestions();

  input.focus();
};

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  let isSending = false;

  async function sendMessage() {
    const question =
      input.value.trim();

    if (!question || isSending) return;

    isSending = true;

    send.disabled = true;
    send.style.opacity = "0.6";
    send.textContent = "Sending...";

    input.value = "";

    const suggestions =
      messages.querySelector(
        "#ai-widget-suggestions"
      );

    if (suggestions) {
      suggestions.remove();
    }

    // IMPORTANT:
    // Save previous history BEFORE adding current question.
    // This prevents sending the same question twice.

    const previousHistory = [...history];

    addMessageBubble(
      "user",
      question
    );

    history.push({
      role: "user",
      content: question,
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history)
    );

    // =====================================================
    // TYPING INDICATOR
    // =====================================================

    const aiWrapper =
      document.createElement("div");

    aiWrapper.style.margin = "12px 0";
    aiWrapper.style.textAlign = "left";

    const aiBubble =
      document.createElement("div");

    aiBubble.innerHTML = `
      <span class="ai-widget-dot"></span>
      <span class="ai-widget-dot"></span>
      <span class="ai-widget-dot"></span>
    `;

    Object.assign(aiBubble.style, {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: theme.assistantBubble,
      padding: "14px 18px",
      borderRadius: "16px",
      boxShadow:
        "0 5px 12px rgba(0,0,0,.08)",
      maxWidth: "80%",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
    });

    aiWrapper.appendChild(aiBubble);
    messages.appendChild(aiWrapper);

    messages.scrollTop =
      messages.scrollHeight;

    // =====================================================
    // API CALL
    // =====================================================

    try {
      const response = await fetch(
        `${API}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

         body: JSON.stringify({
  question,
  websiteId: botId,
  visitorId,
  conversationId,

  // Send only messages BEFORE current question
  history: previousHistory,
}),
        }
      );


      if (!response.ok) {
  let errorMessage =
    "Sorry, something went wrong. Please try again.";

  try {
    const errorData = await response.json();

    if (errorData.paused) {
      errorMessage =
        "This chatbot is currently unavailable.";
    } else if (errorData.error) {
      errorMessage = errorData.error;
    }
  } catch (parseError) {
    console.error(
      "AI Widget: Could not parse API error response",
      parseError
    );
  }

  aiBubble.textContent = errorMessage;

  return;
}

if (!response.body) {
  throw new Error(
    "Chat API returned no response body"
  );
}

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let answer = "";

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) break;

        answer += decoder.decode(
          value,
          { stream: true }
        );

        aiBubble.textContent = answer;

        messages.scrollTop =
          messages.scrollHeight;
      }

      answer += decoder.decode();

      if (!answer.trim()) {
        answer =
          "Sorry, I couldn't generate a response.";
      }

      aiBubble.textContent = answer;

      history.push({
        role: "assistant",
        content: answer,
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history)
      );
    } catch (error) {
      console.error(
        "AI Widget chat error:",
        error
      );

      aiBubble.textContent =
        "Sorry, something went wrong. Please try again.";
    } finally {
      isSending = false;

      send.disabled = false;
      send.style.opacity = "1";
      send.textContent = "Send";

      input.focus();
    }
  }

  // =========================================================
  // EVENTS
  // =========================================================

  send.onclick = sendMessage;

  input.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage();
      }
    }
  );

  // =========================================================
  // OPEN / CLOSE WIDGET
  // =========================================================

  button.onclick = () => {
    if (chat.style.display === "none") {
      chat.style.display = "flex";

      chat.animate(
        [
          {
            opacity: 0,
            transform:
              "translateY(25px) scale(.95)",
          },
          {
            opacity: 1,
            transform:
              "translateY(0) scale(1)",
          },
        ],
        {
          duration: 220,
          fill: "forwards",
        }
      );

      setTimeout(() => {
        input.focus();
      }, 200);
    } else {
      chat.style.display = "none";
    }
  };
})();