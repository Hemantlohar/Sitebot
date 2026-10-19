import { NextResponse } from "next/server";

import { crawlWebsite } from "../../../lib/crawler";
import { analyzeBusiness } from "../../../lib/analyzer";
import { generateBotConfig } from "../../../lib/botGenerator";
import { generateWidgetCode } from "../../../lib/widgetGenerator";
import { extractProducts } from "../../../lib/extractProducts";
import { chunkText } from "../../../lib/chunkText";
import { parseAnalysis } from "../../../lib/analysisParser";

import {
  getWebsite,
  saveWebsite,
} from "../../../lib/websiteService";

import { saveChunks } from "../../../lib/vectorStore";
import { cleanWebsite } from "../../../lib/cleanWebsite";
import { cleanContent } from "../../../lib/contentCleaner";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isSafeUrl } from "../../../lib/ssrfProtection";
import { analyzeRateLimit } from "@/lib/rateLimiter";


export async function POST(req: Request) {
  try {

    // ==================================================
    // 1. AUTHENTICATION
    // ==================================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();


    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // Rate Limiting Enforcement
    const rateLimitResult = await analyzeRateLimit.limit(`analyze:${user.id}`);
    if (!rateLimitResult.success) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Analysis rate limit exceeded. Please wait before analyzing another website.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      );
    }


    // ==================================================
    // 2. READ REQUEST
    // ==================================================

    const body = await req.json();


    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";


    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "Website URL is required.",
        },
        {
          status: 400,
        }
      );
    }


    // ==================================================
    // 3. VALIDATE URL
    // ==================================================

    try {

      const parsedUrl =
        new URL(url);


      if (
        parsedUrl.protocol !== "http:" &&
        parsedUrl.protocol !== "https:"
      ) {
        throw new Error(
          "Invalid protocol"
        );
      }

    } catch {

      return NextResponse.json(
        {
          success: false,

          error:
            "Please enter a valid website URL, for example: https://example.com",
        },
        {
          status: 400,
        }
      );

    }

    // SSRF URL Safety Validation
    const isSafe = await isSafeUrl(url);
    if (!isSafe) {
      return NextResponse.json(
        {
          success: false,
          error: "Access to private or local network addresses is not allowed.",
        },
        {
          status: 400,
        }
      );
    }


    console.log(
      "=========================================="
    );

    console.log("ANALYZE REQUEST");

    console.log(
      "USER ID:",
      user.id
    );

    console.log(
      "URL:",
      url
    );

    console.log(
      "=========================================="
    );


    // ==================================================
    // 4. CHECK CACHE
    // ==================================================

    const existingWebsite =
      await getWebsite(
        url,
        user.id
      );


    if (existingWebsite) {

      console.log(
        "Website already analyzed. Loading cached bot."
      );


      // ------------------------------------------
      // Load stored analysis
      // ------------------------------------------

      const storedAnalysis =
        existingWebsite.analysis_json || {};


      const cachedAnalysis = {

        businessName:
          storedAnalysis.businessName ||
          storedAnalysis.business_name ||
          "",

        industry:
          storedAnalysis.industry ||
          existingWebsite.industry ||
          "Other",

        businessType:
          storedAnalysis.businessType ||
          storedAnalysis.business_type ||
          existingWebsite.business_type ||
          "General Business",

        recommendedBot:
          storedAnalysis.recommendedBot ||
          storedAnalysis.recommended_bot ||
          "Support Assistant",

        features:
          Array.isArray(
            storedAnalysis.features
          )
            ? storedAnalysis.features
            : [],
      };


      console.log(
        "========== CACHED ANALYSIS =========="
      );

      console.log(
        cachedAnalysis
      );


      // ------------------------------------------
      // Generate fallback config
      // ------------------------------------------

      const generatedCachedConfig =
        generateBotConfig(
          JSON.stringify(
            cachedAnalysis
          )
        );


      // ------------------------------------------
      // Preserve user's saved customization
      // ------------------------------------------

      const finalCachedBotConfig = {

        ...generatedCachedConfig,


        botName:
          existingWebsite.bot_name ||
          generatedCachedConfig.botName,


        welcomeMessage:
          existingWebsite.welcome_message ||
          generatedCachedConfig.welcomeMessage,


        theme:
          existingWebsite.theme ||
          generatedCachedConfig.theme,


        suggestedQuestions:
          Array.isArray(
            existingWebsite.suggested_questions
          ) &&
          existingWebsite
            .suggested_questions
            .length > 0

            ? existingWebsite
                .suggested_questions

            : generatedCachedConfig
                .suggestedQuestions,


        businessName:
          cachedAnalysis.businessName,


        industry:
          cachedAnalysis.industry,


        businessType:
          cachedAnalysis.businessType,


        recommendedBot:
          cachedAnalysis.recommendedBot,


        features:
          cachedAnalysis.features,
      };


      const cachedWidgetCode =
        generateWidgetCode(
          existingWebsite.id
        );


      return NextResponse.json({

        success: true,


        websiteId:
          existingWebsite.id,


        analysis:
          JSON.stringify(
            cachedAnalysis,
            null,
            2
          ),


        websiteAnalysis:
          JSON.stringify(
            cachedAnalysis,
            null,
            2
          ),


        botConfig:
          finalCachedBotConfig,


        widgetCode:
          cachedWidgetCode,


        websiteContent:
          existingWebsite.website_content ||
          "",


        products:
          existingWebsite.products ||
          [],


        cached: true,

      });
    }


    // ==================================================
    // 5. CRAWL WEBSITE
    // ==================================================

    console.log(
      "========== CRAWLING WEBSITE =========="
    );


    const content =
      await crawlWebsite(url);


    if (
      !content ||
      !content.trim()
    ) {

      throw new Error(
        "No readable content could be extracted from this website."
      );

    }


    // ==================================================
    // 6. CLEAN WEBSITE CONTENT
    // ==================================================

    const cleanedContent =
      cleanContent(
        cleanWebsite(content)
      );


    if (
      !cleanedContent.trim()
    ) {

      throw new Error(
        "Website content was empty after cleaning."
      );

    }


    // Keep content reasonable for local model

    const shortContent =
      cleanedContent.slice(
        0,
        15000
      );


    console.log(
      "CLEAN CONTENT LENGTH:",
      shortContent.length
    );


    // ==================================================
    // 7. ANALYZE BUSINESS
    // ==================================================

    console.log(
      "========== ANALYZING BUSINESS =========="
    );


    const analysis =
      await analyzeBusiness(
        shortContent
      );


    console.log(
      "========== RAW ANALYSIS =========="
    );

    console.log(
      analysis
    );


    // ==================================================
    // 8. PARSE ANALYSIS
    // ==================================================

    const parsedAnalysis =
      parseAnalysis(
        analysis
      );


    console.log(
      "========== FINAL ANALYSIS BEFORE SAVE =========="
    );


    console.log({

      businessName:
        parsedAnalysis.businessName,

      industry:
        parsedAnalysis.industry,

      businessType:
        parsedAnalysis.businessType,

      recommendedBot:
        parsedAnalysis.recommendedBot,

      features:
        parsedAnalysis.features,

    });


    // ==================================================
    // 9. GENERATE BOT CONFIG
    // ==================================================

    const botConfig =
      generateBotConfig(
        JSON.stringify(
          parsedAnalysis
        )
      );


    console.log(
      "========== GENERATED BOT CONFIG =========="
    );

    console.log(
      botConfig
    );


    // ==================================================
    // 10. EXTRACT PRODUCTS
    // ==================================================

    const products =
      extractProducts(
        shortContent
      );


    console.log(
      "PRODUCTS FOUND:",
      products.length
    );


    // ==================================================
    // 11. CREATE KNOWLEDGE CHUNKS
    // ==================================================

    const chunks =
      chunkText(
        shortContent
      );


    console.log(
      "========== CHUNKS =========="
    );


    console.log(
      "TOTAL CHUNKS:",
      chunks.length
    );


    chunks.forEach(
      (
        chunk,
        index
      ) => {

        console.log(
          `Chunk ${index + 1}: ${chunk.length} characters`
        );

      }
    );


    // ==================================================
    // 12. SAVE WEBSITE
    // ==================================================

    console.log(
      "========== SAVING WEBSITE =========="
    );


    const website =
      await saveWebsite({

        user_id:
          user.id,


        website_url:
          url,


        industry:
          parsedAnalysis.industry ||
          "Other",


        business_type:
          parsedAnalysis.businessType ||
          "General Business",


        bot_name:
          botConfig.botName,


        welcome_message:
          botConfig.welcomeMessage,


        theme:
          botConfig.theme,


        suggested_questions:
          botConfig.suggestedQuestions,


        website_content:
          shortContent,


        // IMPORTANT:
        // businessName is included here
        // because parsedAnalysis now contains it

        analysis_json:
          parsedAnalysis,


        products,

      });


    console.log(
      "WEBSITE SAVED WITH ID:",
      website.id
    );


    // ==================================================
    // 13. GENERATE INSTALLATION CODE
    // ==================================================

    const widgetCode =
      generateWidgetCode(
        website.id
      );


    // ==================================================
    // 14. SAVE RAG CHUNKS
    // ==================================================

    if (
      chunks.length > 0
    ) {

      console.log(
        "========== SAVING RAG CHUNKS =========="
      );


      await saveChunks(

        website.id,

        chunks,

        "__website__"

      );

    }


    // ==================================================
    // 15. RESPONSE
    // ==================================================

    return NextResponse.json({

      success: true,


      websiteId:
        website.id,


      analysis:
        JSON.stringify(
          parsedAnalysis,
          null,
          2
        ),


      websiteAnalysis:
        JSON.stringify(
          parsedAnalysis,
          null,
          2
        ),


      botConfig,


      widgetCode,


      websiteContent:
        shortContent,


      products,


      cached: false,

    });


  } catch (error: any) {

    console.error(
      "========== ANALYZE ERROR =========="
    );


    console.error(
      error
    );


    return NextResponse.json(
      {

        success: false,

        error:
          error?.message ||
          "Website analysis failed.",

      },
      {
        status: 500,
      }
    );

  }
}



























// import { NextResponse } from "next/server";

// import { crawlWebsite } from "../../../lib/crawler";
// import { analyzeBusiness } from "../../../lib/analyzer";
// import { generateBotConfig } from "../../../lib/botGenerator";
// import { generateWidgetCode } from "../../../lib/widgetGenerator";
// import { extractProducts } from "../../../lib/extractProducts";
// import { chunkText } from "../../../lib/chunkText";
// import { parseAnalysis } from "../../../lib/analysisParser";
// import {
//   getWebsite,
//   saveWebsite,
// } from "../../../lib/websiteService";
// import { saveChunks } from "../../../lib/vectorStore";
// import { cleanWebsite } from "../../../lib/cleanWebsite";
// import { cleanContent } from "../../../lib/contentCleaner";
// import { createSupabaseServerClient } from "@/lib/supabaseServer";

// export async function POST(req: Request) {
//   try {
//     // ==================================================
//     // 1. AUTHENTICATION
//     // ==================================================

//     const supabase =
//       await createSupabaseServerClient();

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Please login first.",
//         },
//         {
//           status: 401,
//         }
//       );
//     }

//     // ==================================================
//     // 2. READ AND VALIDATE REQUEST
//     // ==================================================

//     const body = await req.json();

//     const url =
//       typeof body.url === "string"
//         ? body.url.trim()
//         : "";

//     if (!url) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Website URL is required.",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     try {
//       const parsedUrl = new URL(url);

//       if (
//         parsedUrl.protocol !== "http:" &&
//         parsedUrl.protocol !== "https:"
//       ) {
//         throw new Error("Invalid protocol");
//       }
//     } catch {
//       return NextResponse.json(
//         {
//           success: false,
//           error:
//             "Please enter a valid website URL, for example: https://example.com",
//         },
//         {
//           status: 400,
//         }
//       );
//     }

//     console.log(
//       "=========================================="
//     );
//     console.log("ANALYZE REQUEST");
//     console.log("USER ID:", user.id);
//     console.log("URL:", url);
//     console.log(
//       "=========================================="
//     );

//     // ==================================================
//     // 3. CHECK CACHE
//     // ==================================================

//     const existingWebsite =
//       await getWebsite(url, user.id);

//     if (existingWebsite) {
//       console.log(
//         "Website already analyzed. Loading cached bot."
//       );

//       /*
//         Prefer stored analysis_json.

//         This keeps the existing cached flow while avoiding
//         re-running the crawler and Ollama.
//       */

//       const cachedAnalysis =
//         existingWebsite.analysis_json || {
//           industry:
//             existingWebsite.industry || "Other",

//           businessType:
//             existingWebsite.business_type ||
//             "General Business",

//           recommendedBot:
//             "Support Assistant",

//           features: [],
//         };

//       const cachedBotConfig =
//         generateBotConfig(
//           JSON.stringify(cachedAnalysis)
//         );

//       /*
//         Important:
//         Keep saved user-customized settings instead of
//         showing only regenerated defaults.
//       */

//       const finalCachedBotConfig = {
//         ...cachedBotConfig,

//         botName:
//           existingWebsite.bot_name ||
//           cachedBotConfig.botName,

//         welcomeMessage:
//           existingWebsite.welcome_message ||
//           cachedBotConfig.welcomeMessage,

//         theme:
//           existingWebsite.theme ||
//           cachedBotConfig.theme,

//         suggestedQuestions:
//           existingWebsite.suggested_questions ||
//           cachedBotConfig.suggestedQuestions,
//       };

//       const cachedWidgetCode =  generateWidgetCode(existingWebsite.id);

//       return NextResponse.json({
//         success: true,

//         websiteId: existingWebsite.id,

//         analysis: JSON.stringify(
//           cachedAnalysis,
//           null,
//           2
//         ),

//         websiteAnalysis:
//           JSON.stringify(
//             cachedAnalysis,
//             null,
//             2
//           ),

//         botConfig: finalCachedBotConfig,

//         widgetCode: cachedWidgetCode,

//         websiteContent:
//           existingWebsite.website_content || "",

//         products:
//           existingWebsite.products || [],

//         cached: true,
//       });
//     }

//     // ==================================================
//     // 4. CRAWL WEBSITE
//     // ==================================================

//     console.log(
//       "========== CRAWLING WEBSITE =========="
//     );

//     const content =
//       await crawlWebsite(url);

//     if (!content || !content.trim()) {
//       throw new Error(
//         "No readable content could be extracted from this website."
//       );
//     }

//     // ==================================================
//     // 5. CLEAN CONTENT
//     // ==================================================

//     const cleanedContent = cleanContent(
//       cleanWebsite(content)
//     );

//     if (!cleanedContent.trim()) {
//       throw new Error(
//         "Website content was empty after cleaning."
//       );
//     }

//     /*
//       Keep the content limited for the local analysis model.
//     */

//     const shortContent =
//       cleanedContent.slice(0, 15000);

//     console.log(
//       "CLEAN CONTENT LENGTH:",
//       shortContent.length
//     );

//     // ==================================================
//     // 6. ANALYZE BUSINESS
//     // ==================================================

//     console.log(
//       "========== ANALYZING BUSINESS =========="
//     );

//     const analysis =
//       await analyzeBusiness(shortContent);

//     console.log(
//       "========== RAW ANALYSIS =========="
//     );

//     console.log(analysis);

//     // ==================================================
//     // 7. PARSE ANALYSIS
//     // ==================================================

//     const parsedAnalysis =
//       parseAnalysis(analysis);

//     console.log(
//       "========== FINAL ANALYSIS BEFORE SAVE =========="
//     );

//     console.log({
//       industry:
//         parsedAnalysis.industry,

//       businessType:
//         parsedAnalysis.businessType,

//       recommendedBot:
//         parsedAnalysis.recommendedBot,

//       features:
//         parsedAnalysis.features,
//     });

//     // ==================================================
//     // 8. GENERATE BOT CONFIG
//     // ==================================================

//     const botConfig =
//   generateBotConfig(
//     JSON.stringify(parsedAnalysis)
//   );

//     // ==================================================
//     // 9. EXTRACT PRODUCTS
//     // ==================================================

//     const products =
//       extractProducts(shortContent);

//     console.log(
//       "PRODUCTS FOUND:",
//       products.length
//     );

//     // ==================================================
//     // 10. CREATE KNOWLEDGE CHUNKS
//     // ==================================================

//     const chunks =
//       chunkText(shortContent);

//     console.log(
//       "========== CHUNKS =========="
//     );

//     console.log(
//       "TOTAL CHUNKS:",
//       chunks.length
//     );

//     chunks.forEach(
//       (chunk, index) => {
//         console.log(
//           `Chunk ${index + 1}: ${chunk.length} characters`
//         );
//       }
//     );

//     // ==================================================
//     // 11. SAVE WEBSITE
//     // ==================================================

//     console.log(
//       "========== SAVING WEBSITE =========="
//     );

//     const website =
//       await saveWebsite({
//         user_id: user.id,

//         website_url: url,

//         industry:
//           parsedAnalysis.industry ||
//           "Other",

//         business_type:
//           parsedAnalysis.businessType ||
//           "General Business",

//         bot_name:
//           botConfig.botName,

//         welcome_message:
//           botConfig.welcomeMessage,

//         theme:
//           botConfig.theme,

//         suggested_questions:
//           botConfig.suggestedQuestions,

//         website_content:
//           shortContent,

//         analysis_json:
//           parsedAnalysis,

//         products,
//       });
//       const widgetCode =
//   generateWidgetCode(website.id);

//     console.log(
//       "WEBSITE SAVED WITH ID:",
//       website.id
//     );

//     // ==================================================
//     // 12. SAVE RAG CHUNKS
//     // ==================================================

//     if (chunks.length > 0) {
//       console.log(
//         "========== SAVING RAG CHUNKS =========="
//       );

//       await saveChunks(
//         website.id,
//         chunks,
//         "__website__"
//       );
//     }

//     // ==================================================
//     // 13. RESPONSE
//     // ==================================================

//     return NextResponse.json({
//       success: true,

//       websiteId:
//         website.id,

//       analysis:
//         JSON.stringify(
//           parsedAnalysis,
//           null,
//           2
//         ),

//       websiteAnalysis:
//         JSON.stringify(
//           parsedAnalysis,
//           null,
//           2
//         ),

//       botConfig,

//       widgetCode,

//       websiteContent:
//         shortContent,

//       products,

//       cached: false,
//     });
//   } catch (error: any) {
//     console.error(
//       "========== ANALYZE ERROR =========="
//     );

//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,

//         error:
//           error?.message ||
//           "Website analysis failed.",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }