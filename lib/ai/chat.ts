import "server-only";

import Groq from "groq-sdk";

export interface AIChatOptions {
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}

let groqInstance: Groq | null = null;

function getGroq(): Groq {
  if (groqInstance) {
    return groqInstance;
  }
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY environment variable.");
  }
  groqInstance = new Groq({ apiKey });
  return groqInstance;
}

const MODEL =
  process.env.GROQ_CHAT_MODEL ||
  "llama-3.3-70b-versatile";

const REQUEST_TIMEOUT = 30000;

async function withTimeout<T>(
  promise: Promise<T>,
  timeout = REQUEST_TIMEOUT
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Groq request timed out."
            )
          ),
        timeout
      )
    ),
  ]);
}

export async function generateChatResponse({
  prompt,
  temperature = 0.2,
  jsonMode = false,
}: AIChatOptions): Promise<string> {
  try {
    const response = await withTimeout(
      getGroq().chat.completions.create({
        model: MODEL,
        temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: jsonMode
          ? { type: "json_object" }
          : undefined,
      })
    );

    const text =
      response.choices[0]?.message?.content?.trim();

    if (!text) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    return text;
  } catch (error) {
    console.error(
      "Groq generateChatResponse error:",
      error
    );
    throw new Error(
      "Failed to generate AI response."
    );
  }
}

export async function generateChatStream({
  prompt,
  temperature = 0.2,
}: AIChatOptions) {
  try {
    return await withTimeout(
      getGroq().chat.completions.create({
        model: MODEL,
        stream: true,
        temperature,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })
    );
  } catch (error) {
    console.error(
      "Groq generateChatStream error:",
      error
    );
    throw new Error(
      "Failed to start AI stream."
    );
  }
}

















// import "server-only";

// import ollama from "ollama";

// export interface AIChatOptions {
//   prompt: string;
//   temperature?: number;
//   jsonMode?: boolean;
// }

// export async function generateChatResponse({
//   prompt,
//   temperature = 0.2,
//   jsonMode = false,
// }: AIChatOptions) {
//   const response = await ollama.chat({
//     model:
//       process.env.OLLAMA_CHAT_MODEL ||
//       "qwen2.5:1.5b",

//     stream: false,

//     ...(jsonMode
//       ? { format: "json" as const }
//       : {}),

//     options: {
//       temperature,
//     },

//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//   });

//   const text =
//     response.message?.content?.trim();

//   if (!text) {
//     throw new Error(
//       "AI returned an empty response."
//     );
//   }

//   return text;
// }

// export async function generateChatStream({
//   prompt,
//   temperature = 0.2,
// }: AIChatOptions) {
//   return ollama.chat({
//     model:
//       process.env.OLLAMA_CHAT_MODEL ||
//       "qwen2.5:1.5b",

//     stream: true,

//     options: {
//       temperature,
//     },

//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//   });
// }