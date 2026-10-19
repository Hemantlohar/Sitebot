"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function TestWidgetPage() {
  const [botId, setBotId] = useState<string>(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("botId") || ""
      : ""
  );
  const [scriptLoaded, setScriptLoaded] =
    useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const id = params.get("botId");

    if (!id) {
      return;
    }

    queueMicrotask(() => {
      setBotId(id);
    });

    // Remove an old test widget if the component
    // remounts during development.
    const oldScript = document.getElementById(
      "ai-widget-test-script"
    );

    if (oldScript) {
      oldScript.remove();
    }

    // Create the real widget installation script.
    const script = document.createElement("script");

    script.id = "ai-widget-test-script";
    script.src = "/widget.js";
    script.setAttribute("data-bot-id", id);
    script.async = true;

    script.onload = () => {
      setScriptLoaded(true);
    };

    script.onerror = () => {
      console.error(
        "Failed to load widget.js"
      );
    };

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  if (!botId) {
    return (
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Bot size={26} />
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Bot ID Missing
          </h1>

          <p className="text-zinc-500 mt-2">
            Open this page using the Test Widget
            button from your bot dashboard.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 bg-zinc-950 text-white px-5 py-3 rounded-xl font-semibold"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Top Bar */}

      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
              <Bot size={21} />
            </div>

            <div>
              <h1 className="font-bold text-zinc-950">
                Widget Test Environment
              </h1>

              <p className="text-xs text-zinc-500">
                Preview your chatbot on a sample website
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/${botId}`}
            className="inline-flex items-center justify-center gap-2 border border-zinc-300 bg-white hover:bg-zinc-50 px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to Bot Settings
          </Link>
        </div>
      </header>

      {/* Status Banner */}

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />

          <div>
            <p className="text-sm font-semibold text-emerald-900">
              Test environment ready
            </p>

            <p className="text-xs text-emerald-700 mt-0.5">
              {scriptLoaded
                ? "Widget script loaded successfully."
                : "Loading widget script..."}
            </p>
          </div>
        </div>
      </div>

      {/* Fake Website */}

      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Fake Website Navigation */}

          <nav className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
            <div className="font-bold text-xl">
              Demo Website
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
              <span>Home</span>
              <span>Products</span>
              <span>Features</span>
              <span>About</span>
              <span>Contact</span>
            </div>
          </nav>

          {/* Hero */}

          <div className="px-6 md:px-12 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                <ExternalLink size={13} />
                Widget Testing Page
              </span>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-950 mt-6">
                Test your AI assistant in a real page environment.
              </h2>

              <p className="text-lg text-zinc-500 leading-relaxed mt-6">
                This sample page simulates a customer
                website. Your chatbot launcher should
                appear in the position selected in Bot
                Settings.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <button className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold">
                  Explore Products
                </button>

                <button className="border border-zinc-300 px-5 py-3 rounded-xl font-semibold">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Feature Cards */}

          <div className="bg-zinc-50 border-t border-zinc-200 px-6 md:px-12 py-12">
            <h3 className="text-2xl font-bold">
              Our Features
            </h3>

            <div className="grid md:grid-cols-3 gap-5 mt-6">
              <FeatureCard
                title="Fast Support"
                text="Get answers to common questions instantly."
              />

              <FeatureCard
                title="Product Help"
                text="Discover products and services through AI assistance."
              />

              <FeatureCard
                title="24/7 Assistant"
                text="Customers can interact with the chatbot at any time."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Widget is injected automatically into document.body */}
    </main>
  );
}

function FeatureCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
        <CheckCircle2 size={19} />
      </div>

      <h4 className="font-bold mt-4">
        {title}
      </h4>

      <p className="text-sm text-zinc-500 leading-relaxed mt-2">
        {text}
      </p>
    </div>
  );
}