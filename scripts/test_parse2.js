import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

async function parse() {
  const dataBuffer = fs.readFileSync("data/SloanTalentDirectory2021_final.pdf");
  const data = await pdfParse(dataBuffer);
  fs.writeFileSync("data/pdf_raw_text_2021_pdfjs.txt", data.text);
  console.log("Written!");
}
parse();
