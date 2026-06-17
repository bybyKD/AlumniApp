import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const messages = [
      { role: "user", parts: [{ text: "hello" }] },
      { role: "assistant", "parts": [{ text: "Hello! How can I assist you today?" }] },
      { role: "user", parts: [{ text: "can you give me 5 alumni?" }] }
    ];
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
    });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
