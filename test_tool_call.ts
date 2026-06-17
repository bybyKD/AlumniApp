import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: "Find me alumni at Google.",
    config: {
      tools: [{
        functionDeclarations: [{
          name: "search_alumni",
          description: "Search alumni directory",
          parameters: {
            type: Type.OBJECT,
            properties: { company: { type: Type.STRING } }
          }
        }]
      }]
    }
  });

  for await (const chunk of stream) {
    if (chunk.functionCalls) {
      console.log("Got function calls:", JSON.stringify(chunk.functionCalls, null, 2));
    }
    if (chunk.text) console.log("Text:", chunk.text);
  }
}
test();
