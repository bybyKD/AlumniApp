import fs from "fs";
import PDFParser from "pdf2json";
import path from "path";

const parsePdf = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));
    pdfParser.loadPDF(filePath);
  });
};

const safeDecode = (str: string) => {
  try { return decodeURIComponent(str); } catch (e) { return str; }
};

const extractProfiles = async (pdfName: string, outName: string) => {
  console.log(`Processing ${pdfName} offline...`);
  const filePath = path.join(process.cwd(), "data", pdfName);
  const outPath = path.join(process.cwd(), "data", outName);

  const pdfData = await parsePdf(filePath);
  const profiles = [];

  let startIndex = 3;
  for (let i = startIndex; i < pdfData.Pages.length; i++) {
    const page = pdfData.Pages[i];
    
    const texts = page.Texts.map((t: any) => ({
      text: safeDecode(t.R[0].T).trim(),
      x: t.x,
      y: t.y
    })).filter((t: any) => t.text !== "");

    const lines: any[] = [];
    for (const t of texts) {
      const line = lines.find(l => Math.abs(l.y - t.y) < 0.5);
      if (line) {
        line.items.push(t);
        line.items.sort((a: any, b: any) => a.x - b.x);
      } else {
        lines.push({ y: t.y, items: [t] });
      }
    }
    lines.sort((a, b) => a.y - b.y);

    let name = "";
    let position = "";
    let company = "";
    let bio = "";
    let career_highlights: string[] = [];
    let education = [];
    let skills = [];
    let industry = [];
    let location = "";
    let email = "";
    let linkedin = "";
    let languages: string[] = [];
    let countries: string[] = [];
    let passports: string[] = [];

    let rightColumnState = "";
    let leftColumnState = "";

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const items = line.items;
      
      if (j === 0 && items.length === 1) { name = items[0].text; continue; }
      if (j === 1 && items.length === 1) {
        const fullPos = items[0].text;
        if (fullPos.includes(",")) {
          const parts = fullPos.split(",");
          position = parts[0].trim();
          company = parts.slice(1).join(",").trim();
        } else {
          position = fullPos;
        }
        continue;
      }

      for (const item of items) {
        const text = item.text;
        const isLeft = item.x < 10;

        if (text === "Contact") { leftColumnState = "Contact"; continue; }
        if (text === "Languages") { leftColumnState = "Languages"; continue; }
        if (text === "Countries lived/worked in") { leftColumnState = "Countries"; continue; }
        if (text === "Passports/Work Permits") { leftColumnState = "Passports"; continue; }
        if (text === "Education") { leftColumnState = "Education"; continue; }
        if (text === "Previous industry experience") { leftColumnState = "Industry"; continue; }
        if (text === "Skills") { leftColumnState = "Skills"; continue; }
        if (text === "Industries / functions keen") { leftColumnState = "Future"; continue; }
        if (text === "to explore") { continue; }

        if (text === "Bio") { rightColumnState = "Bio"; continue; }
        if (text === "Career highlights") { rightColumnState = "Highlights"; continue; }
        if (text === "Functional expertise") { rightColumnState = "Expertise"; continue; }

        if (isLeft) {
          if (leftColumnState === "Contact") {
            if (text.includes("@")) email += text;
            else if (text.includes("linkedin") || text.includes("-")) linkedin += text;
            else if (text.length > 3 && !text.includes("United Kingdom") && !text.includes("Sloan")) location = text;
            else if (text === "United Kingdom") location = "United Kingdom";
          }
          else if (leftColumnState === "Languages") {
            if (text !== "|") languages.push(...text.split("|").map((s: string) => s.trim()).filter(Boolean));
          }
          else if (leftColumnState === "Countries") {
            if (text !== "|") countries.push(...text.split("|").map((s: string) => s.trim()).filter(Boolean));
          }
          else if (leftColumnState === "Passports") passports.push(text);
          else if (leftColumnState === "Education") education.push(text);
          else if (leftColumnState === "Industry") industry.push(text);
          else if (leftColumnState === "Skills") {
            if (text !== "|") skills.push(...text.split("|").map((s: string) => s.trim()).filter(Boolean));
          }
        } else {
          if (rightColumnState === "Bio") bio += " " + text;
          else if (rightColumnState === "Highlights") {
            if (text.startsWith("•") || text.startsWith("-")) {
              career_highlights.push(text.replace(/^[•-]\s*/, ""));
            } else if (career_highlights.length > 0) {
              career_highlights[career_highlights.length - 1] += " " + text;
            } else {
              career_highlights.push(text);
            }
          }
        }
      }
    }

    if (name && name !== "Class profile" && name.length > 2 && name !== "From the Dean") {
      profiles.push({ name, position, company, location, industry: industry.join(", "), education: education.join(", "), skills, languages, countries, passports, bio: bio.trim(), career_highlights, email, linkedin });
    }
  }

  fs.writeFileSync(outPath, JSON.stringify({ profiles }, null, 2), "utf-8");
  console.log(`Extracted ${profiles.length} profiles to ${outPath}`);
};

async function main() {
  await extractProfiles("SloanTalentDirectory2021_final.pdf", "offline_alumni_2021.json");
  await extractProfiles("SloanTalentDirectory2023_3.pdf", "offline_alumni_2023.json");
}

main().catch(console.error);
