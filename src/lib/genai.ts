import { GoogleGenAI, Type } from "@google/genai";
import { buildSys } from "./prompts";
import type { DealItem } from "../types";

export async function scanMarket(budget: number, budgetDir: string): Promise<DealItem[]> {
  const textPrompt = `Search Dubizzle UAE only. Find the 9 best items to flip where buy price is ${
    budgetDir === "under" ? "strictly under" : "above"
  } ${budget} AED. Sharjah and Dubai market. Sort by ROI% descending. Dubizzle listings only. For each item, search for an actual Dubizzle listing URL. Include sell_difficulty and listing_url fields.
  
  CRITICAL INSTRUCTION: You MUST return a pure JSON array containing the results. Do not include any conversational text. Use this exact schema for each object in the array:
  {
    "item": "string",
    "category": "string",
    "buy_price": number,
    "sell_price": number,
    "margin_aed": number,
    "roi_pct": number,
    "deal_rating": "string",
    "risk": "string",
    "demand": "string",
    "days_to_sell": number,
    "sell_difficulty": "string",
    "source": "string",
    "sell_tip": "string",
    "platforms": "string",
    "listing_url": "string (optional)"
  }`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: textPrompt,
    config: {
      systemInstruction: buildSys(budget, budgetDir),
      tools: [{ googleSearch: {} }],
    }
  });

  if (!response.text) {
    throw new Error("Empty response from AI");
  }

  // Extract JSON block if surrounded by markdown
  const text = response.text.replace(/```(?:json)?/gi, '').trim();
  
  return JSON.parse(text) as DealItem[];
}
