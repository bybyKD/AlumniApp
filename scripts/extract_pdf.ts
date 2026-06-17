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
      description: "List of alumni profiles extracted from the document",
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

async function extractPdf(pdfName: string, outName: string) {
  const filePath = path.join(process.cwd(), "data", pdfName);
  const outPath = path.join(process.cwd(), "data", outName);

  console.log(`Uploading ${pdfName} to Gemini...`);
  const uploadResult = await ai.files.upload({
    file: filePath,
    mimeType: "application/pdf"
  });

  console.log(`Uploaded! URI: ${uploadResult.uri}`);
  console.log(`Waiting a few seconds for the file to be processed...`);
  await new Promise(r => setTimeout(r, 5000)); // wait for processing

  console.log(`Extracting data from ${pdfName}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { fileData: { fileUri: uploadResult.uri, mimeType: "application/pdf" } },
            { text: "Extract all alumni profiles from this directory document. Ensure you capture every single alumni profile present in the document. Be very thorough. For missing fields, leave as empty string or empty array." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1
      }
    });

    if (response.text) {
      fs.writeFileSync(outPath, response.text, "utf-8");
      const parsed = JSON.parse(response.text);
      console.log(`Successfully extracted ${parsed.profiles?.length || 0} profiles to ${outName}`);
    } else {
      console.log(`No text returned for ${pdfName}`);
    }
  } catch (err: any) {
    console.error(`Error extracting ${pdfName}:`, err.message || err);
  } finally {
    // Cleanup the uploaded file to save user's cloud quota
    try {
      await ai.files.delete({ name: uploadResult.name });
      console.log(`Deleted remote file ${uploadResult.name}`);
    } catch (e) {
      console.error("Failed to delete file:", e);
    }
  }
}

async function main() {
  await extractPdf("SloanTalentDirectory2021_final.pdf", "perfect_alumni_2021.json");
  await extractPdf("SloanTalentDirectory2023_3.pdf", "perfect_alumni_2023.json");
  console.log("Extraction complete!");
}

main();
