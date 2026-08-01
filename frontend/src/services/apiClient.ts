import type { PdfDocument, QuestionItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function uploadPdfToBackend(file: File): Promise<PdfDocument | null> {
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
    const data = await response.json();
    return data.document;
  } catch (error) {
    console.warn("Backend API upload error, client fallback available:", error);
    return null;
  }
}

export async function fetchQuestionsFromBackend(document: PdfDocument, apiKey?: string): Promise<QuestionItem[] | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      },
      body: JSON.stringify({ document, apiKey })
    });

    if (!response.ok) throw new Error(`Fetch questions failed: ${response.statusText}`);
    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.warn("Backend API questions error:", error);
    return null;
  }
}

export async function fetchChatFromBackend(document: PdfDocument, question: string, language: string = 'en', apiKey?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      },
      body: JSON.stringify({ document, question, language, apiKey })
    });

    if (!response.ok) throw new Error(`Chat failed: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("Backend API chat error:", error);
    return null;
  }
}
