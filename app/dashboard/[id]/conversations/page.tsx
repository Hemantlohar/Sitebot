"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";

import {
  Bot,
  MessageCircle,
  Search,
  UserRound,
  Clock3,
  MessagesSquare,
  Loader2,
} from "lucide-react";

interface Chat {
  id: string;
  visitor_id: string;
  conversation_id: string | null;
  question: string;
  answer: string;
  created_at: string;
}

interface Conversation {
  conversationId: string;
  visitorId: string;
  chats: Chat[];
  messageCount: number;
  startedAt: string;
  lastActivity: string;
}

export default function ConversationsPage() {
  const params = useParams();

  const websiteId = params.id as string;

  const [chats, setChats] = useState<Chat[]>(
    []
  );

  const [
  selectedConversationId,
  setSelectedConversationId,
] = useState<string>("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // LOAD CONVERSATIONS
  // ==========================================

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/conversations/${websiteId}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(
            data.error ||
              "Failed to load conversations."
          );
        }

        const loadedChats: Chat[] =
          data.chats || [];

        setChats(loadedChats);

      } catch (error: any) {
        console.error(error);

        setError(
          error?.message ||
            "Failed to load conversations."
        );
      } finally {
        setLoading(false);
      }
    }

    if (websiteId) {
      loadConversations();
    }
  }, [websiteId]);

 // ==========================================
// GROUP BY CONVERSATION
// ==========================================

const conversations =
  useMemo<Conversation[]>(() => {
    const grouped: Record<
      string,
      Chat[]
    > = {};

    chats.forEach((chat) => {
      const conversationKey =
        chat.conversation_id ||
        chat.visitor_id ||
        chat.id;

      if (!grouped[conversationKey]) {
        grouped[conversationKey] = [];
      }

      grouped[conversationKey].push(chat);
    });

    return Object.entries(grouped)
      .map(
        ([
          conversationId,
          conversationChats,
        ]) => {
          const sortedChats = [
            ...conversationChats,
          ].sort(
            (a, b) =>
              new Date(
                a.created_at
              ).getTime() -
              new Date(
                b.created_at
              ).getTime()
          );

          return {
            conversationId,

            visitorId:
              sortedChats[0]
                ?.visitor_id ||
              "anonymous",

            chats: sortedChats,

            messageCount:
              sortedChats.length,

            startedAt:
              sortedChats[0]
                .created_at,

            lastActivity:
              sortedChats[
                sortedChats.length - 1
              ].created_at,
          };
        }
      )
      .sort(
        (a, b) =>
          new Date(
            b.lastActivity
          ).getTime() -
          new Date(
            a.lastActivity
          ).getTime()
      );
  }, [chats]);

  useEffect(() => {
  if (
    conversations.length > 0 &&
    !selectedConversationId
  ) {
    setSelectedConversationId(
      conversations[0].conversationId
    );
  }
}, [
  conversations,
  selectedConversationId,
]);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredConversations =
    conversations.filter(
      (conversation) => {
        const value =
          search.toLowerCase();

        return (
  conversation.conversationId
    .toLowerCase()
    .includes(value) ||

  conversation.visitorId
    .toLowerCase()
    .includes(value) ||
          conversation.chats.some(
            (chat) =>
              chat.question
                .toLowerCase()
                .includes(value) ||
              chat.answer
                .toLowerCase()
                .includes(value)
          )
        );
      }
    );

  // ==========================================
  // SELECTED CONVERSATION
  // ==========================================

  const activeConversation =
  conversations.find(
    (conversation) =>
      conversation.conversationId ===
      selectedConversationId
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6 md:p-10">
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2
            className="animate-spin"
            size={22}
          />

          <span>
            Loading conversations...
          </span>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="p-6 md:p-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 md:text-4xl">
          Conversations
        </h1>

        <p className="mt-2 text-zinc-500">
          Review conversations between
          visitors and your AI assistant.
        </p>

      </div>


      {/* STATS */}

      <div className="mb-8 grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessagesSquare size={21} />
            </div>

            <div>
              <p className="text-sm text-zinc-500">
                Conversations
              </p>

              <p className="text-2xl font-bold text-zinc-950">
                {conversations.length}
              </p>
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <MessageCircle size={21} />
            </div>

            <div>
              <p className="text-sm text-zinc-500">
                Questions Answered
              </p>

              <p className="text-2xl font-bold text-zinc-950">
                {chats.length}
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* EMPTY STATE */}

      {conversations.length === 0 ? (

        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
            <MessageCircle size={30} />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-zinc-950">
            No conversations yet
          </h2>

          <p className="mt-2 max-w-md text-zinc-500">
            Conversations will appear here
            after visitors start chatting with
            your embedded AI assistant.
          </p>

        </div>

      ) : (

        <div className="grid min-h-[650px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">

          {/* LEFT PANEL */}

          <aside className="border-b border-zinc-200 lg:border-b-0 lg:border-r">

            <div className="border-b border-zinc-200 p-4">

              <div className="relative">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search conversations..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                />

              </div>

            </div>


            <div className="max-h-[590px] overflow-y-auto">

              {filteredConversations.map(
                (conversation) => {

                  const selected =
  selectedConversationId ===
  conversation.conversationId;

                  const latestChat =
                    conversation.chats[
                      conversation.chats
                        .length - 1
                    ];

                  return (
                    <button
                      key={  conversation.conversationId
}
                      onClick={() =>
  setSelectedConversationId(
    conversation.conversationId
  )
}
                      className={`w-full border-b border-zinc-100 p-4 text-left transition ${
                        selected
                          ? "bg-blue-50"
                          : "hover:bg-zinc-50"
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <UserRound
                            size={18}
                          />
                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-2">

                            <p className="truncate text-sm font-semibold text-zinc-900">
                                 Conversation
                            </p>

                            <span className="shrink-0 text-[11px] text-zinc-400">
                              {new Date(
                                conversation.lastActivity
                              ).toLocaleDateString()}
                            </span>

                          </div>


                          <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-400">
                            {
                              conversation.visitorId
                            }
                          </p>


                          <p className="mt-2 truncate text-sm text-zinc-500">
                            {
                              latestChat.question
                            }
                          </p>


                          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">

                            <MessageCircle
                              size={12}
                            />

                            {
                              conversation.messageCount
                            }{" "}
                            question
                            {
                              conversation.messageCount !==
                              1
                                ? "s"
                                : ""
                            }

                          </div>

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </aside>


          {/* RIGHT PANEL */}

          <section className="flex min-h-[650px] flex-col">

            {activeConversation ? (
              <>

                {/* CHAT HEADER */}

                <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                      <UserRound
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="font-semibold text-zinc-950">
                            Conversation
                      </p>

                      <p className="max-w-[220px] truncate font-mono text-xs text-zinc-400 md:max-w-md">
                        {
                          activeConversation.visitorId
                        }
                      </p>

                    </div>

                  </div>


                  <div className="hidden items-center gap-1.5 text-xs text-zinc-400 sm:flex">

                    <Clock3 size={14} />

                    Last active{" "}

                    {new Date(
                      activeConversation.lastActivity
                    ).toLocaleString()}

                  </div>

                </div>


                {/* MESSAGES */}

                <div className="flex-1 space-y-6 overflow-y-auto bg-zinc-50/70 p-5 md:p-7">

                  {activeConversation.chats.map(
                    (chat) => (
                      <div
                        key={chat.id}
                        className="space-y-4"
                      >

                        {/* USER */}

                        <div className="flex justify-end">

                          <div className="max-w-[82%]">

                            <div className="mb-1 flex justify-end gap-1.5 text-xs text-zinc-400">

                              <span>
                                Visitor
                              </span>

                              <UserRound
                                size={13}
                              />

                            </div>

                            <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                              {chat.question}
                            </div>

                          </div>

                        </div>


                        {/* AI */}

                        <div className="flex justify-start">

                          <div className="max-w-[82%]">

                            <div className="mb-1 flex items-center gap-1.5 text-xs text-zinc-400">

                              <Bot
                                size={13}
                              />

                              <span>
                                AI Assistant
                              </span>

                            </div>

                            <div className="rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-700 shadow-sm whitespace-pre-wrap">
                              {chat.answer}
                            </div>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </>
            ) : (

              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">

                <MessageCircle
                  size={38}
                  className="text-zinc-300"
                />

                <p className="mt-4 font-medium text-zinc-700">
                  Select a conversation
                </p>

                <p className="mt-1 text-sm text-zinc-400">
                  Choose a visitor from the
                  conversation list.
                </p>

              </div>

            )}

          </section>

        </div>

      )}

    </main>
  );
}