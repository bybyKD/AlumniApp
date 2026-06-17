import PDFParser from "pdf2json";
import fs from "fs";

const pdfParser = new PDFParser(this, 1);
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
  fs.writeFileSync("data/pdf_raw_text_2021.txt", pdfParser.getRawTextContent());
  console.log("Written!");
});
pdfParser.loadPDF("data/SloanTalentDirectory2021_final.pdf");
