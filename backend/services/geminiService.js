import { GoogleGenAI } from '@google/genai';
import { cleanTextNoise } from './nlpEngine.js';

export function getAIClient(customApiKey) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

export async function askGeminiChat(documentTitle, fullText, pages, question, language = 'English', apiKey = null) {
  const ai = getAIClient(apiKey);
  if (ai) {
    try {
      const prompt = `
You are an expert AI tutor assisting a student studying the following uploaded PDF document.
Answer the user's question accurately and thoroughly based ONLY on the provided document text.
Respond in ${language}.
Include page citations using format [Page X] where appropriate.

DOCUMENT TITLE: ${documentTitle}
DOCUMENT CONTENT:
${fullText.substring(0, 25000)}

USER QUESTION: ${question}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      const answer = response.text || "Could not generate answer.";
      const citationMatches = [...answer.matchAll(/\[Page (\d+)\]/g)];
      const citations = Array.from(new Set(citationMatches.map(m => parseInt(m[1], 10))));
      return { answer, citations: citations.length > 0 ? citations : [1] };
    } catch (e) {
      console.warn("Gemini chat call error:", e.message);
    }
  }

  // Fallback heuristic search
  const qTerms = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let bestPage = 1;
  let highestScore = 0;
  let matchingSnippet = '';

  for (const page of pages) {
    const pageTextLower = page.text.toLowerCase();
    let score = 0;
    for (const term of qTerms) {
      if (pageTextLower.includes(term)) score += 1;
    }
    if (score > highestScore) {
      highestScore = score;
      bestPage = page.pageNum;
      matchingSnippet = page.text;
    }
  }

  const snippet = cleanTextNoise(matchingSnippet.substring(0, 450)) || cleanTextNoise(fullText.substring(0, 450));
  return {
    answer: `[Page ${bestPage}] Based on **${documentTitle}**:\n\n${snippet}\n\n*Summary:* Detailed in page ${bestPage}.`,
    citations: [bestPage]
  };
}

export async function generateGeminiQuestions(documentTitle, fullText, pages, language = 'English', apiKey = null) {
  const ai = getAIClient(apiKey);
  if (ai) {
    try {
      const prompt = `
Extract at least 15 to 20 comprehensive exam questions directly from the uploaded document text for "${documentTitle}".
Group them into:
- 6-8 Questions for 2 Marks (Short Definitions & Formulas)
- 6-8 Questions for 5 Marks (Medium Conceptual & Analytical)
- 4-6 Questions for 10 Marks (Comprehensive Long Essay Questions)

CRITICAL INSTRUCTIONS FOR 10-MARK QUESTIONS:
Each 10-mark question MUST have an EXTREMELY DETAILED, MULTI-SECTION MODEL ANSWER (at least 450-600 words) containing:
1. Executive Summary & Theoretical Definition
2. Mathematical Formulations, Architecture / Equations
3. Detailed Step-by-Step Algorithmic Workflow (5 clear steps)
4. Concrete Real-World Application / Numerical Example
5. Comparative Analysis, Advantages & Disadvantages

Language: ${language}.
Clean any web header artifacts like "vtucircle.com" or "Page X" from question titles!

Return JSON array format:
[
  {
    "id": "q-1",
    "questionText": "Question string",
    "marks": 10,
    "importance": "Very Important",
    "topic": "Topic Name",
    "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
    "modelAnswer": "Extremely detailed multi-section answer string...",
    "pageReference": 1
  }
]
DOCUMENT TEXT: ${fullText.substring(0, 25000)}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn("Gemini questions call error:", e.message);
    }
  }

  return null; // Signals fallback to NLP engine
}
