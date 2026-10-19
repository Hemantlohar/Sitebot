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

    // Authenticate user
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse(
        "Unauthorized",
        {
          status: 401,
        }
      );
    }

    // Verify ownership
    const { data: website } =
      await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (!website) {
      return new NextResponse(
        "Bot not found",
        {
          status: 404,
        }
      );
    }

    // Load chats
    const {
      data: chats,
      error,
    } = await supabaseAdmin
      .from("chat_messages")
      .select(`
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

    if (error) {
      throw error;
    }

    let csv =
      "Visitor ID,Conversation ID,Question,Answer,Date\n";

    chats?.forEach((chat) => {
      csv += `"${chat.visitor_id}","${chat.conversation_id}","${(chat.question || "").replace(/"/g, '""')}","${(chat.answer || "").replace(/"/g, '""')}","${chat.created_at}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",

        "Content-Disposition":
          'attachment; filename="conversations.csv"',
      },
    });
  } catch (error) {
    console.error(error);

    return new NextResponse(
      "Failed to export CSV",
      {
        status: 500,
      }
    );
  }
}