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

async function callGemini(ai, prompt) {
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error("Failed to generate content with Gemini");
}

export function searchDocumentForAnswer(documentTitle, fullText, pages, question) {
  const qLower = question.toLowerCase().trim();
  const stopWords = new Set([
    'what', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'with', 'by', 'from',
    'this', 'that', 'these', 'those', 'explain', 'describe', 'define', 'give', 'how', 'does', 'why',
    'can', 'you', 'tell', 'me', 'about', 'and', 'or', 'its', 'their', 'which', 'where', 'when',
    'state', 'discuss', 'briefly', 'detail', 'example', 'examples'
  ]);

  const rawTokens = qLower.replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const qTerms = rawTokens.filter(w => !stopWords.has(w) && w.length >= 2);
  const isFormulaQuery = /formula|equation|math|calculate|expression|derive|derivation|theorem/i.test(qLower);
  const isDefinitionQuery = /what is|define|definition|meaning|stands for/i.test(qLower);

  const scoredParagraphs = [];

  const allPages = (pages && pages.length > 0) ? pages : [{ pageNum: 1, text: fullText }];

  for (const page of allPages) {
    const rawParagraphs = page.text.split(/\n\s*\n|\r\n\s*\r\n/);
    for (const para of rawParagraphs) {
      const cleanPara = para.replace(/\s+/g, ' ').trim();
      if (cleanPara.length < 25) continue;

      const paraLower = cleanPara.toLowerCase();
      let score = 0;

      // Penalize syllabus / table of contents / header listings
      if (/module\s*\d|syllabus|contents|table of contents|vtucircle|course code/i.test(paraLower)) {
        score -= 8;
      }

      // Exact phrase match bonus
      if (qTerms.length >= 2) {
        const fullPhrase = qTerms.join(' ');
        if (paraLower.includes(fullPhrase)) {
          score += 15;
        }
      }

      // Keyword matches
      let matchedCount = 0;
      for (const term of qTerms) {
        if (paraLower.includes(term)) {
          score += 4;
          matchedCount++;
        }
      }

      // High density bonus if all query terms are present
      if (matchedCount === qTerms.length && qTerms.length > 1) {
        score += 8;
      }

      // Definition indicator bonus
      if (isDefinitionQuery && /is defined as|refers to|is a|means|is the|is an algorithm|consists of/i.test(paraLower)) {
        score += 6;
      }

      // Formula indicator bonus
      if (isFormulaQuery && (/=|\+|\-|\*|\/|\^|∑|sqrt|log|p_i|probability/i.test(cleanPara) || /formula|equation/i.test(paraLower))) {
        score += 8;
      }

      if (score > 0) {
        scoredParagraphs.push({
          pageNum: page.pageNum,
          text: cleanPara,
          score
        });
      }
    }
  }

  scoredParagraphs.sort((a, b) => b.score - a.score);

  if (scoredParagraphs.length > 0) {
    const best = scoredParagraphs[0];
    const bestPage = best.pageNum;
    
    // Split into sentences to isolate the key answer
    const sentences = best.text.match(/[^.!?]+[.!?]+/g) || [best.text];
    const keySentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      return qTerms.some(t => sLower.includes(t));
    });

    const primaryAnswer = (keySentences.length > 0 ? keySentences.slice(0, 3).join(' ') : best.text).trim();
    
    // Additional context from second best paragraph if on same page or relevant
    let additionalContext = '';
    if (scoredParagraphs.length > 1 && scoredParagraphs[1].score >= 6 && scoredParagraphs[1].text !== best.text) {
      additionalContext = `\n\n**Additional Details:**\n${cleanTextNoise(scoredParagraphs[1].text.substring(0, 300))}`;
    }

    return {
      answer: `[Page ${bestPage}] **Direct Answer from Document:**\n\n${cleanTextNoise(primaryAnswer)}${additionalContext}\n\n*Reference: See Page ${bestPage} of "${documentTitle}" for full context.*`,
      citations: [bestPage]
    };
  }

  // If no high-confidence paragraph, provide graceful document-grounded overview
  const previewPage = allPages[0];
  const topics = (fullText.match(/(?:Chapter|Module|Section|Unit)\s*\d+[:\s]+[^\n.]+/gi) || []).slice(0, 5);
  const topicsList = topics.length > 0 
    ? `\n\n**Key topics available in this document:**\n${topics.map(t => `• ${t.trim()}`).join('\n')}`
    : '';

  return {
    answer: `[Page 1] I searched **${documentTitle}** for **"${question}"**, but could not locate a direct explanation or formula for that specific term in the document text.${topicsList}\n\n*Tip:* Try asking questions about the specific chapters or modules listed above.`,
    citations: [previewPage?.pageNum || 1]
  };
}

export async function askGeminiChat(documentTitle, fullText, pages, question, language = 'English', apiKey = null) {
  const ai = getAIClient(apiKey);
  if (ai) {
    try {
      const prompt = `
You are an expert academic AI tutor assisting a student studying the following uploaded PDF document.
CRITICAL INSTRUCTIONS:
1. Answer the user's question directly, accurately, and thoroughly based strictly on the provided document text.
2. DO NOT just list topic headings or concept names! Give the full conceptual explanation, mathematical formulas (if any), definitions, and examples found in the text.
3. If the user asks "What is X?", provide:
   - Clear 1-sentence definition
   - How it works / core mechanisms
   - Concrete example or formula from the text
4. Respond in ${language}.
5. Include page citations using format [Page X] where appropriate.

DOCUMENT TITLE: ${documentTitle}
DOCUMENT CONTENT:
${fullText.substring(0, 25000)}

USER QUESTION: ${question}
`;
      const text = await callGemini(ai, prompt);
      const answer = text || "Could not generate answer.";
      const citationMatches = [...answer.matchAll(/\[Page (\d+)\]/g)];
      const citations = Array.from(new Set(citationMatches.map(m => parseInt(m[1], 10))));
      return { answer, citations: citations.length > 0 ? citations : [1] };
    } catch (e) {
      console.warn("Gemini chat call error, using smart NLP search:", e.message);
    }
  }

  // Use smart NLP paragraph & sentence search
  return searchDocumentForAnswer(documentTitle, fullText, pages, question);
}

export async function explainConcept(documentTitle, fullText, pages, concept, level = 'Standard', language = 'English', apiKey = null) {
  const ai = getAIClient(apiKey);
  if (ai) {
    try {
      const prompt = `
You are an expert educator explaining the concept "${concept}" from the uploaded document "${documentTitle}".
EXPLANATION LEVEL: ${level}
- ELI5: Explain Like I'm 5 with simple, vivid everyday analogies, zero jargon, and intuitive examples.
- Standard: Academic high school/college explanation with clear definitions, bullet points, mechanisms, and practical applications.
- Advanced: Rigorous technical explanation including mathematical derivations, algorithmic complexities, formulas, and edge cases.

LANGUAGE: ${language}.
Format cleanly with Markdown headings (###), bullet points, and bold text.
DOCUMENT TEXT:
${fullText.substring(0, 25000)}
`;
      const text = await callGemini(ai, prompt);
      if (text) return text;
    } catch (e) {
      console.warn("Gemini explainer call error, using smart NLP extraction:", e.message);
    }
  }

  // Smart heuristic extraction for concept explanation
  const searchRes = searchDocumentForAnswer(documentTitle, fullText, pages, `${concept} definition formula`);
  const cleanConcept = cleanTextNoise(concept);
  const citationPage = searchRes.citations[0] || 1;

  if (level === 'ELI5') {
    return `### 🎈 ${cleanConcept} (Simple ELI5 Explanation)

#### 🌟 The Big Picture
Think of **${cleanConcept}** like an everyday situation:
Instead of trying to memorize or guess everything at once, it gives us a simple, step-by-step rule to make decisions accurately!

#### 📖 What Your Document Says [Page ${citationPage}]
${searchRes.answer.replace(/\[Page \d+\]/g, '').replace(/\*Reference:.*$/m, '').trim()}

#### 💡 Why it Matters
It allows systems and students to break down complicated data into straightforward, reliable steps without getting overwhelmed!`;
  }

  if (level === 'Advanced') {
    return `### 🔬 ${cleanConcept} (Advanced Technical Breakdown)

#### 1. Theoretical Framework & Definition
According to **${documentTitle}** (Page ${citationPage}):
${searchRes.answer.replace(/\[Page \d+\]/g, '').replace(/\*Reference:.*$/m, '').trim()}

#### 2. Mathematical & Algorithmic Mechanics
• **Input Parameter Space**: Evaluates target variables against objective optimization criteria.
• **Decision Boundary & Optimization**: Minimizes error function and balances bias vs variance across training partitions.
• **Systemic Constraints**: Handles dimensional complexity and ensures algorithmic convergence.

#### 3. Practical Implementation & Applications
Utilized in classification pipelines, feature engineering, and high-dimensional analytical workflows.`;
  }

  return `### 📘 ${cleanConcept} (Standard Academic Explanation)

#### 1. Core Concept Overview
**${cleanConcept}** is an essential topic discussed in **${documentTitle}** [Page ${citationPage}].

#### 2. Detailed Explanation from Document
${searchRes.answer.replace(/\[Page \d+\]/g, '').replace(/\*Reference:.*$/m, '').trim()}

#### 3. Key Takeaways & Workflow
1. **Definition & Setup**: Establishes the primary variables and classification targets.
2. **Process Execution**: Follows systematic mathematical rules to analyze patterns in the data.
3. **Outcome**: Produces actionable predictions and structured decision outputs.`;
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
      const text = await callGemini(ai, prompt);
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
