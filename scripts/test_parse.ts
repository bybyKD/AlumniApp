import fs from "fs";
import * as pdfParse from "pdf-parse";

async function parse() {
  const dataBuffer = fs.readFileSync("data/SloanTalentDirectory2021_final.pdf");
  const data = await pdfParse.default(dataBuffer);
  fs.writeFileSync("data/pdf_raw_text_2021.txt", data.text);
  console.log("Written to data/pdf_raw_text_2021.txt");
}
parse();
