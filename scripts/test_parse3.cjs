const pdf = require('pdf-parse');
const fs = require('fs');

async function run() {
  const buf = fs.readFileSync('data/SloanTalentDirectory2021_final.pdf');
  const data = await pdf(buf);
  fs.writeFileSync('data/pdf_raw_text_2021_pdfjs.txt', data.text);
  console.log("Written!");
}
run();
