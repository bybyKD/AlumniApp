import PDFParser from "pdf2json";
import fs from "fs";

const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
  fs.writeFileSync("data/pdf_parsed_data_page4.json", JSON.stringify(pdfData.Pages[4], null, 2));
  console.log("Written page 4!");
});
pdfParser.loadPDF("data/SloanTalentDirectory2021_final.pdf");
