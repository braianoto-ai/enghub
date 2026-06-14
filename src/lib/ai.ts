import { GoogleGenerativeAI } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

export function getAI(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }
  return client;
}

export const AI_MODEL = "gemini-2.0-flash";
