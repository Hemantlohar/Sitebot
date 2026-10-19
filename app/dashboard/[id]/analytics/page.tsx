"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  Bot,
  Globe,
  MessageSquare,
  TrendingUp,
  Users,
  Download,
} from "lucide-react";

interface ActivityItem {
  date: string;
  label: string;
  questions: number;
}

interface TopQuestion {
  question: string;
  count: number;
}

interface Chat {
  id: string;
  visitor_id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface Analytics {
  botName: string;
  websiteUrl: string;

  totalVisitors: number;
  totalQuestions: number;
  totalResponses: number;
  totalConversations: number;
  questionsToday: number;

  activityLast7Days: ActivityItem[];

  topQuestions: TopQuestion[];

  recentChats: Chat[];
}

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch(
          `/api/analytics/${params.id}`
        );

        const data = await res.json();

        if (data.success) {
          setAnalytics(data.analytics);
        }
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [params.id]);

  async function exportCSV() {
    window.open(
      `/api/analytics/${params.id}/export`,
      "_blank"
    );
  }

  if (loading || !analytics) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-bold">
          Loading Analytics...
        </h2>
      </main>
    );
  }

  const responseRate =
    analytics.totalQuestions === 0
      ? 0
      : Math.round(
          (analytics.totalResponses /
            analytics.totalQuestions) *
            100
        );

  const avgQuestions =
    analytics.totalVisitors === 0
      ? 0
      : (
          analytics.totalQuestions /
          analytics.totalVisitors
        ).toFixed(1);

  return (
    <main className="min-h-screen bg-zinc-50 p-8">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Analytics Dashboard
          </h1>

          <p className="text-zinc-500 mt-2">
            Track visitors, conversations and chatbot usage.
          </p>

        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          <Download size={18} />

          Export CSV

        </button>

      </div>

      {/* Bot + Website */}

      <div className="flex flex-wrap gap-5 mb-8">

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex-1">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

              <Bot className="text-blue-600" />

            </div>

            <div>

              <p className="text-zinc-500 text-sm">
                Bot
              </p>

              <h2 className="font-bold text-lg">
                {analytics.botName}
              </h2>

            </div>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex-[2]">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

              <Globe className="text-green-600" />

            </div>

            <div>

              <p className="text-zinc-500 text-sm">
                Website
              </p>

              <a
                href={analytics.websiteUrl}
                target="_blank"
                className="font-semibold text-blue-600 hover:underline break-all"
              >
                {analytics.websiteUrl}
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* Metric Cards */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        <MetricCard
          title="Visitors"
          value={analytics.totalVisitors}
          description="Unique visitors"
          icon={<Users size={22} />}
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Questions"
          value={analytics.totalQuestions}
          description="Questions received"
          icon={<MessageSquare size={22} />}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="Conversations"
          value={analytics.totalConversations}
          description="Visitor sessions"
          icon={<Bot size={22} />}
          iconClass="bg-purple-50 text-purple-600"
        />

        <MetricCard
          title="Today"
          value={analytics.questionsToday}
          description="Questions today"
          icon={<Activity size={22} />}
          iconClass="bg-orange-50 text-orange-600"
        />

        <MetricCard
          title="Response Rate"
          value={`${responseRate}%`}
          description="Answered successfully"
          icon={<TrendingUp size={22} />}
          iconClass="bg-green-50 text-green-600"
        />

        <MetricCard
          title="Avg / Visitor"
          value={avgQuestions}
          description="Questions per visitor"
          icon={<Users size={22} />}
          iconClass="bg-pink-50 text-pink-600"
        />
      </div>
      
            {/* Activity + Top Questions */}

      <div className="grid lg:grid-cols-3 gap-6 mt-8">

        {/* Activity */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">

          <h2 className="text-xl font-bold">
            Activity (Last 7 Days)
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Number of questions received each day.
          </p>

          <div className="mt-8 flex items-end justify-between gap-3 h-64">

            {analytics.activityLast7Days.map(
              (day) => {

                const max = Math.max(
                  ...analytics.activityLast7Days.map(
                    (d) => d.questions
                  ),
                  1
                );

                const height =
                  (day.questions / max) * 180 + 18;

                return (

                  <div
                    key={day.date}
                    className="flex flex-col items-center flex-1"
                  >

                    <span className="text-xs font-semibold mb-2">

                      {day.questions}

                    </span>

                    <div
                      className="w-full rounded-t-xl bg-blue-600 transition-all"
                      style={{
                        height: `${height}px`,
                      }}
                    />

                    <span className="text-xs text-zinc-500 mt-3">

                      {day.label}

                    </span>

                  </div>

                );

              }
            )}

          </div>

        </div>

        {/* Top Questions */}

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">

          <h2 className="text-xl font-bold">
            Top Questions
          </h2>

          <p className="text-sm text-zinc-500 mt-1">
            Most frequently asked.
          </p>

          <div className="mt-6 space-y-4">

            {analytics.topQuestions.length === 0 && (

              <div className="text-zinc-400 text-sm">

                No questions yet.

              </div>

            )}

            {analytics.topQuestions.map(
              (item, index) => (

                <div
                  key={index}
                  className="border rounded-xl p-4"
                >

                  <div className="flex justify-between items-center">

                    <span className="font-semibold">

                      #{index + 1}

                    </span>

                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">

                      {item.count}×

                    </span>

                  </div>

                  <p className="mt-3 text-sm leading-relaxed">

                    {item.question}

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>

      {/* Recent Conversations */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-6">

          Recent Conversations

        </h2>

        <div className="space-y-6">
                   {analytics.recentChats.length === 0 ? (

            <div className="bg-white border border-zinc-200 rounded-2xl p-10 text-center text-zinc-500">

              No conversations yet.

            </div>

          ) : (

            analytics.recentChats.map((chat) => (

              <div
                key={chat.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
              >

                {/* Header */}

                <div className="flex items-center justify-between px-6 py-4 border-b">

                  <div>

                    <div className="font-semibold">

                      Visitor

                    </div>

                    <div className="text-sm text-zinc-500 font-mono">

                      {chat.visitor_id}

                    </div>

                  </div>

                  <div className="text-xs text-zinc-400">

                    {new Date(
                      chat.created_at
                    ).toLocaleString()}

                  </div>

                </div>

                {/* Question */}

                <div className="p-6">

                  <div className="text-sm font-semibold text-zinc-500">

                    Visitor Question

                  </div>

                  <div className="mt-2 rounded-xl bg-blue-50 p-4">

                    {chat.question}

                  </div>

                  {/* AI */}

                  <div className="mt-6 text-sm font-semibold text-zinc-500">

                    AI Response

                  </div>

                  <div className="mt-2 rounded-xl bg-zinc-100 p-4 whitespace-pre-wrap">

                    {chat.answer}

                  </div>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </main>

  );

}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
}

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClass,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-sm text-zinc-500">

            {title}

          </p>

          <h3 className="text-3xl font-bold mt-2">

            {value}

          </h3>

        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      <p className="text-xs text-zinc-400 mt-5">

        {description}

      </p>

    </div>
  );
} 