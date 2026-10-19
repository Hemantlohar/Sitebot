import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

interface ChatRow {
  id: string;
  visitor_id: string;
  conversation_id: string | null;
  question: string;
  answer: string;
  created_at: string;
}

export async function GET(
  req: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    // ==========================================
    // 1. AUTHENTICATE USER
    // ==========================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // 2. VERIFY BOT OWNERSHIP
    // ==========================================

    const {
      data: website,
      error: websiteError,
    } = await supabaseAdmin
      .from("websites")
      .select(
        "id, bot_name, website_url"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (websiteError) {
      return NextResponse.json(
        {
          success: false,
          error: websiteError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!website) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Bot not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // 3. LOAD CHAT DATA
    // ==========================================

    const {
      data,
      error,
    } = await supabaseAdmin
      .from("chat_messages")
      .select(`
        id,
        visitor_id,
        conversation_id,
        question,
        answer,
        created_at
      `)
      .eq("website_id", id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    const chats: ChatRow[] =
      data || [];

    // ==========================================
    // 4. BASIC METRICS
    // ==========================================

    const totalQuestions =
      chats.length;

    const totalResponses =
      chats.filter(
        (chat) =>
          chat.answer &&
          chat.answer.trim().length > 0
      ).length;

    const visitorIds =
      chats
        .map(
          (chat) =>
            chat.visitor_id
        )
        .filter(Boolean);

    const uniqueVisitors =
      new Set(visitorIds).size;

    const conversationIds =
      chats.map((chat) => {
        return (
          chat.conversation_id ||
          chat.visitor_id ||
          chat.id
        );
      });

    const totalConversations =
      new Set(
        conversationIds
      ).size;

    // ==========================================
    // 5. LAST 7 DAYS ACTIVITY
    // ==========================================

    const activityMap: Record<
      string,
      number
    > = {};

    const activityLast7Days: {
      date: string;
      label: string;
      questions: number;
    }[] = [];

    for (
      let i = 6;
      i >= 0;
      i--
    ) {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() - i
      );

      const key =
        date
          .toISOString()
          .split("T")[0];

      activityMap[key] = 0;
    }

    chats.forEach((chat) => {
      const key =
        new Date(
          chat.created_at
        )
          .toISOString()
          .split("T")[0];

      if (
        Object.prototype
          .hasOwnProperty.call(
            activityMap,
            key
          )
      ) {
        activityMap[key]++;
      }
    });

    for (
      let i = 6;
      i >= 0;
      i--
    ) {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() - i
      );

      const key =
        date
          .toISOString()
          .split("T")[0];

      activityLast7Days.push({
        date: key,

        label:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),

        questions:
          activityMap[key] || 0,
      });
    }

    // ==========================================
    // 6. TOP QUESTIONS
    // ==========================================

    const questionCounts =
      new Map<
        string,
        {
          question: string;
          count: number;
        }
      >();

    chats.forEach((chat) => {
      const cleanQuestion =
        chat.question
          ?.trim()
          .replace(/\s+/g, " ");

      if (!cleanQuestion) {
        return;
      }

      const key =
        cleanQuestion.toLowerCase();

      const existing =
        questionCounts.get(key);

      if (existing) {
        existing.count++;
      } else {
        questionCounts.set(
          key,
          {
            question:
              cleanQuestion,

            count: 1,
          }
        );
      }
    });

    const topQuestions =
      Array.from(
        questionCounts.values()
      )
        .sort(
          (a, b) =>
            b.count - a.count
        )
        .slice(0, 5);

    // ==========================================
    // 7. TODAY'S ACTIVITY
    // ==========================================

    const todayKey =
      new Date()
        .toISOString()
        .split("T")[0];

    const questionsToday =
      chats.filter(
        (chat) =>
          new Date(
            chat.created_at
          )
            .toISOString()
            .split("T")[0] ===
          todayKey
      ).length;

    // ==========================================
    // 8. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      analytics: {
        botName:
          website.bot_name,

        websiteUrl:
          website.website_url,

        totalVisitors:
          uniqueVisitors,

        totalQuestions,

        totalResponses,

        totalConversations,

        questionsToday,

        activityLast7Days,

        topQuestions,

        recentChats:
          chats.slice(0, 8),
      },
    });
  } catch (error) {
    console.error(
      "ANALYTICS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}