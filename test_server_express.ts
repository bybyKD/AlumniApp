import express from "express";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: messages,
      config: { systemInstruction: "test" }
    });
    for await (const chunk of responseStream) {
      if (chunk.text) res.write(`data: ${chunk.text}\n\n`);
    }
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      try {
        const lastUserMessage = req.body.messages[req.body.messages.length - 1].parts[0].text.toLowerCase();
        let fallbackResponse = "fallback";
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ text: fallbackResponse })}\\n\\n`);
        res.write("data: [DONE]\\n\\n");
        res.end();
      } catch (fallbackError) {
        console.error("FALLBACK ERROR:", fallbackError);
        res.status(500).json({ error: "Failed to generate content." });
      }
    } else {
      res.end();
    }
  }
});

const server = app.listen(3001, async () => {
  const response = await fetch("http://localhost:3001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "user", parts: [{ text: "hello" }] },
        { role: "assistant", parts: [{ text: "Hello!" }] },
        { role: "user", parts: [{ text: "give me 5 alumni" }] }
      ]
    })
  });
  console.log("Status:", response.status);
  console.log("Body:", await response.text());
  server.close();
});
