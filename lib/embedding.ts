import "server-only";

import {
  createEmbedding,
} from "./ai/embedding";

export async function generateEmbedding(
  text: string
) {
  try {
    return await createEmbedding(text);
  } catch (error) {
    console.error(
      "EMBEDDING ERROR:",
      error
    );

    return [];
  }
}




















// import ollama from "ollama";

// export async function generateEmbedding(text: string) {
//   try {
//     const response = await ollama.embeddings({
//       model: "nomic-embed-text",
//       prompt: text.slice(0,4000),
//     });

//     return response.embedding;
//   } catch (error) {
//     console.error("Embedding Error:", error);

//     return [];
//   }
// }