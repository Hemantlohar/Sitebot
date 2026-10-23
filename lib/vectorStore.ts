import "server-only";

import { supabaseAdmin } from "./supabaseAdmin";
import { generateBatchEmbeddings } from "./embedding";
import { validateEmbedding } from "./ai/embedding";
import { EMBEDDING_DIMENSION } from "./ai/models";

export interface PreparedChunk {
  website_id: string;
  file_name: string;
  uploaded_at: string;
  chunk_index: number;
  chunk_text: string;
  embedding: number[];
}

/**
 * Saves text chunks with generated Gemini embeddings to Supabase pgvector.
 * Replaces any existing chunks for the same source/fileName to prevent duplicate indexing.
 */
export async function saveChunks(
  websiteId: string,
  chunks: string[],
  fileName: string
): Promise<{ success: boolean; savedChunks: number }> {
  if (!websiteId || typeof websiteId !== "string") {
    throw new Error("Website ID is required.");
  }

  if (!fileName || typeof fileName !== "string") {
    throw new Error("File name is required.");
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No chunks were provided.");
  }

  // Filter out empty or whitespace-only chunks
  const validChunks = chunks
    .map((c) => (typeof c === "string" ? c.trim() : ""))
    .filter((c) => c.length > 0);

  if (validChunks.length === 0) {
    throw new Error("All provided chunks were empty after cleaning.");
  }

  console.log("==========================================");
  console.log("SAVING KNOWLEDGE CHUNKS (Gemini 768d)");
  console.log("WEBSITE:", websiteId);
  console.log("SOURCE:", fileName);
  console.log("TOTAL CHUNKS:", validChunks.length);
  console.log("==========================================");

  // 1. Generate embeddings in controlled batches (concurrency: 4)
  console.log("Generating Gemini embeddings for all chunks...");
  const embeddings = await generateBatchEmbeddings(validChunks, {
    concurrency: 4,
    onProgress: (done, total) => {
      console.log(`Embedding progress: ${done}/${total}`);
    },
  });

  const uploadedAt = new Date().toISOString();
  const preparedChunks: PreparedChunk[] = [];

  for (let i = 0; i < validChunks.length; i++) {
    const chunkText = validChunks[i];
    const embedding = embeddings[i];

    // Validate vector structure
    validateEmbedding(embedding, EMBEDDING_DIMENSION);

    preparedChunks.push({
      website_id: websiteId,
      file_name: fileName,
      uploaded_at: uploadedAt,
      chunk_index: i,
      chunk_text: chunkText,
      embedding,
    });
  }

  // 2. Delete previous version of this document to prevent duplicates
  const { error: deleteError } = await supabaseAdmin
    .from("website_chunks")
    .delete()
    .eq("website_id", websiteId)
    .eq("file_name", fileName);

  if (deleteError) {
    throw new Error(
      `Failed to clean previous knowledge version: ${deleteError.message}`
    );
  }

  // 3. Insert newly prepared chunks with embeddings
  const { error: insertError } = await supabaseAdmin
    .from("website_chunks")
    .insert(preparedChunks);

  if (insertError) {
    console.error("CHUNK INSERT ERROR:", insertError);
    throw new Error(`Failed to save knowledge chunks: ${insertError.message}`);
  }

  console.log(`${preparedChunks.length} chunks saved successfully.`);

  return {
    success: true,
    savedChunks: preparedChunks.length,
  };
}

/**
 * Re-indexes all existing chunks for a website using Gemini Embedding 2.
 * Preserves source chunk text and structure while updating incompatible legacy vectors.
 */
export async function reindexWebsiteChunks(
  websiteId: string
): Promise<{ success: boolean; reindexedCount: number }> {
  if (!websiteId) {
    throw new Error("Website ID is required for re-indexing.");
  }

  console.log(`[Re-indexing] Fetching existing chunks for bot ${websiteId}...`);

  const { data: existingChunks, error: fetchError } = await supabaseAdmin
    .from("website_chunks")
    .select("id, file_name, chunk_index, chunk_text")
    .eq("website_id", websiteId)
    .order("chunk_index", { ascending: true });

  if (fetchError) {
    throw new Error(`Failed to fetch chunks for re-indexing: ${fetchError.message}`);
  }

  if (!existingChunks || existingChunks.length === 0) {
    console.log(`[Re-indexing] No existing chunks found for bot ${websiteId}.`);
    return { success: true, reindexedCount: 0 };
  }

  console.log(
    `[Re-indexing] Generating new Gemini embeddings for ${existingChunks.length} chunks...`
  );

  const texts = existingChunks.map((c) => c.chunk_text);
  const newEmbeddings = await generateBatchEmbeddings(texts, {
    concurrency: 4,
    onProgress: (done, total) => {
      console.log(`[Re-indexing] Progress: ${done}/${total}`);
    },
  });

  // Update records one by one or in small batches
  let updated = 0;
  for (let i = 0; i < existingChunks.length; i++) {
    const chunk = existingChunks[i];
    const embedding = newEmbeddings[i];
    validateEmbedding(embedding, EMBEDDING_DIMENSION);

    const { error: updateError } = await supabaseAdmin
      .from("website_chunks")
      .update({
        embedding,
        uploaded_at: new Date().toISOString(),
      })
      .eq("id", chunk.id);

    if (updateError) {
      console.error(
        `[Re-indexing] Failed to update chunk ${chunk.id}:`,
        updateError
      );
      throw new Error(`Re-indexing update failed: ${updateError.message}`);
    }
    updated++;
  }

  console.log(
    `[Re-indexing] Successfully re-indexed ${updated} chunks for bot ${websiteId}.`
  );

  return { success: true, reindexedCount: updated };
}