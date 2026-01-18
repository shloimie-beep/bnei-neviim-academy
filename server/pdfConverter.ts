import { pdf } from "pdf-to-img";
import * as fs from "fs";
import * as path from "path";

export interface ConversionResult {
  pageCount: number;
  imagePaths: string[];
}

export async function convertPdfToImages(
  pdfPath: string,
  outputDir: string,
  documentId: string
): Promise<ConversionResult> {
  const imagePaths: string[] = [];
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[PDF Converter] Converting PDF: ${pdfPath}`);
  
  const document = await pdf(pdfPath, { scale: 2 });
  let pageNumber = 1;

  for await (const image of document) {
    const filename = `${documentId}_page_${pageNumber}.png`;
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, image);
    imagePaths.push(outputPath);
    
    console.log(`[PDF Converter] Converted page ${pageNumber}`);
    pageNumber++;
  }

  console.log(`[PDF Converter] Conversion complete: ${imagePaths.length} pages`);
  
  return {
    pageCount: imagePaths.length,
    imagePaths,
  };
}

export async function convertPdfBufferToImages(
  pdfBuffer: Buffer,
  outputDir: string,
  documentId: string
): Promise<ConversionResult> {
  const imagePaths: string[] = [];
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`[PDF Converter] Converting PDF buffer for document: ${documentId}`);
  
  const document = await pdf(pdfBuffer, { scale: 2 });
  let pageNumber = 1;

  for await (const image of document) {
    const filename = `${documentId}_page_${pageNumber}.png`;
    const outputPath = path.join(outputDir, filename);
    
    fs.writeFileSync(outputPath, image);
    imagePaths.push(outputPath);
    
    console.log(`[PDF Converter] Converted page ${pageNumber}`);
    pageNumber++;
  }

  console.log(`[PDF Converter] Conversion complete: ${imagePaths.length} pages`);
  
  return {
    pageCount: imagePaths.length,
    imagePaths,
  };
}
