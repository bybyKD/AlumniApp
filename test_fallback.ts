import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const file2021 = fs.readFileSync(path.join(dataDir, "SloanTalentDirectory2021_final.json"), "utf-8");
const file2023 = fs.readFileSync(path.join(dataDir, "SloanTalentDirectory2023_3.json"), "utf-8");
const parsed2021 = JSON.parse(file2021);
const parsed2023 = JSON.parse(file2023);
const allProfiles = [...(parsed2021.profiles || []), ...(parsed2023.profiles || [])];
const loadedAlumni = allProfiles.map((p: any, index: number) => {
  let position = p.title || "";
  let company = "";
  if (position.includes(",")) {
    const parts = position.split(",");
    position = parts[0].trim();
    company = parts.slice(1).join(",").trim();
  }
  return {
    id: (index + 1).toString(),
    name: p.name || "Unknown",
    position,
    company,
    education: p.education?.join(", ") || "",
    skills: p.skills || [],
  };
});

try {
  const lastUserMessage = "can you give me 5 alumni";
  let filtered = loadedAlumni;
  
  if (lastUserMessage.includes("2021")) filtered = filtered.filter(a => a.education.includes("2021"));
  else if (lastUserMessage.includes("2023")) filtered = filtered.filter(a => a.education.includes("2023"));
  else if (lastUserMessage.includes("google")) filtered = filtered.filter(a => a.company.toLowerCase().includes("google"));
  else if (lastUserMessage.includes("amazon")) filtered = filtered.filter(a => a.company.toLowerCase().includes("amazon"));
  else if (lastUserMessage.includes("product manager")) filtered = filtered.filter(a => a.position.toLowerCase().includes("product manager") || a.skills.some((s: string) => s.toLowerCase().includes("product manager")));
  else filtered = []; // Default empty if no match

  let fallbackResponse = "*(Offline Mode: AI server is currently busy. Displaying local keyword search results)*\\n\\n";
  
  if (filtered.length > 0) {
    filtered = filtered.slice(0, 10);
    fallbackResponse += "| Name | Company | Role | Profile |\\n|---|---|---|---|\\n";
    filtered.forEach(a => {
      fallbackResponse += `| ${a.name} | ${a.company || '-'} | ${a.position || '-'} | [View Profile](/alumni?id=${a.id}) |\\n`;
    });
  } else {
    fallbackResponse += "Could not find an exact match in offline mode. Try simple keywords like '2021', 'Google', or 'Product Manager'.";
  }
  console.log("SUCCESS");
} catch(e) {
  console.error("FAILED:", e);
}
