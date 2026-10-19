"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Bot,
  BrainCircuit,
  Globe,
  MessageSquare,
  ArrowRight,
  Database,
  Sparkles,
  ScanLine,
  Layers,
} from "lucide-react";

function EmberSmokeBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0B0E14]"
    >
      <div className="smoke-blob blob-a" />
      <div className="smoke-blob blob-b" />
      <div className="smoke-blob blob-c" />
      <div className="smoke-blob blob-d" />
      <div className="absolute inset-0 bg-[#0B0E14]/40" />
      <div className="absolute inset-0 vignette" />
    </div>
  );
}

function BotGreeting() {
  const phrases = ["hie", "hello world", "need help?", "ask me anything"];

  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length];
    let delay = deleting ? 45 : 90;

    if (!deleting && text === current) {
      delay = 1400;
    } else if (deleting && text === "") {
      delay = 350;
    }

    const timeout = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true);
        return;
      }

      if (deleting && text === "") {
        setDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
        return;
      }

      setText((t) =>
        deleting
          ? current.slice(0, t.length - 1)
          : current.slice(0, t.length + 1)
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, deleting, phraseIndex]);

  return (
    <div className="pointer-events-none fixed bottom-10 right-6 sm:bottom-14 sm:right-14 z-20">
      <div className="bot-float relative w-[130px] sm:w-[170px] md:w-[210px]">
        <div className="speech-bubble absolute -top-16 sm:-top-20 left-1/2 -translate-x-1/2 min-w-[110px] bg-[#12161F] border border-[#232838] rounded-xl rounded-bl-sm px-4 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <span className="font-mono text-sm sm:text-base text-[#5EEAD4] whitespace-nowrap">
            {text}
            <span className="type-cursor">|</span>
          </span>
        </div>

        <svg
          viewBox="0 0 120 120"
          className="w-full h-auto "
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="18" y="4" width="6" height="16" rx="3" fill="#3a4257" />
          <circle cx="21" cy="4" r="5" fill="#d63333" />

          <rect
            x="12"
            y="20"
            width="96"
            height="80"
            rx="22"
            fill="#12161F"
            stroke="#26242416"
            strokeWidth="2.5"
          />

          <rect
            x="26"
            y="40"
            width="68"
            height="42"
            rx="14"
            fill="#0B0E14"
          />

          <circle className="bot-eye" cx="48" cy="61" r="7" fill="#5EEAD4" />
          <circle className="bot-eye" cx="72" cy="61" r="7" fill="#5EEAD4" />

          <path
            d="M50 92 Q60 100 70 92"
            stroke="#5EEAD4"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <rect
            x="0"
            y="52"
            width="10"
            height="20"
            rx="5"
            fill="#12161F"
            stroke="#232838"
            strokeWidth="2"
          />
          <rect
            x="110"
            y="52"
            width="10"
            height="20"
            rx="5"
            fill="#12161F"
            stroke="#232838"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setUser(user);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  function startBuilding() {
    if (user) {
      router.push("/create");
    } else {
      router.push("/login");
    }
  }

  async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      alert("Logout failed. Please try again.");
      return;
    }

    setUser(null);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen text-[#EDEFF4] font-[Inter,sans-serif] selection:bg-[#5EEAD4]/30 selection:text-white">
      <EmberSmokeBackground />
      <BotGreeting />
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

        .font-display {
          font-family: "Space Grotesk", sans-serif;
        }
        .font-mono {
          font-family: "JetBrains Mono", monospace;
        }

        @keyframes scanline {
          0% {
            top: 8%;
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          45% {
            opacity: 1;
          }
          55% {
            opacity: 0;
          }
          100% {
            top: 92%;
            opacity: 0;
          }
        }
        .scanline {
          animation: scanline 4.5s ease-in-out infinite;
        }

        @keyframes chip-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chip-1 {
          animation: chip-in 0.5s ease-out 0.6s both,
            chip-fade 4.5s ease-in-out infinite;
        }
        .chip-2 {
          animation: chip-in 0.5s ease-out 1.5s both,
            chip-fade 4.5s ease-in-out infinite;
        }
        .chip-3 {
          animation: chip-in 0.5s ease-out 2.4s both,
            chip-fade 4.5s ease-in-out infinite;
        }
        @keyframes chip-fade {
          0%,
          92% {
            opacity: 1;
          }
          97%,
          100% {
            opacity: 0;
          }
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
        .dot-a {
          animation: typing-dot 1.2s ease-in-out infinite;
        }
        .dot-b {
          animation: typing-dot 1.2s ease-in-out infinite 0.15s;
        }
        .dot-c {
          animation: typing-dot 1.2s ease-in-out infinite 0.3s;
        }

        @keyframes bubble-in {
          0%,
          15% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          25%,
          90% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
        }
        .bubble-in {
          animation: bubble-in 4.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .scanline,
          .chip-1,
          .chip-2,
          .chip-3,
          .dot-a,
          .dot-b,
          .dot-c,
          .bubble-in {
            animation: none !important;
            opacity: 1 !important;
          }
        }

        .smoke-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(30px);
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }
        .blob-a {
          top: -10%;
          left: 5%;
          width: 55vw;
          height: 55vw;
          background: radial-gradient(
            circle,
            rgba(255, 107, 74, 0.28) 0%,
            rgba(255, 107, 74, 0) 70%
          );
          animation: drift-a 34s ease-in-out infinite;
        }
        .blob-b {
          bottom: -15%;
          right: 0%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(
            circle,
            rgba(200, 60, 30, 0.22) 0%,
            rgba(200, 60, 30, 0) 70%
          );
          animation: drift-b 40s ease-in-out infinite;
        }
        .blob-c {
          top: 30%;
          right: 20%;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(
            circle,
            rgba(94, 234, 212, 0.08) 0%,
            rgba(94, 234, 212, 0) 70%
          );
          animation: drift-c 46s ease-in-out infinite;
        }
        .blob-d {
          bottom: 10%;
          left: 15%;
          width: 35vw;
          height: 35vw;
          background: radial-gradient(
            circle,
            rgba(255, 140, 90, 0.16) 0%,
            rgba(255, 140, 90, 0) 70%
          );
          animation: drift-d 38s ease-in-out infinite;
        }

        @keyframes drift-a {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(6vw, 8vh) scale(1.15);
          }
          66% {
            transform: translate(-4vw, 4vh) scale(0.95);
          }
        }
        @keyframes drift-b {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-8vw, -6vh) scale(1.1);
          }
          66% {
            transform: translate(3vw, -3vh) scale(0.9);
          }
        }
        @keyframes drift-c {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-5vw, 7vh) scale(1.2);
          }
        }
        @keyframes drift-d {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(5vw, -6vh) scale(1.1);
          }
        }

        .vignette {
          background: radial-gradient(
            ellipse at center,
            rgba(11, 14, 20, 0) 40%,
            rgba(11, 14, 20, 0.85) 100%
          );
        }


        @media (prefers-reduced-motion: reduce) {
          .smoke-blob {
            animation: none !important;
          }
        }

        .bot-float {
  animation: bot-bob 3.4s ease-in-out infinite;
  will-change: transform;
}

@keyframes bot-bob {
  0%,100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(-1.5deg);
  }
}

.bot-eye {
  animation: bot-blink 4.2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes bot-blink {
  0%,92%,100% {
    transform: scaleY(1);
  }
  96% {
    transform: scaleY(0.1);
  }
}

.speech-bubble {
  animation: bubble-float 3.4s ease-in-out infinite;
}

@keyframes bubble-float {
  0%,100% {
    transform: translate(-50%,0);
  }
  50% {
    transform: translate(-50%,-6px);
  }
}

.type-cursor {
  display:inline-block;
  margin-left:2px;
  animation: cursor-blink .9s step-end infinite;
}

@keyframes cursor-blink {
  0%,100% {
    opacity:1;
  }
  50% {
    opacity:0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bot-float,
  .bot-eye,
  .speech-bubble,
  .type-cursor {
    animation:none !important;
  }
}
      `}
      
      
      </style>

      {/* NAVBAR */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => router.push("/")}
        >
          <div className="w-9 h-9 rounded-lg bg-[#5EEAD4] flex items-center justify-center text-[#0B0E14] group-hover:rotate-6 transition-transform">
            <Bot size={20} strokeWidth={2.4} />
          </div>
          <span className="text-lg font-display font-semibold tracking-tight">
            AI Bot Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!loadingUser && !user && (
            <>
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2.5 text-sm text-[#8A93A6] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] rounded-lg"
              >
                Log in
              </button>

              <button
                onClick={() => router.push("/signup")}
                className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
              >
                Create account
              </button>
            </>
          )}

          {!loadingUser && user && (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="text-sm border border-[#232838] text-[#8A93A6] px-4 py-2.5 rounded-lg font-medium hover:border-[#3a4257] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 border border-[#232838] bg-[#12161F] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#5EEAD4] mb-7">
            <ScanLine size={13} />
            url in, assistant out
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight leading-[1.08]">
            Your website already
            <span className="block text-[#5EEAD4] mt-1">
              knows the answers.
            </span>
          </h1>

          <p className="mt-6 text-lg text-[#8A93A6] max-w-lg leading-relaxed">
            Point it at a URL. We crawl the content, turn it into searchable
            knowledge, and hand you a chat assistant that actually knows your
            product — ready to embed anywhere.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button
              onClick={startBuilding}
              className="bg-[#FF6B4A] hover:bg-[#ff7f5f] text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
            >
              Build your AI bot
              <ArrowRight size={18} />
            </button>

            {user && (
              <button
                onClick={() => router.push("/dashboard")}
                className="border border-[#232838] hover:border-[#3a4257] px-6 py-3.5 rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
              >
                View dashboard
              </button>
            )}
          </div>
        </div>

        {/* SIGNATURE VISUAL: url -> scan -> chat */}
        <div className="relative">
          <div className="rounded-2xl border border-[#232838] bg-[#12161F] overflow-hidden shadow-[0_0_0_1px_rgba(94,234,212,0.04)]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#232838]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
              <span className="ml-3 font-mono text-xs text-[#8A93A6]">
                your-company.com
              </span>
            </div>

            <div className="relative p-6 h-[280px] overflow-hidden">
              <div className="scanline absolute left-0 right-0 h-px bg-[#5EEAD4] shadow-[0_0_12px_2px_rgba(94,234,212,0.6)]" />

              <div className="space-y-2.5">
                <div className="h-3 w-3/4 rounded bg-[#1c2231]" />
                <div className="h-3 w-1/2 rounded bg-[#1c2231]" />
                <div className="h-3 w-5/6 rounded bg-[#1c2231]" />
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <span className="chip-1 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
                  Pricing
                </span>
                <span className="chip-2 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
                  FAQ
                </span>
                <span className="chip-3 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
                  Product docs
                </span>
              </div>

              <div className="bubble-in absolute bottom-6 right-6 left-6 bg-[#0B0E14] border border-[#232838] rounded-xl rounded-br-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-md bg-[#5EEAD4] flex items-center justify-center text-[#0B0E14]">
                    <Bot size={12} />
                  </div>
                  <span className="text-xs text-[#8A93A6] font-mono">
                    assistant
                  </span>
                </div>
                <div className="flex gap-1 items-end h-3">
                  <span className="dot-a w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                  <span className="dot-b w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                  <span className="dot-c w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -z-10 -inset-6 bg-[#5EEAD4]/5 blur-3xl rounded-full" />
        </div>
      </section>

      {/* HOW IT WORKS — connected thread, not numbered cards */}
      <section className="border-y border-[#232838] bg-[#0d111a]/75 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14 max-w-lg">
            <p className="text-[#5EEAD4] font-mono text-sm">the pipeline</p>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mt-3 tracking-tight">
              One URL becomes one assistant
            </h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-6">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#5EEAD4]/40 via-[#5EEAD4]/40 to-[#5EEAD4]/40" />

            <ThreadStep
              icon={<Globe size={20} />}
              tag="crawl"
              title="Enter your website"
              description="We fetch and read the pages that matter — no manual copy-paste."
            />
            <ThreadStep
              icon={<Layers size={20} />}
              tag="index"
              title="Build the knowledge base"
              description="Content is cleaned, chunked, and embedded for fast retrieval."
            />
            <ThreadStep
              icon={<MessageSquare size={20} />}
              tag="deploy"
              title="Embed the widget"
              description="Style it, drop in one script tag, and it's live on your site."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-14 max-w-lg">
          <p className="text-[#5EEAD4] font-mono text-sm">the platform</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold mt-3 tracking-tight">
            Everything to run your assistant
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Globe size={20} />}
            title="Website analysis"
            description="Automatically identify business info and products from your pages."
          />
          <FeatureCard
            icon={<Database size={20} />}
            title="Knowledge base"
            description="Manage everything your assistant knows, beyond just the crawl."
          />
          <FeatureCard
            icon={<BrainCircuit size={20} />}
            title="RAG-powered answers"
            description="Relevant knowledge is retrieved before every response is generated."
          />
          <FeatureCard
            icon={<Bot size={20} />}
            title="Bot customization"
            description="Set identity, welcome message, colors, logo, and widget position."
          />
          <FeatureCard
            icon={<MessageSquare size={20} />}
            title="Conversation history"
            description="See exactly what visitors ask, and how your assistant answers."
          />
          <FeatureCard
            icon={<Sparkles size={20} />}
            title="Embeddable widget"
            description="One generated script tag installs the chatbot anywhere."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-[#232838] bg-[#12161F] p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5EEAD4]/10 blur-3xl rounded-full" />

          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight relative">
            Ready to build your assistant?
          </h2>

          <p className="text-[#8A93A6] mt-4 max-w-xl mx-auto relative">
            Turn your website into a chatbot that knows what you know — no
            training data to write by hand.
          </p>

          <button
            onClick={startBuilding}
            className="mt-8 bg-[#FF6B4A] hover:bg-[#ff7f5f] text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161F]"
          >
            Get started
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#232838]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-3 justify-between text-[#8A93A6] text-sm font-mono">
          <span>AI Bot Builder</span>
          <span>website content → conversational assistant</span>
        </div>
      </footer>
    </main>
  );
}

function ThreadStep({
  icon,
  tag,
  title,
  description,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative bg-[#12161F] border border-[#232838] rounded-2xl p-6">
      <div className="hidden md:block absolute -top-[2px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#5EEAD4]" />

      <div className="w-10 h-10 rounded-lg bg-[#5EEAD4]/10 text-[#5EEAD4] flex items-center justify-center">
        {icon}
      </div>

      <p className="font-mono text-xs text-[#5EEAD4] mt-5">$ {tag}</p>

      <h3 className="text-lg font-display font-semibold mt-2">{title}</h3>

      <p className="text-[#8A93A6] mt-2.5 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-[#232838] bg-[#12161F] rounded-2xl p-6 hover:border-[#3a4257] transition-colors">
      <div className="w-9 h-9 rounded-lg bg-[#5EEAD4]/10 text-[#5EEAD4] flex items-center justify-center">
        {icon}
      </div>

      <h3 className="text-base font-display font-semibold mt-4">{title}</h3>

      <p className="text-[#8A93A6] mt-2 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}


















// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabaseClient } from "@/lib/supabaseClient";
// import {
//   Bot,
//   BrainCircuit,
//   Globe,
//   MessageSquare,
//   ArrowRight,
//   Database,
//   Sparkles,
//   ScanLine,
//   Layers,
// } from "lucide-react";

// export default function LandingPage() {
//   const router = useRouter();

//   const [user, setUser] = useState<any>(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   useEffect(() => {
//     async function loadUser() {
//       const {
//         data: { user },
//       } = await supabaseClient.auth.getUser();

//       setUser(user);
//       setLoadingUser(false);
//     }

//     loadUser();
//   }, []);

//   function startBuilding() {
//     if (user) {
//       router.push("/create");
//     } else {
//       router.push("/login");
//     }
//   }

//   async function handleLogout() {
//     const { error } = await supabaseClient.auth.signOut();

//     if (error) {
//       console.error("Logout error:", error.message);
//       alert("Logout failed. Please try again.");
//       return;
//     }

//     setUser(null);
//     router.refresh();
//   }

//   return (
//     <main className="min-h-screen bg-[#0B0E14] text-[#EDEFF4] font-[Inter,sans-serif] selection:bg-[#5EEAD4]/30 selection:text-white">
//       <style jsx global>{`
//         @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap");

//         .font-display {
//           font-family: "Space Grotesk", sans-serif;
//         }
//         .font-mono {
//           font-family: "JetBrains Mono", monospace;
//         }

//         @keyframes scanline {
//           0% {
//             top: 8%;
//             opacity: 0;
//           }
//           8% {
//             opacity: 1;
//           }
//           45% {
//             opacity: 1;
//           }
//           55% {
//             opacity: 0;
//           }
//           100% {
//             top: 92%;
//             opacity: 0;
//           }
//         }
//         .scanline {
//           animation: scanline 4.5s ease-in-out infinite;
//         }

//         @keyframes chip-in {
//           from {
//             opacity: 0;
//             transform: translateY(6px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//         .chip-1 {
//           animation: chip-in 0.5s ease-out 0.6s both,
//             chip-fade 4.5s ease-in-out infinite;
//         }
//         .chip-2 {
//           animation: chip-in 0.5s ease-out 1.5s both,
//             chip-fade 4.5s ease-in-out infinite;
//         }
//         .chip-3 {
//           animation: chip-in 0.5s ease-out 2.4s both,
//             chip-fade 4.5s ease-in-out infinite;
//         }
//         @keyframes chip-fade {
//           0%,
//           92% {
//             opacity: 1;
//           }
//           97%,
//           100% {
//             opacity: 0;
//           }
//         }

//         @keyframes typing-dot {
//           0%,
//           60%,
//           100% {
//             opacity: 0.25;
//             transform: translateY(0);
//           }
//           30% {
//             opacity: 1;
//             transform: translateY(-2px);
//           }
//         }
//         .dot-a {
//           animation: typing-dot 1.2s ease-in-out infinite;
//         }
//         .dot-b {
//           animation: typing-dot 1.2s ease-in-out infinite 0.15s;
//         }
//         .dot-c {
//           animation: typing-dot 1.2s ease-in-out infinite 0.3s;
//         }

//         @keyframes bubble-in {
//           0%,
//           15% {
//             opacity: 0;
//             transform: translateY(8px) scale(0.96);
//           }
//           25%,
//           90% {
//             opacity: 1;
//             transform: translateY(0) scale(1);
//           }
//           100% {
//             opacity: 0;
//             transform: translateY(8px) scale(0.96);
//           }
//         }
//         .bubble-in {
//           animation: bubble-in 4.5s ease-in-out infinite;
//         }

//         @media (prefers-reduced-motion: reduce) {
//           .scanline,
//           .chip-1,
//           .chip-2,
//           .chip-3,
//           .dot-a,
//           .dot-b,
//           .dot-c,
//           .bubble-in {
//             animation: none !important;
//             opacity: 1 !important;
//           }
//         }
//       `}</style>

//       {/* NAVBAR */}
//       <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
//         <div
//           className="flex items-center gap-2.5 cursor-pointer group"
//           onClick={() => router.push("/")}
//         >
//           <div className="w-9 h-9 rounded-lg bg-[#5EEAD4] flex items-center justify-center text-[#0B0E14] group-hover:rotate-6 transition-transform">
//             <Bot size={20} strokeWidth={2.4} />
//           </div>
//           <span className="text-lg font-display font-semibold tracking-tight">
//             AI Bot Builder
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           {!loadingUser && !user && (
//             <>
//               <button
//                 onClick={() => router.push("/login")}
//                 className="px-4 py-2.5 text-sm text-[#8A93A6] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] rounded-lg"
//               >
//                 Log in
//               </button>

//               <button
//                 onClick={() => router.push("/signup")}
//                 className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
//               >
//                 Create account
//               </button>
//             </>
//           )}

//           {!loadingUser && user && (
//             <>
//               <button
//                 onClick={() => router.push("/dashboard")}
//                 className="text-sm bg-[#EDEFF4] text-[#0B0E14] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
//               >
//                 Dashboard
//               </button>

//               <button
//                 onClick={handleLogout}
//                 className="text-sm border border-[#232838] text-[#8A93A6] px-4 py-2.5 rounded-lg font-medium hover:border-[#3a4257] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
//               >
//                 Log out
//               </button>
//             </>
//           )}
//         </div>
//       </nav>

//       {/* HERO */}
//       <section className="max-w-6xl mx-auto px-6 pt-16 pb-28 grid lg:grid-cols-2 gap-16 items-center">
//         <div>
//           <div className="inline-flex items-center gap-2 border border-[#232838] bg-[#12161F] px-3.5 py-1.5 rounded-full text-xs font-mono text-[#5EEAD4] mb-7">
//             <ScanLine size={13} />
//             url in, assistant out
//           </div>

//           <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-tight leading-[1.08]">
//             Your website already
//             <span className="block text-[#5EEAD4] mt-1">
//               knows the answers.
//             </span>
//           </h1>

//           <p className="mt-6 text-lg text-[#8A93A6] max-w-lg leading-relaxed">
//             Point it at a URL. We crawl the content, turn it into searchable
//             knowledge, and hand you a chat assistant that actually knows your
//             product — ready to embed anywhere.
//           </p>

//           <div className="mt-9 flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={startBuilding}
//               className="bg-[#FF6B4A] hover:bg-[#ff7f5f] text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
//             >
//               Build your AI bot
//               <ArrowRight size={18} />
//             </button>

//             {user && (
//               <button
//                 onClick={() => router.push("/dashboard")}
//                 className="border border-[#232838] hover:border-[#3a4257] px-6 py-3.5 rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EEAD4]"
//               >
//                 View dashboard
//               </button>
//             )}
//           </div>
//         </div>

//         {/* SIGNATURE VISUAL: url -> scan -> chat */}
//         <div className="relative">
//           <div className="rounded-2xl border border-[#232838] bg-[#12161F] overflow-hidden shadow-[0_0_0_1px_rgba(94,234,212,0.04)]">
//             <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#232838]">
//               <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
//               <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
//               <span className="w-2.5 h-2.5 rounded-full bg-[#3a4257]" />
//               <span className="ml-3 font-mono text-xs text-[#8A93A6]">
//                 your-company.com
//               </span>
//             </div>

//             <div className="relative p-6 h-[280px] overflow-hidden">
//               <div className="scanline absolute left-0 right-0 h-px bg-[#5EEAD4] shadow-[0_0_12px_2px_rgba(94,234,212,0.6)]" />

//               <div className="space-y-2.5">
//                 <div className="h-3 w-3/4 rounded bg-[#1c2231]" />
//                 <div className="h-3 w-1/2 rounded bg-[#1c2231]" />
//                 <div className="h-3 w-5/6 rounded bg-[#1c2231]" />
//               </div>

//               <div className="flex flex-wrap gap-2 mt-6">
//                 <span className="chip-1 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
//                   Pricing
//                 </span>
//                 <span className="chip-2 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
//                   FAQ
//                 </span>
//                 <span className="chip-3 font-mono text-xs px-3 py-1.5 rounded-full bg-[#5EEAD4]/10 text-[#5EEAD4] border border-[#5EEAD4]/25">
//                   Product docs
//                 </span>
//               </div>

//               <div className="bubble-in absolute bottom-6 right-6 left-6 bg-[#0B0E14] border border-[#232838] rounded-xl rounded-br-sm p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-5 h-5 rounded-md bg-[#5EEAD4] flex items-center justify-center text-[#0B0E14]">
//                     <Bot size={12} />
//                   </div>
//                   <span className="text-xs text-[#8A93A6] font-mono">
//                     assistant
//                   </span>
//                 </div>
//                 <div className="flex gap-1 items-end h-3">
//                   <span className="dot-a w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
//                   <span className="dot-b w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
//                   <span className="dot-c w-1.5 h-1.5 rounded-full bg-[#8A93A6]" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="absolute -z-10 -inset-6 bg-[#5EEAD4]/5 blur-3xl rounded-full" />
//         </div>
//       </section>

//       {/* HOW IT WORKS — connected thread, not numbered cards */}
//       <section className="border-y border-[#232838] bg-[#0d111a]">
//         <div className="max-w-6xl mx-auto px-6 py-24">
//           <div className="mb-14 max-w-lg">
//             <p className="text-[#5EEAD4] font-mono text-sm">the pipeline</p>
//             <h2 className="text-3xl md:text-4xl font-display font-semibold mt-3 tracking-tight">
//               One URL becomes one assistant
//             </h2>
//           </div>

//           <div className="relative grid md:grid-cols-3 gap-6">
//             <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#5EEAD4]/40 via-[#5EEAD4]/40 to-[#5EEAD4]/40" />

//             <ThreadStep
//               icon={<Globe size={20} />}
//               tag="crawl"
//               title="Enter your website"
//               description="We fetch and read the pages that matter — no manual copy-paste."
//             />
//             <ThreadStep
//               icon={<Layers size={20} />}
//               tag="index"
//               title="Build the knowledge base"
//               description="Content is cleaned, chunked, and embedded for fast retrieval."
//             />
//             <ThreadStep
//               icon={<MessageSquare size={20} />}
//               tag="deploy"
//               title="Embed the widget"
//               description="Style it, drop in one script tag, and it's live on your site."
//             />
//           </div>
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section className="max-w-6xl mx-auto px-6 py-24">
//         <div className="mb-14 max-w-lg">
//           <p className="text-[#5EEAD4] font-mono text-sm">the platform</p>
//           <h2 className="text-3xl md:text-4xl font-display font-semibold mt-3 tracking-tight">
//             Everything to run your assistant
//           </h2>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//           <FeatureCard
//             icon={<Globe size={20} />}
//             title="Website analysis"
//             description="Automatically identify business info and products from your pages."
//           />
//           <FeatureCard
//             icon={<Database size={20} />}
//             title="Knowledge base"
//             description="Manage everything your assistant knows, beyond just the crawl."
//           />
//           <FeatureCard
//             icon={<BrainCircuit size={20} />}
//             title="RAG-powered answers"
//             description="Relevant knowledge is retrieved before every response is generated."
//           />
//           <FeatureCard
//             icon={<Bot size={20} />}
//             title="Bot customization"
//             description="Set identity, welcome message, colors, logo, and widget position."
//           />
//           <FeatureCard
//             icon={<MessageSquare size={20} />}
//             title="Conversation history"
//             description="See exactly what visitors ask, and how your assistant answers."
//           />
//           <FeatureCard
//             icon={<Sparkles size={20} />}
//             title="Embeddable widget"
//             description="One generated script tag installs the chatbot anywhere."
//           />
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="max-w-5xl mx-auto px-6 pb-24">
//         <div className="rounded-2xl border border-[#232838] bg-[#12161F] p-10 md:p-14 text-center relative overflow-hidden">
//           <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5EEAD4]/10 blur-3xl rounded-full" />

//           <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight relative">
//             Ready to build your assistant?
//           </h2>

//           <p className="text-[#8A93A6] mt-4 max-w-xl mx-auto relative">
//             Turn your website into a chatbot that knows what you know — no
//             training data to write by hand.
//           </p>

//           <button
//             onClick={startBuilding}
//             className="mt-8 bg-[#FF6B4A] hover:bg-[#ff7f5f] text-[#0B0E14] px-6 py-3.5 rounded-xl font-semibold inline-flex items-center gap-2 relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12161F]"
//           >
//             Get started
//             <ArrowRight size={18} />
//           </button>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="border-t border-[#232838]">
//         <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-3 justify-between text-[#8A93A6] text-sm font-mono">
//           <span>AI Bot Builder</span>
//           <span>website content → conversational assistant</span>
//         </div>
//       </footer>
//     </main>
//   );
// }

// function ThreadStep({
//   icon,
//   tag,
//   title,
//   description,
// }: {
//   icon: React.ReactNode;
//   tag: string;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="relative bg-[#12161F] border border-[#232838] rounded-2xl p-6">
//       <div className="hidden md:block absolute -top-[2px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#5EEAD4]" />

//       <div className="w-10 h-10 rounded-lg bg-[#5EEAD4]/10 text-[#5EEAD4] flex items-center justify-center">
//         {icon}
//       </div>

//       <p className="font-mono text-xs text-[#5EEAD4] mt-5">$ {tag}</p>

//       <h3 className="text-lg font-display font-semibold mt-2">{title}</h3>

//       <p className="text-[#8A93A6] mt-2.5 text-sm leading-relaxed">
//         {description}
//       </p>
//     </div>
//   );
// }

// function FeatureCard({
//   icon,
//   title,
//   description,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="border border-[#232838] bg-[#12161F] rounded-2xl p-6 hover:border-[#3a4257] transition-colors">
//       <div className="w-9 h-9 rounded-lg bg-[#5EEAD4]/10 text-[#5EEAD4] flex items-center justify-center">
//         {icon}
//       </div>

//       <h3 className="text-base font-display font-semibold mt-4">{title}</h3>

//       <p className="text-[#8A93A6] mt-2 text-sm leading-relaxed">
//         {description}
//       </p>
//     </div>
//   );
// }













// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabaseClient } from "@/lib/supabaseClient";
// import {
//   Bot,
//   BrainCircuit,
//   Globe,
//   MessageSquare,
//   ArrowRight,
//   Database,
// } from "lucide-react";

// export default function LandingPage() {
//   const router = useRouter();

//   const [user, setUser] = useState<any>(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   useEffect(() => {
//     async function loadUser() {
//       const {
//         data: { user },
//       } = await supabaseClient.auth.getUser();

//       setUser(user);
//       setLoadingUser(false);
//     }

//     loadUser();
//   }, []);

//   function startBuilding() {
//     if (user) {
//       router.push("/create");
//     } else {
//       router.push("/login");
//     }
//   }
//   async function handleLogout() {
//   const { error } = await supabaseClient.auth.signOut();

//   if (error) {
//     console.error("Logout error:", error.message);
//     alert("Logout failed. Please try again.");
//     return;
//   }

//   setUser(null);
//   router.refresh();
// }

//   return (
//     <main className="min-h-screen bg-zinc-950 text-white">

//       {/* NAVBAR */}

//       <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

//         <div
//           className="flex items-center gap-3 cursor-pointer"
//           onClick={() => router.push("/")}
//         >
//           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
//             <Bot size={24} />
//           </div>

//           <span className="text-xl font-bold">
//             AI Bot Builder
//           </span>
//         </div>

//         <div className="flex items-center gap-3">

//           {!loadingUser && !user && (
//             <>
//               <button
//                 onClick={() => router.push("/login")}
//                 className="px-5 py-2.5 text-zinc-300 hover:text-white"
//               >
//                 Login
//               </button>

//               <button
//                 onClick={() => router.push("/signup")}
//                 className="bg-white text-black px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-200"
//               >
//                 Create Account
//               </button>
//             </>
//           )}

//           {!loadingUser && user && (
//   <>
//     <button
//       onClick={() => router.push("/dashboard")}
//       className="bg-white text-black px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-200"
//     >
//       Dashboard
//     </button>

//     <button
//       onClick={handleLogout}
//       className="border border-zinc-700 text-zinc-300 px-5 py-2.5 rounded-lg font-medium hover:bg-zinc-900 hover:text-white"
//     >
//       Logout
//     </button>
//   </>
// )}
          

//         </div>
//       </nav>


//       {/* HERO */}

//       <section className="max-w-6xl mx-auto px-6 pt-24 pb-28 text-center">

//         <div className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900 px-4 py-2 rounded-full text-sm text-zinc-300 mb-8">
//           <BrainCircuit size={16} />
//           AI-powered website assistants
//         </div>

//         <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">

//           Turn Any Website Into an

//           <span className="block text-blue-500 mt-2">
//             Intelligent AI Assistant
//           </span>

//         </h1>

//         <p className="mt-7 text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
//           Enter a website URL and automatically create an AI chatbot
//           trained on its content. Customize it, manage its knowledge,
//           track conversations, and embed it on any website.
//         </p>

//         <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

//           <button
//             onClick={startBuilding}
//             className="bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
//           >
//             Build Your AI Bot
//             <ArrowRight size={19} />
//           </button>

//           {user && (
//             <button
//               onClick={() => router.push("/dashboard")}
//               className="border border-zinc-700 hover:bg-zinc-900 px-7 py-4 rounded-xl font-semibold"
//             >
//               View Dashboard
//             </button>
//           )}

//         </div>

//       </section>


//       {/* HOW IT WORKS */}

//       <section className="border-y border-zinc-800 bg-zinc-900/40">

//         <div className="max-w-7xl mx-auto px-6 py-24">

//           <div className="text-center mb-14">

//             <p className="text-blue-500 font-semibold">
//               SIMPLE WORKFLOW
//             </p>

//             <h2 className="text-4xl font-bold mt-3">
//               From website to AI assistant
//             </h2>

//             <p className="text-zinc-400 mt-4">
//               Create a website-aware chatbot in three simple steps.
//             </p>

//           </div>

//           <div className="grid md:grid-cols-3 gap-6">

//             <StepCard
//               number="01"
//               icon={<Globe size={26} />}
//               title="Enter Your Website"
//               description="Provide your website URL. The system crawls and processes relevant website content."
//             />

//             <StepCard
//               number="02"
//               icon={<BrainCircuit size={26} />}
//               title="Build AI Knowledge"
//               description="Website content is cleaned, chunked and transformed into searchable AI knowledge."
//             />

//             <StepCard
//               number="03"
//               icon={<MessageSquare size={26} />}
//               title="Deploy Your Bot"
//               description="Customize your assistant and add the generated widget script to your website."
//             />

//           </div>

//         </div>

//       </section>


//       {/* FEATURES */}

//       <section className="max-w-7xl mx-auto px-6 py-24">

//         <div className="text-center mb-14">

//           <p className="text-blue-500 font-semibold">
//             PLATFORM FEATURES
//           </p>

//           <h2 className="text-4xl font-bold mt-3">
//             Everything you need to manage your AI assistant
//           </h2>

//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

//           <FeatureCard
//             icon={<Globe size={24} />}
//             title="Website Analysis"
//             description="Analyze website content and automatically identify business information and products."
//           />

//           <FeatureCard
//             icon={<Database size={24} />}
//             title="Knowledge Base"
//             description="Manage website knowledge and additional information used by your AI assistant."
//           />

//           <FeatureCard
//             icon={<BrainCircuit size={24} />}
//             title="RAG-Powered Answers"
//             description="Retrieve relevant website knowledge before generating contextual chatbot responses."
//           />

//           <FeatureCard
//             icon={<Bot size={24} />}
//             title="Bot Customization"
//             description="Customize bot identity, welcome message, colors, logo, position and appearance."
//           />

//           <FeatureCard
//             icon={<MessageSquare size={24} />}
//             title="Conversation History"
//             description="Review visitor conversations and understand the questions people ask your assistant."
//           />

//           <FeatureCard
//             icon={<ArrowRight size={24} />}
//             title="Embeddable Widget"
//             description="Install the chatbot on another website using a simple generated script."
//           />

//         </div>

//       </section>


//       {/* CTA */}

//       <section className="max-w-5xl mx-auto px-6 pb-24">

//         <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 md:p-16 text-center">

//           <h2 className="text-4xl font-bold">
//             Ready to build your AI assistant?
//           </h2>

//           <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
//             Turn website content into a useful conversational assistant
//             and manage everything from one dashboard.
//           </p>

//           <button
//             onClick={startBuilding}
//             className="mt-8 bg-blue-600 hover:bg-blue-700 px-7 py-4 rounded-xl font-semibold inline-flex items-center gap-2"
//           >
//             Get Started
//             <ArrowRight size={19} />
//           </button>

//         </div>

//       </section>


//       {/* FOOTER */}

//       <footer className="border-t border-zinc-800">

//         <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row gap-4 justify-between text-zinc-500 text-sm">

//           <span>
//             AI Bot Builder
//           </span>

//           <span>
//             AI-powered website assistant platform
//           </span>

//         </div>

//       </footer>

//     </main>
//   );
// }


// function StepCard({
//   number,
//   icon,
//   title,
//   description,
// }: {
//   number: string;
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-7">

//       <div className="flex justify-between items-start">

//         <div className="w-12 h-12 bg-blue-600/15 text-blue-500 rounded-xl flex items-center justify-center">
//           {icon}
//         </div>

//         <span className="text-zinc-700 text-3xl font-bold">
//           {number}
//         </span>

//       </div>

//       <h3 className="text-xl font-bold mt-6">
//         {title}
//       </h3>

//       <p className="text-zinc-400 mt-3 leading-relaxed">
//         {description}
//       </p>

//     </div>
//   );
// }


// function FeatureCard({
//   icon,
//   title,
//   description,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   description: string;
// }) {
//   return (
//     <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-7 hover:border-zinc-700 transition">

//       <div className="w-11 h-11 bg-blue-600/15 text-blue-500 rounded-xl flex items-center justify-center">
//         {icon}
//       </div>

//       <h3 className="text-xl font-bold mt-5">
//         {title}
//       </h3>

//       <p className="text-zinc-400 mt-3 leading-relaxed">
//         {description}
//       </p>

//     </div>
//   );
// }