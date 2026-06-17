import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const messages: any = [
    { role: "user", parts: [{ text: "hello" }] },
    { role: "assistant", parts: [{ text: "Hello!" }] },
    { role: "user", parts: [{ text: "give me 5 alumni" }] }
  ];

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: messages,
      config: { systemInstruction: "..." }
    });
    for await (const chunk of responseStream) {}
  } catch (error) {
    try {
      const dataDir = path.join(process.cwd(), "data");
      const file2021 = fs.readFileSync(path.join(dataDir, "SloanTalentDirectory2021_final.json"), "utf-8");
      const parsed2021 = JSON.parse(file2021);
      const loadedAlumni = parsed2021.profiles.map((p: any, index: number) => ({
        id: "1", name: "A", position: "B", company: "C", education: "D", skills: []
      }));

      const lastUserMessage = messages[messages.length - 1].parts[0].text.toLowerCase();
      let filtered = loadedAlumni;
      // ... same filter logic
      let fallbackResponse = "fallback";
      console.log("Fallback succeeded");
    } catch (fallbackError) {
      console.error("FALLBACK ERROR IS:", fallbackError);
    }
  }
}
test();
