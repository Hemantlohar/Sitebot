import { supabaseAdmin } from "./supabaseAdmin";
import { generateEmbedding } from "./embedding";

export async function saveChunks(
  websiteId: string,
  chunks: string[],
  fileName: string
) {
  if (!websiteId) {
    throw new Error(
      "Website ID is required."
    );
  }

  if (!fileName) {
    throw new Error(
      "File name is required."
    );
  }

  if (
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    throw new Error(
      "No chunks were provided."
    );
  }

  console.log(
    "=========================================="
  );

  console.log("SAVING KNOWLEDGE CHUNKS");
  console.log("WEBSITE:", websiteId);
  console.log("SOURCE:", fileName);
  console.log("TOTAL:", chunks.length);

  console.log(
    "=========================================="
  );

  // ==========================================
  // 1. GENERATE ALL EMBEDDINGS FIRST
  // ==========================================

  const preparedChunks: {
    website_id: string;
    file_name: string;
    uploaded_at: string;
    chunk_index: number;
    chunk_text: string;
    embedding: number[];
  }[] = [];

  const uploadedAt =
    new Date().toISOString();

  for (
    let i = 0;
    i < chunks.length;
    i++
  ) {
    const chunk =
      chunks[i]?.trim();

    if (!chunk) {
      continue;
    }

    console.log(
      `Generating embedding ${i + 1}/${chunks.length}`
    );

    const embedding =
      await generateEmbedding(chunk);

    if (
      !embedding ||
      embedding.length === 0
    ) {
      throw new Error(
        `Embedding generation failed for chunk ${i + 1}.`
      );
    }

    preparedChunks.push({
      website_id:
        websiteId,

      file_name:
        fileName,

      uploaded_at:
        uploadedAt,

      chunk_index:
        i,

      chunk_text:
        chunk,

      embedding,
    });
  }

  if (
    preparedChunks.length === 0
  ) {
    throw new Error(
      "No valid chunks could be prepared."
    );
  }

  // ==========================================
  // 2. DELETE PREVIOUS VERSION
  // ==========================================

  const { error: deleteError } =
    await supabaseAdmin
      .from("website_chunks")
      .delete()
      .eq(
        "website_id",
        websiteId
      )
      .eq(
        "file_name",
        fileName
      );

  if (deleteError) {
    throw new Error(
      `Failed to replace existing knowledge: ${deleteError.message}`
    );
  }

  // ==========================================
  // 3. INSERT PREPARED CHUNKS
  // ==========================================

  const { error: insertError } =
    await supabaseAdmin
      .from("website_chunks")
      .insert(preparedChunks);

  if (insertError) {
    console.error(
      "CHUNK INSERT ERROR:",
      insertError
    );

    throw new Error(
      `Failed to save knowledge chunks: ${insertError.message}`
    );
  }

  console.log(
    `${preparedChunks.length} chunks saved successfully.`
  );

  return {
    success: true,

    savedChunks:
      preparedChunks.length,
  };
}

























// import { supabaseAdmin } from "./supabaseAdmin";
// import { generateEmbedding } from "./embedding";
// export async function saveChunks(
//   websiteId: string,
//   chunks: string[],
//   fileName: string
// ) {
//   // Delete previous chunks of the same file
//   await supabaseAdmin
//     .from("website_chunks")
//     .delete()
//     .eq("website_id", websiteId)
//     .eq("file_name", fileName);

//   for (let i = 0; i < chunks.length; i++) {
//     try {
//       console.log(`Generating embedding for chunk ${i + 1}`);

//       const embedding = await generateEmbedding(chunks[i]);

//       if (!embedding || embedding.length === 0) {
//         console.log(
//           `Skipping chunk ${i + 1}: embedding generation failed`
//         );
//         continue;
//       }

//       const { error } = await supabaseAdmin
//         .from("website_chunks")
//         .insert({
//           website_id: websiteId,
//           file_name: fileName,
//           uploaded_at: new Date().toISOString(),
//           chunk_index: i,
//           chunk_text: chunks[i],
//           embedding,
//         });

//       if (error) {
//         console.error(
//           `Supabase insert failed for chunk ${i + 1}`,
//           error
//         );
//       } else {
//         console.log(`Chunk ${i + 1} saved`);
//       }
//     } catch (err) {
//       console.error(
//         `Error while saving chunk ${i + 1}`,
//         err
//       );
//     }
//   }
// }