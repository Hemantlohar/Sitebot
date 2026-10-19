import { supabaseAdmin } from "./supabaseAdmin";

interface SaveChatData {
  website_id: string;
  visitor_id: string;
  conversation_id: string;
  question: string;
  answer: string;
}

export async function saveChat(
  data: SaveChatData
) {
  const { error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      website_id: data.website_id,
      visitor_id: data.visitor_id,
      conversation_id: data.conversation_id,
      question: data.question,
      answer: data.answer,
    });

  if (error) {
    console.error(
      "CHAT SAVE ERROR:",
      error
    );

    throw new Error(
      "Failed to save chat message."
    );
  }
}