import "server-only";

import {
  createEmbedding,
} from "./ai/embedding";

import {
  supabaseAdmin,
} from "./supabaseAdmin";

export async function searchRelevantChunks(
  question: string,
  websiteId: string
) {
  try {
    console.log(
      "Generating question embedding..."
    );

    const embedding =
      await createEmbedding(
        question.slice(0, 500)
      );

    const {
      data,
      error,
    } = await supabaseAdmin.rpc(
      "match_chunks",
      {
        query_embedding:
          embedding,

        match_website:
          websiteId,

        match_count: 3,
      }
    );

    if (error) {
      console.error(
        "RAG RPC ERROR:",
        error
      );

      return [];
    }

    console.log(
      `Retrieved ${
        data?.length || 0
      } relevant chunks`
    );

    return data || [];
  } catch (error) {
    console.error(
      "RAG ERROR:",
      error
    );

    return [];
  }
}