interface WebsiteAnalysis {
  businessName?: string;
  industry?: string;
  businessType?: string;
  recommendedBot?: string;
  features?: string[];
}

export function generateBotConfig(
  websiteAnalysis: string
) {
  let parsed: WebsiteAnalysis = {};

  try {
    parsed = JSON.parse(
      websiteAnalysis
    );
  } catch (error) {
    console.error(
      "BOT CONFIG PARSE ERROR:",
      error
    );
  }

  const businessName =
    parsed.businessName?.trim() || "";

  const industry =
    parsed.industry?.trim() || "Other";

  const businessType =
    parsed.businessType?.trim() ||
    "General Business";

  const recommendedBot =
    parsed.recommendedBot?.trim() ||
    "Support Assistant";

  let assistantType =
    recommendedBot;

  let questions: string[] = [
    "What services do you offer?",
    "How can you help me?",
    "How can I contact you?",
  ];

  // ==========================================
  // TECHNOLOGY
  // ==========================================

  if (industry === "Technology") {
    assistantType =
      recommendedBot;

    questions = [
      "What products or services do you offer?",
      "What are your main features?",
      "How can I get started?",
    ];
  }

  // ==========================================
  // HEALTHCARE
  // ==========================================

  else if (industry === "Healthcare") {
    assistantType =
      recommendedBot ===
      "Booking Assistant"
        ? "Booking Assistant"
        : "Healthcare Assistant";

    questions = [
      "What healthcare services are available?",
      "How can I book an appointment?",
      "What are your working hours?",
    ];
  }

  // ==========================================
  // EDUCATION
  // ==========================================

  else if (industry === "Education") {
    assistantType =
      recommendedBot ===
      "Lead Generation Assistant"
        ? "Admissions Assistant"
        : "Education Assistant";

    questions = [
      "What courses do you offer?",
      "How can I apply?",
      "What are the admission requirements?",
    ];
  }

  // ==========================================
  // FINANCE
  // ==========================================

  else if (industry === "Finance") {
    assistantType =
      "Finance Assistant";

    questions = [
      "What financial services do you offer?",
      "How can I get started?",
      "How can I contact support?",
    ];
  }

  // ==========================================
  // RESTAURANT
  // ==========================================

  else if (industry === "Restaurant") {
    assistantType =
      recommendedBot ===
      "Booking Assistant"
        ? "Booking Assistant"
        : "Restaurant Assistant";

    questions = [
      "What is on the menu?",
      "How can I book a table?",
      "What are your opening hours?",
    ];
  }

  // ==========================================
  // ECOMMERCE
  // ==========================================

  else if (industry === "Ecommerce") {
    assistantType =
      "Shopping Assistant";

    questions = [
      "Tell me about your products",
      "What are your popular products?",
      "How can I contact support?",
    ];
  }

  // ==========================================
  // TRAVEL
  // ==========================================

  else if (industry === "Travel") {
    assistantType =
      recommendedBot ===
      "Booking Assistant"
        ? "Booking Assistant"
        : "Travel Assistant";

    questions = [
      "What destinations do you offer?",
      "How can I make a booking?",
      "What travel services are available?",
    ];
  }

  // ==========================================
  // REAL ESTATE
  // ==========================================

  else if (industry === "RealEstate") {
    assistantType =
      "Property Assistant";

    questions = [
      "What properties are available?",
      "How can I schedule a viewing?",
      "How can I contact an agent?",
    ];
  }

  // ==========================================
  // FALLBACK
  // ==========================================

  else {
    assistantType =
      recommendedBot;

    questions = [
      "What services do you offer?",
      "How can you help me?",
      "How can I contact you?",
    ];
  }

  // ==========================================
  // FINAL BOT NAME
  // ==========================================

  const botName = businessName
    ? `${businessName} ${assistantType}`
    : assistantType;

  const welcomeMessage = businessName
    ? `Hi! I'm the ${botName}. How can I help you today?`
    : `Hi! I'm your ${botName}. How can I help you today?`;

  return {
    botName,

    welcomeMessage,

    theme: "dark",

    suggestedQuestions:
      questions,

    businessName,

    industry,

    businessType,

    recommendedBot,

    features:
      parsed.features || [],
  };
}
























// interface WebsiteAnalysis {
//   industry?: string;
//   businessType?: string;
//   recommendedBot?: string;
//   features?: string[];
// }

// export function generateBotConfig(
//   websiteAnalysis: string
// ) {
//   let parsed: WebsiteAnalysis = {};

//   try {
//     parsed = JSON.parse(websiteAnalysis);
//   } catch (error) {
//     console.error(
//       "BOT CONFIG PARSE ERROR:",
//       error
//     );
//   }

//   const industry =
//     parsed.industry?.trim() || "General";

//   const businessType =
//     parsed.businessType?.trim() ||
//     "Business";

//   const recommendedBot =
//     parsed.recommendedBot?.trim() ||
//     "Support Assistant";

//   let botName = recommendedBot;

//   let questions: string[] = [
//     "What services do you offer?",
//     "How can you help me?",
//     "How can I contact you?",
//   ];

//   // ==========================================
//   // TECHNOLOGY
//   // ==========================================

//   if (industry === "Technology") {
//     botName = recommendedBot;

//     questions = [
//       "What products or services do you offer?",
//       "What are your main features?",
//       "How can I get started?",
//     ];
//   }

//   // ==========================================
//   // HEALTHCARE
//   // ==========================================

//   else if (industry === "Healthcare") {
//     botName =
//       recommendedBot === "Booking Assistant"
//         ? "Healthcare Booking Assistant"
//         : "Healthcare Assistant";

//     questions = [
//       "What healthcare services are available?",
//       "How can I book an appointment?",
//       "What are your working hours?",
//     ];
//   }

//   // ==========================================
//   // EDUCATION
//   // ==========================================

//   else if (industry === "Education") {
//     botName = "Education Assistant";

//     questions = [
//       "What courses do you offer?",
//       "How can I apply?",
//       "What are the admission requirements?",
//     ];
//   }

//   // ==========================================
//   // FINANCE
//   // ==========================================

//   else if (industry === "Finance") {
//     botName = "Finance Assistant";

//     questions = [
//       "What services do you offer?",
//       "How can I get started?",
//       "How can I contact support?",
//     ];
//   }

//   // ==========================================
//   // RESTAURANT
//   // ==========================================

//   else if (industry === "Restaurant") {
//     botName = "Restaurant Assistant";

//     questions = [
//       "What is on the menu?",
//       "How can I book a table?",
//       "What are your opening hours?",
//     ];
//   }

//   // ==========================================
//   // ECOMMERCE
//   // ==========================================

//   else if (industry === "Ecommerce") {
//     botName = "Shopping Assistant";

//     questions = [
//       "Tell me about your products",
//       "What are your popular products?",
//       "How can I contact support?",
//     ];
//   }

//   // ==========================================
//   // TRAVEL
//   // ==========================================

//   else if (industry === "Travel") {
//     botName = "Travel Assistant";

//     questions = [
//       "What destinations do you offer?",
//       "How can I make a booking?",
//       "What travel services are available?",
//     ];
//   }

//   // ==========================================
//   // REAL ESTATE
//   // ==========================================

//   else if (industry === "RealEstate") {
//     botName = "Property Assistant";

//     questions = [
//       "What properties are available?",
//       "How can I schedule a viewing?",
//       "How can I contact an agent?",
//     ];
//   }

//   // ==========================================
//   // FALLBACK
//   // ==========================================

//   else {
//     botName = recommendedBot;

//     questions = [
//       "What services do you offer?",
//       "How can you help me?",
//       "How can I contact you?",
//     ];
//   }

//   return {
//     botName,

//     welcomeMessage:
//       `Hi! I'm your ${botName}. How can I help you today?`,

//     theme: "dark",

//     suggestedQuestions: questions,

//     industry,

//     businessType,
//   };
// }