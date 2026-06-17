import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const messages = [
      { role: "user", parts: [{ text: "hi" }] },
      { role: "assistant", parts: [{ text: "hello" }] },
      { role: "user", parts: [{ text: "how are you" }] }
    ];
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages
    });
    console.log("Success with assistant");
  } catch (e) {
    console.error("Error with assistant:", e.message);
  }
}
test();
