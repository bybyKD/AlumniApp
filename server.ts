import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import Groq from "groq-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Upload PDFs on startup
  let pdfUris: string[] = [];
  try {
    const dataDir = path.join(process.cwd(), "data");
    console.log("Uploading PDFs to Gemini File API...");
    const pdf1 = await ai.files.upload({ file: path.join(dataDir, "SloanTalentDirectory2021_final.pdf"), mimeType: "application/pdf" });
    const pdf2 = await ai.files.upload({ file: path.join(dataDir, "SloanTalentDirectory2023_3.pdf"), mimeType: "application/pdf" });
    pdfUris = [pdf1.uri, pdf2.uri];
    console.log("PDFs uploaded successfully.");
  } catch (err) {
    console.error("Failed to upload PDFs:", err);
  }

  // Load offline extracted JSON as fallback
  let loadedAlumni: any[] = [];
  try {
    const dataDir = path.join(process.cwd(), "data");
    const file2021 = fs.readFileSync(path.join(dataDir, "offline_alumni_2021.json"), "utf-8");
    const file2023 = fs.readFileSync(path.join(dataDir, "offline_alumni_2023.json"), "utf-8");
    const parsed2021 = JSON.parse(file2021);
    const parsed2023 = JSON.parse(file2023);
    const allProfiles = [...(parsed2021.profiles || []), ...(parsed2023.profiles || [])];
    
    loadedAlumni = allProfiles.map((p: any, index: number) => {
      return {
        id: (index + 1).toString(),
        name: p.name || "Unknown",
        position: p.position || "",
        company: p.company || "",
        country: p.location || "Unknown",
        industry: p.industry || "Various",
        education: p.education || "",
        skills: p.skills || [],
        languages: p.languages || [],
        countries: p.countries || [],
        passports: p.passports || [],
        career_highlights: p.career_highlights || [],
        bio: p.bio || "",
        email: p.email || "",
        linkedin: p.linkedin || ""
      };
    });
  } catch (err) {
    console.error("Error loading offline JSON:", err);
  }

  // --- Real Local Auth using JSON file ---
  const usersFile = path.join(process.cwd(), "data", "users.json");
  
  // Ensure the file exists
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
  }

  // Helper to hash passwords securely
  const hashPassword = (password: string) => {
    return crypto.createHash("sha256").update(password).digest("hex");
  };

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      const user = users.find((u: any) => u.email === email);

      if (user && user.passwordHash === hashPassword(password)) {
        res.json({
          token: `local-jwt-${user.id}-${Date.now()}`,
          user: { id: user.id, name: user.name, email: user.email }
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
      
      if (users.find((u: any) => u.email === email)) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

      res.json({
        token: `local-jwt-${newUser.id}-${Date.now()}`,
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/assistant/chat", async (req, res) => {
    const { messages, mode } = req.body; // mode is "pdf" or "json"

    try {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let systemPrompt = `You are AlumniIQ, an AI-powered Career Intelligence assistant.
Be professional, concise, and format all responses with clean, well-structured markdown.

FORMATTING RULES:
- Use ## and ### headings to organize sections
- Use bullet points for lists of details
- Use **bold** for names, companies, and key terms
- Keep paragraphs short (2-3 sentences max)

TABLE FORMAT (CRITICAL - each row MUST be on its own line):
When listing alumni, use this EXACT format with each row on a NEW LINE:

| Name | Company | Role | Profile |
| --- | --- | --- | --- |
| John Doe | Google | PM | [View Profile](/alumni?id=1) |
| Jane Smith | Amazon | SWE | [View Profile](/alumni?id=2) |

MATCHMAKING: When asked to find co-founders, mentors, or matches, analyze career_highlights, bio, languages, and countries. For each match, use a ### heading with their name, then bullet points explaining WHY.`;

      const config: any = { systemInstruction: systemPrompt };

      if (mode === "pdf") {
        // PDF Mode: Inject PDF URIs into the context
        const lastMsg = messages[messages.length - 1];
        const parts = [];
        for (const uri of pdfUris) {
          parts.push({ fileData: { fileUri: uri, mimeType: "application/pdf" } });
        }
        parts.push({ text: "Please use the provided PDF directories to answer my query:\n\n" + lastMsg.parts[0].text });
        lastMsg.parts = parts;

      } else {
        // JSON Mode: Prompt stuffing for now (Function calling requires too many tokens for free tier)
        config.systemInstruction += `\n\nALUMNI DATASET:\n${JSON.stringify(loadedAlumni, null, 2)}`;
      }

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: messages,
        config
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("AI Error:", error);
      if (!res.headersSent) {
        try {
          const lastUserMessage = messages[messages.length - 1].parts[messages[messages.length-1].parts.length - 1].text.toLowerCase();
          let filtered = loadedAlumni;
          
          if (lastUserMessage.includes("2021")) filtered = filtered.filter(a => a.education.includes("2021"));
          else if (lastUserMessage.includes("2023")) filtered = filtered.filter(a => a.education.includes("2023"));
          else if (lastUserMessage.includes("google")) filtered = filtered.filter(a => a.company.toLowerCase().includes("google"));
          else if (lastUserMessage.includes("amazon")) filtered = filtered.filter(a => a.company.toLowerCase().includes("amazon"));
          else filtered = []; 

          let fallbackResponse = "*(Offline Mode: AI server is busy or rate-limited. Displaying keyword search results)*\n\n";
          
          if (filtered.length > 0) {
            filtered = filtered.slice(0, 5);
            fallbackResponse += "| Name | Company | Role | Profile |\n|---|---|---|---|\n";
            filtered.forEach(a => {
              fallbackResponse += `| ${a.name} | ${a.company || '-'} | ${a.position || '-'} | [View Profile](/alumni?id=${a.id}) |\n`;
            });
          } else {
            fallbackResponse += "Could not find an exact match in offline mode. Wait 60 seconds for API limits to reset.";
          }

          res.write(`data: ${JSON.stringify({ text: fallbackResponse })}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (e) {
          res.status(500).json({ error: "Failed to generate content." });
        }
      } else {
        res.end();
      }
    }
  });

  // ── Groq Chat Endpoint ────────────────────────────────────────────────────
  app.post("/api/assistant/chat/groq", async (req, res) => {
    const { messages, groqModel } = req.body;

    // Smart pre-filter: extract keywords from the last user message
    // and only send the most relevant alumni to stay within token limits
    const lastUserMsg = messages[messages.length - 1]?.parts[0]?.text?.toLowerCase() || "";
    let relevantAlumni = [];

    // Simple keyword extraction based on skills/industry we know about
    const keywords = ["react", "node", "python", "java", "manager", "designer", "engineer", "finance", "marketing", "consulting", "it", "strategy"];
    const foundKeywords = keywords.filter(k => lastUserMsg.includes(k));

    if (foundKeywords.length > 0) {
      // Score alumni by how many keywords match their profile
      const scored = loadedAlumni.map((a: any) => {
        let score = 0;
        const profileText = [
          a.industry, a.position, ...(a.skills || []),
          ...(a.career_highlights || []), a.bio || ""
        ].join(" ").toLowerCase();

        for (const k of foundKeywords) {
          if (profileText.includes(k)) score++;
        }
        return { ...a, _score: score };
      });

      // Sort by score descending
      const sorted = scored.sort((a: any, b: any) => b._score - a._score);
      relevantAlumni = sorted.slice(0, 10).map(({ _score, ...rest }: any) => rest);
    } else {
      // No keywords — just send first 10
      relevantAlumni = loadedAlumni.slice(0, 10);
    }

    // Slim down each profile to essential fields only to stay within token limits
    const slimAlumni = relevantAlumni.map((a: any) => ({
      id: a.id, name: a.name, position: a.position, company: a.company,
      country: a.country, industry: a.industry, skills: (a.skills || []).slice(0, 5),
      languages: a.languages, countries: a.countries,
      bio: (a.bio || "").slice(0, 200),
      career_highlights: (a.career_highlights || []).slice(0, 3).map((h: string) => h.slice(0, 100))
    }));

    const systemPrompt = `You are AlumniIQ, an AI-powered Career Intelligence assistant.
Be professional, concise, and format all responses with clean, well-structured markdown.

FORMATTING RULES:
- Use ## and ### headings to organize sections
- Use bullet points for lists of details
- Use **bold** for names, companies, and key terms
- Keep paragraphs short (2-3 sentences max)

TABLE FORMAT (CRITICAL - each row MUST be on its own line):
When listing alumni, use this EXACT format with each row on a NEW LINE:

| Name | Company | Role | Profile |
| --- | --- | --- | --- |
| John Doe | Google | PM | [View Profile](/alumni?id=1) |
| Jane Smith | Amazon | SWE | [View Profile](/alumni?id=2) |

MATCHMAKING: When asked to find matches, mentors, or co-founders, analyze career_highlights, bio, languages, and countries. For each match, use a ### heading with their name, then bullet points explaining WHY.

You have ${slimAlumni.length} relevant alumni for this query.

ALUMNI DATA:
${JSON.stringify(slimAlumni)}`;

    try {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Convert from Gemini message format to OpenAI format
      const openAiMessages = messages.map((m: any) => ({
        role: m.role === "model" ? "assistant" : "user",
        content: m.parts[0].text
      }));

      const stream = await groq.chat.completions.create({
        model: groqModel || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...openAiMessages
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Groq Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Groq request failed" });
      } else {
        res.write(`data: ${JSON.stringify({ text: "\n\n*Error: Groq request failed. Please try again.*" })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
  });

  app.get("/api/alumni", (req, res) => res.json(loadedAlumni));
  app.get("/api/analytics", (req, res) => {
    const data = loadedAlumni;
    
    const countFreq = (arr: string[]) => {
      const counts: Record<string, number> = {};
      arr.forEach(item => {
        if (item && item.length > 2 && item !== "Various") {
          counts[item] = (counts[item] || 0) + 1;
        }
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }));
    };

    const allSkills = data.flatMap(p => p.skills || []);
    const allIndustries = data.flatMap(p => (p.industry || "").split("|").map((i: string) => i.trim()));
    const allCompanies = data.map(p => p.company).filter(Boolean);
    const allLanguages = data.flatMap(p => p.languages || []);
    const allCountries = data.flatMap(p => p.countries || []);

    const analytics = {
      topSkills: countFreq(allSkills),
      topIndustries: countFreq(allIndustries).slice(0, 5),
      topCompanies: countFreq(allCompanies).slice(0, 6),
      topLanguages: countFreq(allLanguages),
      topCountries: countFreq(allCountries),
      careerGrowth: [
        { year: "2019", count: 120 },
        { year: "2020", count: 150 },
        { year: "2021", count: 200 },
        { year: "2022", count: 280 },
        { year: "2023", count: 350 },
      ]
    };
    
    res.json(analytics);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
