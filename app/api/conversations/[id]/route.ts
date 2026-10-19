import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  params: Promise<{
    id: string;
  }>;
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
      .select("id, bot_name, website_url")
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
    // 3. LOAD CHAT MESSAGES
    // ==========================================

    const {
      data: chats,
      error: chatsError,
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
        ascending: true,
      });

    if (chatsError) {
      return NextResponse.json(
        {
          success: false,
          error: chatsError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 4. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      bot: {
        id: website.id,
        botName: website.bot_name,
        websiteUrl: website.website_url,
      },

      chats: chats || [],
    });
  } catch (error) {
    console.error(
      "CONVERSATIONS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load conversations.",
      },
      {
        status: 500,
      }
    );
  }
}