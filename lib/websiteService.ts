import { supabaseAdmin } from "./supabaseAdmin";
import type { ParsedAnalysis } from "./analysisParser";

export async function getWebsite(
  url: string,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from("websites")
    .select("*")
    .eq("website_url", url)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "GET WEBSITE ERROR:",
      error
    );

    throw error;
  }

  return data;
}

interface SaveWebsiteData {
  user_id: string;

  website_url: string;

  industry: string;

  business_type: string;

  bot_name: string;

  welcome_message: string;

  theme: string;

  suggested_questions: string[];

  website_content: string;

  analysis_json: ParsedAnalysis | Record<string, unknown>;

  products: string[];
}

export async function saveWebsite(
  data: SaveWebsiteData
) {
  console.log(
    "========== SAVING WEBSITE =========="
  );

  console.log({
    website_url: data.website_url,
    industry: data.industry,
    business_type: data.business_type,
    bot_name: data.bot_name,
  });

  const { data: website, error } =
    await supabaseAdmin
      .from("websites")
      .insert(data)
      .select()
      .single();

  if (error) {
    console.error(
      "SAVE WEBSITE ERROR:",
      error
    );

    throw error;
  }

  return website;
}