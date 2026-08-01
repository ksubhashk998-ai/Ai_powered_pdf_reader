import * as pdfjsLib from 'pdfjs-dist';
import type { PdfDocument, PdfPage, PyqDocument } from '../types';

// Set up pdf.js worker URL from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPdfFile(file: File): Promise<{ title: string; pages: PdfPage[]; fullText: string; wordCount: number; charCount: number }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const pages: PdfPage[] = [];
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      pages.push({
        pageNum: i,
        text: pageText
      });
      
      fullText += `--- PAGE ${i} ---\n${pageText}\n\n`;
    }
    
    const words = fullText.trim().split(/\s+/).filter(Boolean);
    const title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

    return {
      title,
      pages,
      fullText,
      wordCount: words.length,
      charCount: fullText.length
    };
  } catch (error) {
    console.warn("PDF parsing fallback to text reader:", error);
    // Fallback text reader for text files or unparseable buffers
    const rawText = await file.text();
    const paragraphs = rawText.split(/\n\s*\n/);
    const pages: PdfPage[] = paragraphs.map((p, idx) => ({
      pageNum: idx + 1,
      text: p
    }));
    
    return {
      title: file.name.replace(/\.[^/.]+$/, ""),
      pages: pages.length > 0 ? pages : [{ pageNum: 1, text: rawText }],
      fullText: rawText,
      wordCount: rawText.split(/\s+/).filter(Boolean).length,
      charCount: rawText.length
    };
  }
}

export function createDocumentFromUpload(file: File, extracted: { title: string; pages: PdfPage[]; fullText: string; wordCount: number; charCount: number }): PdfDocument {
  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: file.name,
    title: extracted.title || file.name,
    text: extracted.fullText,
    pages: extracted.pages,
    wordCount: extracted.wordCount,
    charCount: extracted.charCount,
    uploadedAt: new Date().toISOString()
  };
}

export function createPyqDocumentFromUpload(file: File, extracted: { title: string; pages: PdfPage[]; fullText: string; wordCount: number; charCount: number }): PyqDocument {
  return {
    id: `pyq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: file.name,
    title: extracted.title || file.name,
    text: extracted.fullText,
    pages: extracted.pages,
    uploadedAt: new Date().toISOString()
  };
}
