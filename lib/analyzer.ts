import "server-only";

import {
  generateChatResponse,
} from "./ai/chat";
export async function analyzeBusiness(
  content: string
) {
  const prompt = `
You are analyzing a website to identify its business information.

Return exactly one valid JSON object.

Do not use markdown.
Do not use code fences.
Do not write explanations before or after the JSON.

Use exactly these property names:

businessName
industry
businessType
recommendedBot
features

BUSINESS NAME RULES:

- Identify the actual company, brand, organization, restaurant, hospital, school, store, portfolio owner, or website name.
- Use the real name visible in the website content.
- Do NOT invent a business name.
- Do NOT use generic names such as "Website", "Company", "Business", or "NA".
- If the website is a personal portfolio, use the person's or portfolio brand name visible in the content.
- If no reliable name can be identified, return an empty string.

Allowed industry values:

Technology
Healthcare
Education
Finance
Restaurant
Ecommerce
Travel
RealEstate
Other

Business Type examples:

Technology:
Consumer Electronics
SaaS
Software Company
IT Services
Developer Portfolio
Digital Agency

Healthcare:
Hospital
Clinic
Telemedicine Platform

Education:
School
University
Online Learning Platform

Finance:
Bank
FinTech Platform
Financial Services

Restaurant:
Restaurant
Food Delivery Service
Cafe

Ecommerce:
Online Store
Marketplace
Retail Store
Beauty Store
Fashion Store

Travel:
Travel Agency
Hotel Booking Platform
Tourism Platform

RealEstate:
Real Estate Agency
Property Marketplace

Recommended Bot must be exactly one of:

Sales Assistant
Support Assistant
Booking Assistant
Lead Generation Assistant

Choose the recommended bot based on the website's purpose:

- Sales Assistant: product stores, ecommerce, SaaS sales, product companies
- Support Assistant: documentation, customer support, informational websites
- Booking Assistant: hospitals, clinics, restaurants, hotels, travel booking
- Lead Generation Assistant: portfolios, agencies, real estate, service businesses

The features field must always be an array of strings.

Required JSON structure:

{
  "businessName": "Example Company",
  "industry": "Technology",
  "businessType": "Software Company",
  "recommendedBot": "Sales Assistant",
  "features": [
    "Product Information",
    "Customer Support"
  ]
}

Analyze the following website content:

${content}
`;

 const result =
  await generateChatResponse({
    prompt,
    temperature: 0.1,
    jsonMode: true,
  });

  if (!result) {
    throw new Error(
      "AI analysis returned an empty response."
    );
  }

  console.log(
    "========== ANALYZER RESPONSE =========="
  );

  console.log(result);

  return result;
}






















// import ollama from "ollama";

// export async function analyzeBusiness(
//   content: string
// ) {
//   const prompt = `
// You are analyzing a website to identify its business information.

// Return exactly one valid JSON object.

// Do not use markdown.
// Do not use code fences.
// Do not write explanations before or after the JSON.

// Use exactly these property names:

// industry
// businessType
// recommendedBot
// features

// Allowed industry values:

// Technology
// Healthcare
// Education
// Finance
// Restaurant
// Ecommerce
// Travel
// RealEstate
// Other

// Business Type examples:

// Technology:
// Consumer Electronics
// SaaS
// Software Company
// IT Services

// Healthcare:
// Hospital
// Clinic
// Telemedicine Platform

// Education:
// School
// University
// Online Learning Platform

// Finance:
// Bank
// FinTech Platform
// Financial Services

// Restaurant:
// Restaurant
// Food Delivery Service
// Cafe

// Ecommerce:
// Online Store
// Marketplace
// Retail Store

// Travel:
// Travel Agency
// Hotel Booking Platform
// Tourism Platform

// RealEstate:
// Real Estate Agency
// Property Marketplace

// Recommended Bot must be exactly one of:

// Sales Assistant
// Support Assistant
// Booking Assistant
// Lead Generation Assistant

// The features field must always be an array of strings.

// Required JSON structure:

// {
//   "industry": "Technology",
//   "businessType": "Consumer Electronics",
//   "recommendedBot": "Sales Assistant",
//   "features": [
//     "Product Information",
//     "Customer Support"
//   ]
// }

// Analyze the following website content:

// ${content}
// `;

//   const response = await ollama.chat({
//     model: "qwen2.5:1.5b",

//     format: "json",

//     options: {
//       temperature: 0.1,
//     },

//     messages: [
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//   });

//   const result =
//     response.message?.content?.trim();

//   if (!result) {
//     throw new Error(
//       "AI analysis returned an empty response."
//     );
//   }

//   console.log(
//     "========== ANALYZER RESPONSE =========="
//   );

//   console.log(result);

//   return result;
// }