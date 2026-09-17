import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text || '';
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } else {
    throw new Error('Unsupported file extension');
  }
};
