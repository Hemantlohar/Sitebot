import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from("websites")
      .select(`
        id,
        bot_name,
        welcome_message,
        theme,
        suggested_questions,
        primary_color,
        header_color,
        widget_position,
        widget_width,
        border_radius,
        logo_url,
        is_active
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("WIDGET CONFIG ERROR:", error);

      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Bot not found.",
        }),
        {
          status: 404,
          headers: corsHeaders,
        }
      );
    }

    if (!data.is_active) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "This bot is currently paused.",
          paused: true,
        }),
        {
          status: 403,
          headers: corsHeaders,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        config: data,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("WIDGET ROUTE ERROR:", error);

    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to load widget configuration.",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}