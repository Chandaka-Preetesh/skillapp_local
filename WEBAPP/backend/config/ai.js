import dotenv from "dotenv";
dotenv.config(); 
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fastest Gemini models
const GEMINI_PREFERRED_MODEL = "gemini-1.5-flash";
const GEMINI_FALLBACK_MODEL = "gemini-pro";

// Generate short Gemini reply (max ~6 lines)
export async function generateGeminiReply(promptText) {
  const prompt = `Answer this student question clearly in under 6 short lines:\n"${promptText}"`;

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_PREFERRED_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.warn("Gemini preferred model failed, skipping fallback:", err.message);
    return "Sorry, Gemini AI is currently unavailable.";
  }
}

// 2. OpenAI Setup

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Fastest OpenAI models
const OPENAI_PREFERRED_MODEL = "gpt-4o";        // free & fast
const OPENAI_FALLBACK_MODEL = "gpt-3.5-turbo";  // fallback

// Generate short OpenAI reply (max ~6 lines)
export async function generateOpenAIReply(promptText) {
  const prompt = `Answer this student question in under 6 short lines. Be brief, clear, and helpful:\n"${promptText}"`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_PREFERRED_MODEL,
      messages: [
        { role: "system", content: "You are a helpful teaching assistant. Keep answers short (under 6 lines)." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 60  // restrict length
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.warn("OpenAI preferred model failed, trying fallback:", err.message);

    try {
      const fallbackResponse = await openai.chat.completions.create({
        model: OPENAI_FALLBACK_MODEL,
        messages: [
          { role: "system", content: "You are a helpful teaching assistant. Keep answers short (under 6 lines)." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 60
      });

      return fallbackResponse.choices[0].message.content.trim();
    } catch (fallbackErr) {
      console.error("OpenAI fallback model also failed:", fallbackErr.message);
      return "Sorry, OpenAI is currently unavailable.";
    }
  }
}
