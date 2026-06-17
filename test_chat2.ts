import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const file2021 = fs.readFileSync(path.join(dataDir, "SloanTalentDirectory2021_final.json"), "utf-8");
    const file2023 = fs.readFileSync(path.join(dataDir, "SloanTalentDirectory2023_3.json"), "utf-8");
    const parsed2021 = JSON.parse(file2021);
    const parsed2023 = JSON.parse(file2023);
    const allProfiles = [...(parsed2021.profiles || []), ...(parsed2023.profiles || [])];
    const loadedAlumni = allProfiles.map((p: any, index: number) => ({ id: index.toString(), name: p.name }));

    const systemPrompt = `You are AlumniIQ... ${JSON.stringify(loadedAlumni)}`;

    const messages = [
      { role: "user", parts: [{ text: "hello" }] },
      { role: "model", "parts": [{ text: "Hello! How can I assist you today?" }] },
      { role: "user", parts: [{ text: "can you give me 5 alumni?" }] }
    ];
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: messages,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    console.log("Success");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
