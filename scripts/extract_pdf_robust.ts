import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    profiles: {
      type: Type.ARRAY,
      description: "List of all alumni profiles extracted from the PDF",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          position: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          industry: { type: Type.STRING },
          education: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          bio: { type: Type.STRING, description: "Full bio or professional summary" },
          email: { type: Type.STRING },
          linkedin: { type: Type.STRING }
        },
        required: ["name", "position", "company", "skills", "bio"]
      }
    }
  },
  required: ["profiles"]
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function extractWithRetry(uploadResult: any, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Generating content (Attempt ${i + 1}/${retries})...`);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { fileData: { fileUri: uploadResult.uri, mimeType: "application/pdf" } },
              { text: "Extract ALL alumni profiles from this talent directory PDF. Make sure to capture every single one and do not skip any profiles. Leave missing fields empty." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1
        }
      });
      return response;
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes("429")) {
        console.warn(`Rate limited. Waiting 60 seconds before retrying...`);
        await delay(60000);
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries reached.");
}

async function extractPdf(pdfName: string, outName: string) {
  const filePath = path.join(process.cwd(), "data", pdfName);
  const outPath = path.join(process.cwd(), "data", outName);

  console.log(`Uploading ${pdfName} to Gemini...`);
  const uploadResult = await ai.files.upload({ file: filePath, mimeType: "application/pdf" });
  console.log(`Uploaded! URI: ${uploadResult.uri}`);

  await delay(10000); // Give backend time to process the file

  try {
    const response = await extractWithRetry(uploadResult);
    if (response.text) {
      fs.writeFileSync(outPath, response.text, "utf-8");
      const parsed = JSON.parse(response.text);
      console.log(`Success! Extracted ${parsed.profiles?.length || 0} profiles to ${outName}`);
    } else {
      console.log(`No text returned for ${pdfName}`);
    }
  } catch (err: any) {
    console.error(`Error extracting ${pdfName}:`, err.message || err);
  } finally {
    try {
      await ai.files.delete({ name: uploadResult.name });
      console.log(`Deleted remote file ${uploadResult.name}`);
    } catch (e) {
      console.error("Failed to delete file");
    }
  }
}

async function main() {
  console.log("Starting PDF to JSON Extraction...");
  await extractPdf("SloanTalentDirectory2021_final.pdf", "perfect_alumni_2021.json");
  console.log("Waiting 30 seconds before next PDF to respect rate limits...");
  await delay(30000);
  await extractPdf("SloanTalentDirectory2023_3.pdf", "perfect_alumni_2023.json");
  console.log("Extraction completely finished!");
}

main();
