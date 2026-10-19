"use client";

import { useState, useEffect } from "react";
import ChatWidget from "@/components/ChatWidget";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Bot,
  ArrowRight,
  Loader2,
  Send,
  Copy,
  Sparkles,
  Package,
  Code2,
  LayoutDashboard,
  Globe,
} from "lucide-react";

const STARS = [
  { t: 6, l: 12, s: 2, d: 0.2 }, { t: 14, l: 34, s: 1.5, d: 1.4 },
  { t: 9, l: 58, s: 2, d: 2.1 }, { t: 22, l: 78, s: 1.5, d: 0.6 },
  { t: 4, l: 92, s: 1.5, d: 1.8 }, { t: 31, l: 8, s: 1.5, d: 2.6 },
  { t: 38, l: 46, s: 2, d: 1.1 }, { t: 27, l: 64, s: 1.5, d: 0.3 },
  { t: 44, l: 88, s: 2, d: 1.6 }, { t: 52, l: 20, s: 1.5, d: 2.3 },
  { t: 61, l: 40, s: 2, d: 0.9 }, { t: 57, l: 70, s: 1.5, d: 1.9 },
  { t: 68, l: 6, s: 1.5, d: 0.5 }, { t: 73, l: 54, s: 2, d: 2.4 },
  { t: 79, l: 82, s: 1.5, d: 1.2 }, { t: 86, l: 30, s: 2, d: 0.8 },
  { t: 91, l: 62, s: 1.5, d: 2.0 }, { t: 15, l: 96, s: 1.5, d: 1.5 },
  { t: 48, l: 4, s: 1.5, d: 0.4 }, { t: 66, l: 94, s: 2, d: 1.7 },
  { t: 82, l: 14, s: 1.5, d: 2.2 }, { t: 96, l: 44, s: 1.5, d: 0.7 },
  { t: 3, l: 70, s: 1.5, d: 1.3 }, { t: 35, l: 24, s: 1.5, d: 2.5 },
];

function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#05070A]"
    >
      {STARS.map((s, i) => (
        <span
          key={i}
          className="bg-star absolute rounded-full bg-white"
          style={{
            top: `${s.t}%`,
            left: `${s.l}%`,
            width: s.s,
            height: s.s,
            animationDelay: `${s.d}s`,
          }}
        />
      ))}

      <div className="absolute -top-56 -left-56 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(255,120,60,0.28),rgba(255,120,60,0)_70%)] blur-2xl" />
      <div className="absolute -bottom-56 -right-56 w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.14),rgba(94,234,212,0)_70%)] blur-2xl" />

      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}

export default function Home() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [widgetCode, setWidgetCode] = useState("");
  const [websiteContent, setWebsiteContent] = useState("");
  const [botConfig, setBotConfig] = useState<any>(null);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [messages, setMessages] = useState<
    { sender: string; text: string }[]
  >([
    {
      sender: "bot",
      text: "Hi! How can I help you today?",
    },
  ]);

  const [products, setProducts] = useState<string[]>([]);
  const [websiteId, setWebsiteId] = useState("");

  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ---------------------------------------
  // LOAD LOGGED-IN USER
  // ---------------------------------------

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setUser(user);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------
  // ANALYZE WEBSITE
  // ---------------------------------------

  async function analyzeWebsite() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!url.trim()) {
      setResult("Please enter a website URL.");
      return;
    }

    try {
      setResult("Analyzing...");
      setBotConfig(null);
      setWidgetCode("");
      setProducts([]);
      setWebsiteId("");
      setIsAnalyzing(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setResult(data.error || "Analysis failed.");
        return;
      }

      if (data.cached) {
        console.log("Loaded from cache");
      }

      setResult(data.analysis || "");
      setBotConfig(data.botConfig);
      setWidgetCode(data.widgetCode || "");
      setWebsiteContent(data.websiteContent || "");
      setProducts(data.products || []);
      setWebsiteId(data.websiteId);

      setChatHistory([]);

      setMessages([
        {
          sender: "bot",
          text:
            data.botConfig?.welcomeMessage ||
            "Hi! How can I help you today?",
        },
      ]);
    } catch (error) {
      console.error(error);
      setResult("Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ---------------------------------------
  // HANDLE CHAT INPUT
  // ---------------------------------------

  async function handleSend() {
    if (!userInput.trim()) return;

    const question = userInput.trim();

    setUserInput("");

    await sendQuestion(question);
  }

  // ---------------------------------------
  // SEND CHAT QUESTION
  // ---------------------------------------

  async function sendQuestion(question: string) {
    if (!question.trim() || !websiteId) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: question,
      },
      {
        sender: "bot",
        text: "",
      },
    ]);

    setIsTyping(true);

    const history = [...chatHistory];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          websiteId,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let answer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        answer += decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) => {
          const updated = [...prev];

          updated[updated.length - 1] = {
            sender: "bot",
            text: answer,
          };

          return updated;
        });
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: "user",
          content: question,
        },
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
        };

        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  }

  // ---------------------------------------
  // COPY WIDGET CODE
  // ---------------------------------------

  function copyWidgetCode() {
    navigator.clipboard.writeText(widgetCode);
    alert("Widget code copied!");
  }

  return (
    <main className="relative min-h-screen text-[#EDEFF4] font-[Inter,sans-serif] selection:bg-[#5EEAD4]/30 selection:text-white">
      <SiteBackground />

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

        .font-display {
          font-family: "Space Grotesk", sans-serif;
        }
        .font-mono {
          font-family: "JetBrains Mono", monospace;
        }

        .bg-star {
          animation: twinkle 3.2s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.9;
          }
        }

        .bg-vignette {
          background: radial-gradient(
            ellipse at center,
            rgba(5, 7, 10, 0) 40%,
            rgba(5, 7, 10, 0.9) 100%
          );
        }

        .dot-a {
          animation: typing-dot 1.2s ease-in-out infinite;
        }
        .dot-b {
          animation: typing-dot 1.2s ease-in-out infinite 0.15s;
        }
        .dot-c {
          animation: typing-dot 1.2s ease-in-out infinite 0.3s;
        }
        @keyframes typing-dot {
          0%,
          60%,
          100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-2px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-star {
            animation: none !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#5EEAD4] flex items-center justify-center text-[#0B0E14] shrink-0">
              <Bot size={22} strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight">
                AI Website Bot Builder
              </h1>
              <p className="mt-1.5 text-[#8A93A6] text-sm md:text-base">
                Enter your website URL and generate an AI chatbot.
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 shrink-0">
            {!user ? (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="text-sm border border-[#232838] text-[#8A93A6] px-4 py-2.5 rounded-lg font-medium hover:border-[#3a4257] hover:text-white transition-colors"
                >
                  Login
                </button>

                <button
                  onClick={() => router.push("/signup")}
                  className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors"
                >
                  Create Account
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            )}
          </div>
        </div>

        {/* WEBSITE URL */}
        <div className="mt-10 bg-[#12161F]/90 backdrop-blur-sm border border-[#232838] rounded-2xl p-5 md:p-6">
          <label className="flex items-center gap-2 font-mono text-xs text-[#5EEAD4] mb-3">
            <Globe size={13} />
            website url
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 bg-[#0B0E14] border border-[#232838] focus:border-[#5EEAD4]/50 outline-none p-3.5 rounded-xl font-mono text-sm placeholder:text-[#4a5266] transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isAnalyzing) {
                  analyzeWebsite();
                }
              }}
            />

            <button
              onClick={analyzeWebsite}
              disabled={isAnalyzing}
              className="bg-[#FF6B4A] hover:bg-[#ff7f5f] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Website
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* WEBSITE ANALYSIS */}
        {result && (
          <div className="mt-6 bg-[#12161F]/90 backdrop-blur-sm border border-[#232838] rounded-2xl p-5 md:p-6">
            <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
              <Sparkles size={17} className="text-[#5EEAD4]" />
              Website Analysis
            </h2>

            <pre className="whitespace-pre-wrap font-mono text-sm text-[#8A93A6] leading-relaxed">
              {result}
            </pre>
          </div>
        )}

        {/* PRODUCTS */}
        {products.length > 0 && (
          <div className="mt-6 bg-[#12161F]/90 backdrop-blur-sm border border-[#232838] rounded-2xl p-5 md:p-6">
            <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <Package size={17} className="text-[#5EEAD4]" />
              Products Found
            </h2>

            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <span
                  key={product}
                  className="font-mono text-xs px-3.5 py-2 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25"
                >
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* NEXT ACTIONS */}
        {websiteId && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() =>
                router.push(`/dashboard/${websiteId}`)
              }
              className="bg-[#FF6B4A] hover:bg-[#ff7f5f] text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              Customize Bot
              <ArrowRight size={17} />
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="border border-[#232838] hover:border-[#3a4257] px-6 py-3.5 rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <LayoutDashboard size={17} />
              Go to Dashboard
            </button>
          </div>
        )}

        {/* GENERATED CHATBOT */}
        {botConfig && (
          <div className="mt-10 bg-[#12161F]/90 backdrop-blur-sm border border-[#232838] rounded-2xl p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-display font-semibold mb-4 flex items-center gap-2">
              <Bot size={20} className="text-[#5EEAD4]" />
              Generated Chatbot
            </h2>

            <div className="border border-[#232838] rounded-xl p-4 md:p-5 bg-[#0B0E14]">
              <h3 className="font-display font-semibold text-lg">
                {botConfig.botName}
              </h3>

              <p className="mt-1.5 text-sm text-[#8A93A6]">
                {botConfig.welcomeMessage}
              </p>

              <div className="mt-5 border border-[#232838] rounded-xl p-3.5 h-64 overflow-y-auto bg-[#12161F]/60">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 flex ${
                      msg.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <span
                      className={`inline-block px-3.5 py-2 rounded-xl text-sm max-w-[80%] leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#FF6B4A] text-[#0B0E14] rounded-br-sm font-medium"
                          : "bg-[#232838] text-[#EDEFF4] rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl rounded-bl-sm bg-[#232838]">
                      <span className="dot-a w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                      <span className="dot-b w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                      <span className="dot-c w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                    </span>
                  </div>
                )}
              </div>

              {/* SUGGESTED QUESTIONS */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(botConfig.suggestedQuestions || []).map(
                  (question: string) => (
                    <button
                      key={question}
                      onClick={() =>
                        sendQuestion(question)
                      }
                      disabled={isTyping}
                      className="font-mono text-xs border border-[#232838] px-3.5 py-2 rounded-full hover:border-[#5EEAD4]/50 hover:text-[#5EEAD4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {question}
                    </button>
                  )
                )}
              </div>

              {/* CHAT INPUT */}
              <div className="mt-4 flex gap-2.5">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) =>
                    setUserInput(e.target.value)
                  }
                  placeholder="Ask anything..."
                  className="flex-1 bg-[#12161F] border border-[#232838] focus:border-[#5EEAD4]/50 outline-none p-3 rounded-xl text-sm placeholder:text-[#4a5266] transition-colors"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !isTyping
                    ) {
                      handleSend();
                    }
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={isTyping}
                  className="bg-[#5EEAD4] hover:bg-[#7ff2e0] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0E14] px-4 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isTyping ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WIDGET INSTALL CODE */}
        {widgetCode && (
          <div className="mt-6 bg-[#12161F]/90 backdrop-blur-sm border border-[#232838] rounded-2xl p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-display font-semibold mb-4 flex items-center gap-2">
              <Code2 size={19} className="text-[#5EEAD4]" />
              Install Widget Code
            </h2>

            <textarea
              readOnly
              value={widgetCode}
              className="w-full h-56 bg-[#0B0E14] border border-[#232838] p-3.5 rounded-xl font-mono text-xs text-[#8A93A6] outline-none resize-none"
            />

            <button
              onClick={copyWidgetCode}
              className="mt-4 bg-[#5EEAD4] hover:bg-[#7ff2e0] text-[#0B0E14] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors"
            >
              <Copy size={16} />
              Copy Widget Code
            </button>
          </div>
        )}
      </div>

      {/* FLOATING CHAT PREVIEW */}
      {botConfig && websiteId && (
        <ChatWidget
          botName={botConfig.botName}
          messages={messages}
          onSendMessage={sendQuestion}
        />
      )}
    </main>
  );
}




















// "use client";

// import { useState, useEffect } from "react";
// import ChatWidget from "@/components/ChatWidget";
// import { useRouter } from "next/navigation";
// import { supabaseClient } from "@/lib/supabaseClient";

// export default function Home() {
//   const router = useRouter();

//   const [url, setUrl] = useState("");
//   const [result, setResult] = useState("");
//   const [widgetCode, setWidgetCode] = useState("");
//   const [websiteContent, setWebsiteContent] = useState("");
//   const [botConfig, setBotConfig] = useState<any>(null);
//   const [userInput, setUserInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [user, setUser] = useState<any>(null);

//   const [messages, setMessages] = useState<
//     { sender: string; text: string }[]
//   >([
//     {
//       sender: "bot",
//       text: "Hi! How can I help you today?",
//     },
//   ]);

//   const [products, setProducts] = useState<string[]>([]);
//   const [websiteId, setWebsiteId] = useState("");

//   const [chatHistory, setChatHistory] = useState<
//     { role: string; content: string }[]
//   >([]);

//   const [isAnalyzing, setIsAnalyzing] = useState(false);

//   // ---------------------------------------
//   // LOAD LOGGED-IN USER
//   // ---------------------------------------

//   useEffect(() => {
//     async function loadUser() {
//       const {
//         data: { user },
//       } = await supabaseClient.auth.getUser();

//       setUser(user);
//     }

//     loadUser();

//     const {
//       data: { subscription },
//     } = supabaseClient.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user ?? null);
//       }
//     );

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   // ---------------------------------------
//   // ANALYZE WEBSITE
//   // ---------------------------------------

//   async function analyzeWebsite() {
//     if (!user) {
//       router.push("/login");
//       return;
//     }

//     if (!url.trim()) {
//       setResult("Please enter a website URL.");
//       return;
//     }

//     try {
//       setResult("Analyzing...");
//       setBotConfig(null);
//       setWidgetCode("");
//       setProducts([]);
//       setWebsiteId("");
//       setIsAnalyzing(true);

//       const res = await fetch("/api/analyze", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           url: url.trim(),
//         }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         setResult(data.error || "Analysis failed.");
//         return;
//       }

//       if (data.cached) {
//         console.log("Loaded from cache");
//       }

//       setResult(data.analysis || "");
//       setBotConfig(data.botConfig);
//       setWidgetCode(data.widgetCode || "");
//       setWebsiteContent(data.websiteContent || "");
//       setProducts(data.products || []);
//       setWebsiteId(data.websiteId);

//       setChatHistory([]);

//       setMessages([
//         {
//           sender: "bot",
//           text:
//             data.botConfig?.welcomeMessage ||
//             "Hi! How can I help you today?",
//         },
//       ]);
//     } catch (error) {
//       console.error(error);
//       setResult("Something went wrong.");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   }

//   // ---------------------------------------
//   // HANDLE CHAT INPUT
//   // ---------------------------------------

//   async function handleSend() {
//     if (!userInput.trim()) return;

//     const question = userInput.trim();

//     setUserInput("");

//     await sendQuestion(question);
//   }

//   // ---------------------------------------
//   // SEND CHAT QUESTION
//   // ---------------------------------------

//   async function sendQuestion(question: string) {
//     if (!question.trim() || !websiteId) return;

//     setMessages((prev) => [
//       ...prev,
//       {
//         sender: "user",
//         text: question,
//       },
//       {
//         sender: "bot",
//         text: "",
//       },
//     ]);

//     setIsTyping(true);

//     const history = [...chatHistory];

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           question,
//           websiteId,
//           history,
//         }),
//       });

//       if (!res.ok) {
//         throw new Error("Chat request failed");
//       }

//       if (!res.body) {
//         throw new Error("No response body");
//       }

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();

//       let answer = "";

//       while (true) {
//         const { value, done } = await reader.read();

//         if (done) break;

//         answer += decoder.decode(value, {
//           stream: true,
//         });

//         setMessages((prev) => {
//           const updated = [...prev];

//           updated[updated.length - 1] = {
//             sender: "bot",
//             text: answer,
//           };

//           return updated;
//         });
//       }

//       setChatHistory((prev) => [
//         ...prev,
//         {
//           role: "user",
//           content: question,
//         },
//         {
//           role: "assistant",
//           content: answer,
//         },
//       ]);
//     } catch (error) {
//       console.error(error);

//       setMessages((prev) => {
//         const updated = [...prev];

//         updated[updated.length - 1] = {
//           sender: "bot",
//           text: "Sorry, I couldn't process your request.",
//         };

//         return updated;
//       });
//     } finally {
//       setIsTyping(false);
//     }
//   }

//   // ---------------------------------------
//   // COPY WIDGET CODE
//   // ---------------------------------------

//   function copyWidgetCode() {
//     navigator.clipboard.writeText(widgetCode);
//     alert("Widget code copied!");
//   }

//   return (
//     <main className="min-h-screen p-10">
//       {/* HEADER */}

//       <div className="flex justify-between items-start gap-6">
//         <div>
//           <h1 className="text-4xl font-bold">
//             AI Website Bot Builder
//           </h1>

//           <p className="mt-4">
//             Enter your website URL and generate an AI chatbot.
//           </p>
//         </div>

//         <div className="flex gap-3">
//           {!user ? (
//             <>
//               <button
//                 onClick={() => router.push("/login")}
//                 className="bg-black text-white px-5 py-2 rounded"
//               >
//                 Login
//               </button>

//               <button
//                 onClick={() => router.push("/signup")}
//                 className="border px-5 py-2 rounded"
//               >
//                 Create Account
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={() => router.push("/dashboard")}
//               className="bg-green-600 text-white px-5 py-2 rounded"
//             >
//               Dashboard
//             </button>
//           )}
//         </div>
//       </div>

//       {/* WEBSITE URL */}

//       <input
//         type="text"
//         value={url}
//         onChange={(e) => setUrl(e.target.value)}
//         placeholder="https://example.com"
//         className="border p-3 mt-8 w-full rounded"
//         onKeyDown={(e) => {
//           if (e.key === "Enter" && !isAnalyzing) {
//             analyzeWebsite();
//           }
//         }}
//       />

//       <button
//         onClick={analyzeWebsite}
//         disabled={isAnalyzing}
//         className="bg-black text-white px-5 py-3 mt-4 rounded disabled:opacity-50"
//       >
//         {isAnalyzing
//           ? "Analyzing..."
//           : "Analyze Website"}
//       </button>

//       {/* WEBSITE ANALYSIS */}

//       {result && (
//         <div className="mt-8 border p-4 rounded">
//           <h2 className="font-bold text-xl mb-2">
//             Website Analysis
//           </h2>

//           <pre className="whitespace-pre-wrap">
//             {result}
//           </pre>
//         </div>
//       )}

//       {/* PRODUCTS */}

//       {products.length > 0 && (
//         <div className="mt-6 border p-4 rounded shadow">
//           <h2 className="font-bold text-xl mb-3">
//             Products Found
//           </h2>

//           <div className="flex flex-wrap gap-2">
//             {products.map((product) => (
//               <span
//                 key={product}
//                 className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full"
//               >
//                 {product}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* NEXT ACTIONS */}

//       {websiteId && (
//         <div className="mt-8 flex flex-wrap gap-3">
//           <button
//             onClick={() =>
//               router.push(`/dashboard/${websiteId}`)
//             }
//             className="bg-black text-white px-6 py-3 rounded-lg"
//           >
//             Customize Bot
//           </button>

//           <button
//             onClick={() => router.push("/dashboard")}
//             className="border px-6 py-3 rounded-lg"
//           >
//             Go to Dashboard
//           </button>
//         </div>
//       )}

//       {/* GENERATED CHATBOT */}

//       {botConfig && (
//         <div className="mt-10 border p-5 rounded shadow">
//           <h2 className="text-2xl font-bold mb-4">
//             Generated Chatbot
//           </h2>

//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-bold text-lg">
//               {botConfig.botName}
//             </h3>

//             <p className="mt-2">
//               {botConfig.welcomeMessage}
//             </p>

//             <div className="mt-6 border rounded p-3 h-64 overflow-y-auto bg-white">
//               {messages.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`mb-3 ${
//                     msg.sender === "user"
//                       ? "text-right"
//                       : "text-left"
//                   }`}
//                 >
//                   <span className="inline-block border px-3 py-2 rounded">
//                     {msg.text}
//                   </span>
//                 </div>
//               ))}

//               {isTyping && (
//                 <div className="text-left">
//                   <span className="inline-block border px-3 py-2 rounded bg-gray-100 text-gray-500">
//                     Bot is typing...
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* SUGGESTED QUESTIONS */}

//             <div className="mt-4 flex flex-wrap gap-2">
//               {(botConfig.suggestedQuestions || []).map(
//                 (question: string) => (
//                   <button
//                     key={question}
//                     onClick={() =>
//                       sendQuestion(question)
//                     }
//                     disabled={isTyping}
//                     className="border px-3 py-2 rounded bg-white hover:bg-gray-100 disabled:opacity-50"
//                   >
//                     {question}
//                   </button>
//                 )
//               )}
//             </div>

//             {/* CHAT INPUT */}

//             <div className="mt-4 flex gap-2">
//               <input
//                 type="text"
//                 value={userInput}
//                 onChange={(e) =>
//                   setUserInput(e.target.value)
//                 }
//                 placeholder="Ask anything..."
//                 className="border p-2 flex-1 rounded"
//                 onKeyDown={(e) => {
//                   if (
//                     e.key === "Enter" &&
//                     !isTyping
//                   ) {
//                     handleSend();
//                   }
//                 }}
//               />

//               <button
//                 onClick={handleSend}
//                 disabled={isTyping}
//                 className="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
//               >
//                 {isTyping
//                   ? "Sending..."
//                   : "Send"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* WIDGET INSTALL CODE */}

//       {widgetCode && (
//         <div className="mt-10 border p-5 rounded shadow">
//           <h2 className="text-2xl font-bold mb-4">
//             Install Widget Code
//           </h2>

//           <textarea
//             readOnly
//             value={widgetCode}
//             className="w-full h-56 border p-3 rounded font-mono text-sm"
//           />

//           <button
//             onClick={copyWidgetCode}
//             className="bg-green-600 text-white px-5 py-2 mt-4 rounded"
//           >
//             Copy Widget Code
//           </button>
//         </div>
//       )}

//       {/* FLOATING CHAT PREVIEW */}

//       {botConfig && websiteId && (
//         <ChatWidget
//           botName={botConfig.botName}
//           messages={messages}
//           onSendMessage={sendQuestion}
//         />
//       )}
//     </main>
//   );
// }