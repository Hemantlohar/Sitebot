export interface ParsedAnalysis {
  businessName: string;
  industry: string;
  businessType: string;
  recommendedBot: string;
  features: string[];
}

export function parseAnalysis(
  analysis: string
): ParsedAnalysis {
  const fallback: ParsedAnalysis = {
    businessName: "",
    industry: "Other",
    businessType: "General Business",
    recommendedBot: "Support Assistant",
    features: [],
  };

  try {
    if (
      !analysis ||
      typeof analysis !== "string"
    ) {
      console.error(
        "ANALYSIS PARSER: Empty analysis received"
      );

      return fallback;
    }

    console.log(
      "========== RAW ANALYSIS =========="
    );

    console.log(analysis);

    const cleaned = analysis
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");

    if (
      firstBrace === -1 ||
      lastBrace === -1 ||
      lastBrace <= firstBrace
    ) {
      console.error(
        "ANALYSIS PARSER: No JSON object found"
      );

      return fallback;
    }

    const jsonText = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );

    const parsed =
      JSON.parse(jsonText);

    const businessName =
      parsed.businessName ||
      parsed.business_name ||
      parsed["business name"] ||
      parsed.companyName ||
      parsed.company_name ||
      parsed.brandName ||
      parsed.brand_name ||
      "";

    const industry =
      parsed.industry ||
      parsed.Industry ||
      "Other";

    const businessType =
      parsed.businessType ||
      parsed.business_type ||
      parsed["business type"] ||
      parsed.BusinessType ||
      "General Business";

    const recommendedBot =
      parsed.recommendedBot ||
      parsed.recommended_bot ||
      parsed["recommended bot"] ||
      "Support Assistant";

    const features =
      Array.isArray(parsed.features)
        ? parsed.features.filter(
            (feature: unknown) =>
              typeof feature === "string"
          )
        : [];

    const result: ParsedAnalysis = {
      businessName:
        typeof businessName === "string"
          ? businessName.trim()
          : "",

      industry:
        typeof industry === "string"
          ? industry.trim()
          : "Other",

      businessType:
        typeof businessType === "string"
          ? businessType.trim()
          : "General Business",

      recommendedBot:
        typeof recommendedBot === "string"
          ? recommendedBot.trim()
          : "Support Assistant",

      features,
    };

    console.log(
      "========== PARSED ANALYSIS =========="
    );

    console.log(result);

    return result;
  } catch (error) {
    console.error(
      "ANALYSIS PARSER ERROR:",
      error
    );

    console.error(
      "FAILED ANALYSIS TEXT:",
      analysis
    );

    return fallback;
  }
}




















// export interface ParsedAnalysis {
//   industry: string;
//   businessType: string;
//   recommendedBot: string;
//   features: string[];
// }

// export function parseAnalysis(
//   analysis: string
// ): ParsedAnalysis {
//   const fallback: ParsedAnalysis = {
//     industry: "Other",
//     businessType: "General Business",
//     recommendedBot: "Support Assistant",
//     features: [],
//   };

//   try {
//     if (!analysis || typeof analysis !== "string") {
//       console.error(
//         "ANALYSIS PARSER: Empty analysis received"
//       );

//       return fallback;
//     }

//     console.log(
//       "========== RAW ANALYSIS =========="
//     );
//     console.log(analysis);

//     // Remove markdown code fences
//     const cleaned = analysis
//       .replace(/```json/gi, "")
//       .replace(/```/g, "")
//       .trim();

//     // Extract only the JSON object
//     const firstBrace = cleaned.indexOf("{");
//     const lastBrace = cleaned.lastIndexOf("}");

//     if (
//       firstBrace === -1 ||
//       lastBrace === -1 ||
//       lastBrace <= firstBrace
//     ) {
//       console.error(
//         "ANALYSIS PARSER: No JSON object found"
//       );

//       return fallback;
//     }

//     const jsonText = cleaned.slice(
//       firstBrace,
//       lastBrace + 1
//     );

//     const parsed = JSON.parse(jsonText);

//     const result: ParsedAnalysis = {
//       industry:
//         parsed.industry ||
//         parsed.Industry ||
//         "Other",

//       businessType:
//         parsed.businessType ||
//         parsed.business_type ||
//         parsed["business type"] ||
//         parsed.BusinessType ||
//         "General Business",

//       recommendedBot:
//         parsed.recommendedBot ||
//         parsed.recommended_bot ||
//         parsed["recommended bot"] ||
//         "Support Assistant",

//       features: Array.isArray(parsed.features)
//         ? parsed.features
//         : [],
//     };

//     console.log(
//       "========== PARSED ANALYSIS =========="
//     );
//     console.log(result);

//     return result;
//   } catch (error) {
//     console.error(
//       "ANALYSIS PARSER ERROR:",
//       error
//     );

//     console.error(
//       "FAILED ANALYSIS TEXT:",
//       analysis
//     );

//     return fallback;
//   }
// }