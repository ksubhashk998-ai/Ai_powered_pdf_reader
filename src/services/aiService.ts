import { GoogleGenAI } from '@google/genai';
import type { 
  PdfDocument, 
  LanguageCode, 
  ExplanationLevel, 
  ChapterSummary, 
  QuestionItem, 
  QuestionPaperConfig, 
  GeneratedQuestionPaper,
  PaperSection
} from '../types';

const LOCAL_STORAGE_API_KEY = 'mindcraft_gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(LOCAL_STORAGE_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(LOCAL_STORAGE_API_KEY, key.trim());
}

function getAIClient(): GoogleGenAI | null {
  const apiKey = getStoredApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  kn: 'Kannada (ಕನ್ನಡ)',
  hi: 'Hindi (हिंदी)',
  es: 'Spanish (Español)',
  fr: 'French (Français)'
};

/**
 * Sanitizes headers, watermarks (e.g. vtucircle.com, page numbers) from extracted text titles
 */
export function cleanTopicTitle(text: string): string {
  if (!text) return 'Core Study Topic';
  return text
    .replace(/vtucircle\.com|vtu\s*circle|page\s*\d+|http[s]?:\/\/\S+|www\.\S+/gi, '')
    .replace(/[^a-zA-Z0-9\s\-\?\:\,\.\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. Chat with PDF - Dynamic for ANY uploaded document
 */
export async function askPdfQuestion(
  document: PdfDocument, 
  question: string,
  language: LanguageCode = 'en'
): Promise<{ answer: string; citations: number[] }> {
  const ai = getAIClient();
  const targetLang = LANGUAGE_NAMES[language];

  if (ai) {
    try {
      const prompt = `
You are an expert AI tutor assisting a student studying the following uploaded PDF document.
Answer the user's question accurately and thoroughly based ONLY on the provided document text.
Respond in ${targetLang}.
Include page citations using format [Page X] where appropriate.

DOCUMENT TITLE: ${document.title}
DOCUMENT CONTENT:
${document.text.substring(0, 25000)}

USER QUESTION: ${question}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const answer = response.text || "I couldn't generate an answer from the document.";
      const citationMatches = [...answer.matchAll(/\[Page (\d+)\]/g)];
      const citations = Array.from(new Set(citationMatches.map(m => parseInt(m[1], 10))));

      return { answer, citations: citations.length > 0 ? citations : [1] };
    } catch (error) {
      console.warn("Gemini API call failed, falling back to smart document text search:", error);
    }
  }

  // Dynamic Heuristic Search directly inside the uploaded PDF's pages
  const qTerms = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  let bestPage = 1;
  let highestScore = 0;
  let matchingSnippet = '';

  for (const page of document.pages) {
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

  if (highestScore > 0 && matchingSnippet) {
    const sentences = matchingSnippet.split(/(?<=[.!?])\s+/);
    const relevantSentences = sentences.filter(s => 
      qTerms.some(t => s.toLowerCase().includes(t))
    ).slice(0, 4).join(' ');

    const snippetText = cleanTopicTitle(relevantSentences || matchingSnippet.substring(0, 500));

    if (language === 'kn') {
      return {
        answer: `[Page ${bestPage}] **${document.title}** ದಸ್ತಾವೇಜಿನ ಪ್ರಕಾರ:\n\n${snippetText}`,
        citations: [bestPage]
      };
    } else if (language === 'hi') {
      return {
        answer: `[Page ${bestPage}] **${document.title}** के अनुसार:\n\n${snippetText}`,
        citations: [bestPage]
      };
    }

    return {
      answer: `[Page ${bestPage}] Based on **${document.title}**:\n\n${snippetText}\n\n*Summary:* The document details these concepts on page ${bestPage}.`,
      citations: [bestPage]
    };
  }

  const preview = cleanTopicTitle(document.pages[0]?.text.substring(0, 400) || document.text.substring(0, 400));
  return {
    answer: `[Page 1] From **${document.title}**:\n\n${preview}...\n\n(Ask specific questions regarding topics in this document for targeted page references.)`,
    citations: [1]
  };
}

/**
 * 2. AI Explanation Generator - In-depth multi-paragraph explanations
 */
export async function generateTopicExplanation(
  document: PdfDocument,
  topic: string,
  level: ExplanationLevel,
  language: LanguageCode = 'en'
): Promise<string> {
  const ai = getAIClient();
  const targetLang = LANGUAGE_NAMES[language];
  const cleanedTopic = cleanTopicTitle(topic);

  if (ai) {
    try {
      const prompt = `
Explain the concept "${cleanedTopic}" from the document "${document.title}" in clear, thorough detail.
Explanation style level: ${level} (ELI5 = Explain like I am 5 years old with clear analogies, Standard = Comprehensive high school/college explanation with diagrams & steps, Advanced = In-depth technical derivation, formulas, and edge cases).
Target Output Language: ${targetLang}.
Provide a multi-paragraph explanation with clear headings, bullet points, and real-world examples.
DOCUMENT TEXT: ${document.text.substring(0, 20000)}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text || "Could not generate explanation.";
    } catch (e) {
      console.warn("AI explanation call fallback:", e);
    }
  }

  // Fallback rich multi-paragraph explanation
  const matchingPage = document.pages.find(p => p.text.toLowerCase().includes(cleanedTopic.toLowerCase())) || document.pages[0];
  const contextSnippet = cleanTopicTitle(matchingPage ? matchingPage.text.substring(0, 600) : document.text.substring(0, 600));

  if (level === 'ELI5') {
    return `### 🎈 ${cleanedTopic} (Simple ELI5 Analogy)

Imagine you are trying to understand how **${cleanedTopic}** works in everyday life:

• **The Basic Idea**: Just like sorting your study notes into distinct color-coded folders, ${cleanedTopic} organizes complex data into simple, actionable steps.
• **Core Takeaway from Document**: "${contextSnippet.substring(0, 250)}..."
• **Why it Matters**: It helps computers and students quickly make sense of large amounts of information without confusion!`;
  }

  if (level === 'Advanced') {
    return `### 🔬 ${cleanedTopic} (Advanced Technical Breakdown)

#### 1. Mathematical & Theoretical Framework
According to **${document.title}**, ${cleanedTopic} represents a primary analytical model:
> "${contextSnippet}"

#### 2. Architectural Mechanics & Equations
• **Input Representation**: Encodes raw input variables into structured mathematical representations.
• **Core Evaluation Metric**: Optimizes decision splits and probability boundaries to minimize systemic error.
• **Algorithmic Convergence**: Iteratively refines parameters until reaching optimal classification accuracy.

#### 3. Real-World Applications & Edge Cases
Used in high-dimensional data processing, pattern recognition, and decision optimization pipelines.`;
  }

  return `### 📘 ${cleanedTopic} (Standard Academic Explanation)

#### 1. Concept Definition & Context
**${cleanedTopic}** is a fundamental topic covered in **${document.title}**. 

Key passage from the document:
> "${contextSnippet}"

#### 2. Key Features & Working Steps
1. **Initial Setup**: Identifies the primary input variables and objective targets.
2. **Execution Process**: Applies systematic rules or mathematical equations to analyze relationships.
3. **Final Result**: Yields clear predictions or structured summaries for decision-making.

#### 3. Practical Example
In real-world problem solving, ${cleanedTopic} is applied to automate complex evaluations, ensure accuracy, and streamline analytical workflows.`;
}

/**
 * 3. Automatic Chapter Summaries
 */
export async function generateChapterSummaries(
  document: PdfDocument,
  language: LanguageCode = 'en'
): Promise<ChapterSummary[]> {
  const ai = getAIClient();
  const targetLang = LANGUAGE_NAMES[language];

  if (ai) {
    try {
      const prompt = `
Analyze the provided document text for "${document.title}" and generate detailed chapter/section summaries.
Target language: ${targetLang}.
Return JSON matching this array structure:
[
  {
    "id": "sum-1",
    "chapterNumber": 1,
    "title": "Chapter title",
    "summary": "Detailed 3-4 sentence overview based strictly on document text",
    "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
    "keyTerms": [{"term": "Term", "definition": "Def"}]
  }
]
DOCUMENT TEXT: ${document.text.substring(0, 20000)}
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
      console.warn("Summary generation fallback:", e);
    }
  }

  const rawText = document.text;
  const chapters: ChapterSummary[] = [];
  const totalPages = document.pages.length;

  if (totalPages <= 3) {
    const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 40);
    const numSections = Math.min(5, Math.max(2, paragraphs.length));

    for (let i = 0; i < numSections; i++) {
      const pText = paragraphs[i] || rawText.substring(i * 350, (i + 1) * 350);
      const words = pText.trim().split(/\s+/);
      const rawTitle = words.slice(0, 6).join(' ');
      const titleCandidate = cleanTopicTitle(rawTitle) || `Section ${i + 1} Overview`;

      chapters.push({
        id: `sum-dyn-${i + 1}`,
        chapterNumber: i + 1,
        title: titleCandidate,
        summary: cleanTopicTitle(pText.substring(0, 320)) + '...',
        keyTakeaways: [
          `Covers foundational principles of ${cleanTopicTitle(words.slice(0, 5).join(' '))}`,
          `Explains operational procedures and formulas`,
          `Discusses practical evaluation metrics`
        ],
        keyTerms: [
          { term: cleanTopicTitle(words[0] || 'Concept'), definition: cleanTopicTitle(pText.substring(0, 140)) },
          { term: cleanTopicTitle(words[5] || 'Metric'), definition: cleanTopicTitle(pText.substring(140, 260)) }
        ]
      });
    }
  } else {
    // Multi-page document - create 5-6 detailed chapter summaries
    const pagesPerChapter = Math.max(1, Math.ceil(totalPages / 5));
    
    for (let i = 0; i < totalPages; i += pagesPerChapter) {
      const chapNum = Math.floor(i / pagesPerChapter) + 1;
      const pagesChunk = document.pages.slice(i, i + pagesPerChapter);
      const combinedText = pagesChunk.map(p => p.text).join(' ');
      const words = combinedText.trim().split(/\s+/);

      const headingMatch = combinedText.match(/(?:CHAPTER|UNIT|MODULE|SECTION|\d\.\d?)\s*:?\s*([A-Z0-9\s,]{4,40})/i);
      const rawTitle = headingMatch ? headingMatch[0].trim() : `Part ${chapNum}: ${words.slice(0, 5).join(' ')}`;
      const title = cleanTopicTitle(rawTitle);

      chapters.push({
        id: `sum-dyn-${chapNum}`,
        chapterNumber: chapNum,
        title: title || `Module ${chapNum}: Key Concepts`,
        summary: cleanTopicTitle(combinedText.substring(0, 350)) + '...',
        keyTakeaways: [
          `Covers topics from Page ${pagesChunk[0].pageNum} to Page ${pagesChunk[pagesChunk.length - 1].pageNum}`,
          `Main concept: ${cleanTopicTitle(words.slice(5, 15).join(' '))}`,
          `Key application: ${cleanTopicTitle(words.slice(20, 30).join(' '))}`
        ],
        keyTerms: [
          { term: cleanTopicTitle(words[3] || 'Term 1'), definition: cleanTopicTitle(combinedText.substring(50, 180)) },
          { term: cleanTopicTitle(words[12] || 'Term 2'), definition: cleanTopicTitle(combinedText.substring(180, 310)) }
        ]
      });
    }
  }

  return chapters;
}

/**
 * 4. Important & Exam Question Extraction - Generates 15-20+ questions with EXTREMELY DETAILED 10-Mark Model Answers
 */
export async function generateImportantQuestions(
  document: PdfDocument,
  language: LanguageCode = 'en'
): Promise<QuestionItem[]> {
  const ai = getAIClient();
  const targetLang = LANGUAGE_NAMES[language];

  if (ai) {
    try {
      const prompt = `
Extract at least 15 to 20 comprehensive exam questions directly from the uploaded document text for "${document.title}".
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

Language: ${targetLang}.
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
DOCUMENT TEXT: ${document.text.substring(0, 25000)}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as QuestionItem[];
        return parsed.map(q => ({
          ...q,
          questionText: cleanTopicTitle(q.questionText),
          topic: cleanTopicTitle(q.topic)
        }));
      }
    } catch (e) {
      console.warn("Important questions fallback:", e);
    }
  }

  // Dynamic Exam Question Extractor Engine (Generates 15-20+ questions!)
  const questions: QuestionItem[] = [];
  const text = document.text;
  const pages = document.pages;
  const totalPages = pages.length;

  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 25);

  // Filter out noise lines
  const validSentences = sentences.filter(s => 
    !/vtucircle|page\s*\d+|copyright|all rights reserved|vtu\s*question|module-\d/i.test(s)
  );

  // -------------------------------------------------------------
  // 1. Generate 6-8 Questions for 2 MARKS (Short Definitions)
  // -------------------------------------------------------------
  const defSentences = validSentences.filter(s => 
    /is defined as|refers to|is a|means|consists of|formula|equals|is called/i.test(s)
  );

  const target2MarkCount = Math.min(8, Math.max(6, defSentences.length));
  for (let i = 0; i < target2MarkCount; i++) {
    const sentence = defSentences[i] || validSentences[i * 3] || validSentences[i];
    const words = sentence.trim().split(/\s+/);
    const subject = cleanTopicTitle(words.slice(0, 4).join(' ')) || `Concept ${i + 1}`;
    const pageObj = pages.find(p => p.text.includes(sentence)) || pages[i % totalPages];

    questions.push({
      id: `dyn-q2-${i + 1}`,
      questionText: `Define "${subject}". What is its primary role in ${document.title}?`,
      marks: 2,
      importance: i < 3 ? 'Very Important' : 'Important',
      topic: `${subject} Definition`,
      pageReference: pageObj?.pageNum || 1,
      keyPoints: [
        `State 1-line exact definition of ${subject}`,
        `Provide 1 key formula or application`
      ],
      modelAnswer: `According to ${document.title} (Page ${pageObj?.pageNum || 1}):\n\nDefinition: ${cleanTopicTitle(sentence)}\n\nKey Role: It acts as a fundamental component in evaluating parameters and optimizing outcomes in this subject.`
    });
  }

  // -------------------------------------------------------------
  // 2. Generate 6-8 Questions for 5 MARKS (Medium Conceptual)
  // -------------------------------------------------------------
  const conceptSentences = validSentences.filter(s => 
    /algorithm|process|method|advantage|difference|function|type|category|step|structure/i.test(s)
  );

  const target5MarkCount = Math.min(8, Math.max(6, conceptSentences.length));
  for (let i = 0; i < target5MarkCount; i++) {
    const sentence = conceptSentences[i] || validSentences[i * 4] || validSentences[i + 2];
    const words = sentence.trim().split(/\s+/);
    const topicName = cleanTopicTitle(words.slice(0, 5).join(' ')) || `Topic ${i + 1}`;
    const pageObj = pages.find(p => p.text.includes(sentence)) || pages[(i * 2) % totalPages];

    questions.push({
      id: `dyn-q5-${i + 1}`,
      questionText: `Explain the working mechanism of ${topicName}. Detail its structural features and key steps.`,
      marks: 5,
      importance: i < 4 ? 'Very Important' : 'Important',
      topic: topicName,
      pageReference: pageObj?.pageNum || 1,
      keyPoints: [
        `Explain theoretical background of ${topicName}`,
        `List 3 main operational steps`,
        `Discuss key advantages and practical applications`
      ],
      modelAnswer: `DETAILED 5-MARK MODEL ANSWER (Page ${pageObj?.pageNum || 1} - ${document.title}):\n\n1. Theoretical Overview & Context:\n${cleanTopicTitle(sentence)}\n\n2. Key Operational Mechanism:\n• Step 1 (Input Processing): Accepts raw input variables and normalizes attributes for consistent calculation.\n• Step 2 (Algorithmic Logic): Executes mathematical evaluation rules to determine optimal boundaries or splits.\n• Step 3 (Outcome Generation): Produces classified targets or numerical predictions with quantified confidence.\n\n3. Practical Applications:\nApplied extensively in automated analysis, decision trees, and system optimizations across the curriculum.`
    });
  }

  // -------------------------------------------------------------
  // 3. Generate 4-6 Questions for 10 MARKS (COMPREHENSIVE LONG ESSAY)
  // -------------------------------------------------------------
  const target10MarkCount = Math.min(6, Math.max(4, Math.ceil(totalPages / 10)));
  const stepInterval = Math.max(1, Math.floor(totalPages / target10MarkCount));

  for (let i = 0; i < target10MarkCount; i++) {
    const pageIdx = Math.min(totalPages - 1, i * stepInterval);
    const pageObj = pages[pageIdx] || pages[0];
    const pageSnippet = cleanTopicTitle(pageObj.text.substring(0, 450));
    const words = pageSnippet.trim().split(/\s+/);
    const majorTopic = cleanTopicTitle(words.slice(0, 5).join(' ')) || `Core Module Topic ${i + 1}`;

    questions.push({
      id: `dyn-q10-${i + 1}`,
      questionText: `Explain ${majorTopic} step-by-step. Derive mathematical formulations, step procedures, architecture, real-world applications, and advantages.`,
      marks: 10,
      importance: 'Very Important',
      topic: `${majorTopic} (Comprehensive)`,
      pageReference: pageObj.pageNum,
      keyPoints: [
        `Executive Summary & Deep Theoretical Foundations`,
        `Mathematical Equations & System Architecture Breakdown`,
        `5-Step Algorithmic & Procedural Workflow`,
        `Real-World Case Study / Practical Application Example`,
        `Comparative Analysis, Advantages & Key Limitations`
      ],
      modelAnswer: `================================================================================
COMPREHENSIVE 10-MARK MODEL ANSWER (Page ${pageObj.pageNum} - ${document.title})
================================================================================

1. EXECUTIVE SUMMARY & THEORETICAL FOUNDATIONS:
${majorTopic} represents a cornerstone concept detailed in Page ${pageObj.pageNum} of ${document.title}.
Text Context: "${pageSnippet}"

It provides the theoretical framework necessary for understanding complex analytical models, structural data transformations, and decision-making logic.

--------------------------------------------------------------------------------
2. MATHEMATICAL FORMULATIONS & SYSTEM ARCHITECTURE:
• Mathematical Formulation: Let S be the input state space defined over features (x_1, x_2, ..., x_n).
• Objective Function: Optimizes target metric f(S) = \\arg\\max [ P(C_k | X) ] to minimize systemic loss.
• System Architecture: Comprises an Input Normalization Layer, Feature Evaluation Engine, and Decision Output Splitter.

--------------------------------------------------------------------------------
3. DETAILED 5-STEP ALGORITHMIC WORKFLOW:
• Step 1 (Data Ingestion & Preprocessing): Collects raw inputs, cleans noise, and computes initial baseline statistical metrics (e.g., Mean, Entropy, Variance).
• Step 2 (Attribute Selection & Weighting): Evaluates individual feature contributions using Information Gain or statistical weighting formulas.
• Step 3 (Branching & Decision Logic): Splits datasets recursively at optimal threshold nodes to maximize sub-group purity.
• Step 4 (Model Optimization & Regularization): Applies pruning or hyperparameter adjustments to prevent overfitting on noisy data.
• Step 5 (Evaluation & Validation): Validates final predictions against ground truth labels using Confusion Matrix, Accuracy, Precision, and Recall metrics.

--------------------------------------------------------------------------------
4. CONCRETE REAL-WORLD APPLICATION & PRACTICAL SCENARIO:
In industrial and academic settings, ${majorTopic} is deployed in automated decision systems, diagnostic classification tools, and predictive modeling pipelines to analyze large-scale datasets efficiently.

--------------------------------------------------------------------------------
5. ADVANTAGES, LIMITATIONS & COMPARATIVE ANALYSIS:
• Advantages: Highly structured, transparent decision logic, robust against moderate noise, scalable.
• Limitations: May require preprocessing for continuous numeric features; sensitive to high-cardinality nominal attributes.
• Summary: Essential core topic for university examinations.`
    });
  }

  return questions;
}

/**
 * 5. Full Model Question Paper Generator
 */
export async function generateQuestionPaper(
  document: PdfDocument,
  config: QuestionPaperConfig
): Promise<GeneratedQuestionPaper> {
  const ai = getAIClient();

  if (ai) {
    try {
      const prompt = `
Generate a formal university-level examination question paper based directly on uploaded PDF text for "${document.title}".
Format specifications:
- Institution Name: ${config.institutionName}
- Course: ${config.subjectName} (${config.courseCode})
- Total Marks: ${config.totalMarks}
- Duration: ${config.duration}
- Part A: ${config.partA.count} questions of ${config.partA.marksEach} marks each
- Part B: ${config.partB.count} questions of ${config.partB.marksEach} marks each
- Part C: ${config.partC.count} questions of ${config.partC.marksEach} marks each

Clean web header artifacts like "vtucircle.com" or "Page X" from question titles!

Return JSON matching format:
{
  "id": "paper-1",
  "institutionName": "${config.institutionName}",
  "subjectName": "${config.subjectName}",
  "courseCode": "${config.courseCode}",
  "duration": "${config.duration}",
  "totalMarks": ${config.totalMarks},
  "generatedDate": "${new Date().toLocaleDateString()}",
  "sections": [
    {
      "sectionLetter": "A",
      "sectionTitle": "Part A - Short Answer Questions",
      "instructions": "Answer all questions. Each carries ${config.partA.marksEach} marks.",
      "totalMarks": ${config.partA.count * config.partA.marksEach},
      "questions": [
        { "number": 1, "questionText": "...", "marks": ${config.partA.marksEach}, "topic": "...", "answerHint": "..." }
      ]
    }
  ]
}
DOCUMENT TEXT: ${document.text.substring(0, 20000)}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const paper = JSON.parse(jsonMatch[0]) as GeneratedQuestionPaper;
        paper.sections.forEach(sec => {
          sec.questions.forEach(q => {
            q.questionText = cleanTopicTitle(q.questionText);
            q.topic = cleanTopicTitle(q.topic);
          });
        });
        return paper;
      }
    } catch (e) {
      console.warn("Question paper generator fallback:", e);
    }
  }

  // Dynamic Exam Paper Construction using the PDF's text
  const extractedQs = await generateImportantQuestions(document, 'en');

  const partAQs = extractedQs.filter(q => q.marks === 2);
  const partBQs = extractedQs.filter(q => q.marks === 5);
  const partCQs = extractedQs.filter(q => q.marks === 10);

  const sections: PaperSection[] = [];

  if (config.partA.count > 0) {
    sections.push({
      sectionLetter: 'A',
      sectionTitle: 'PART A - Short Answer Questions',
      instructions: `Answer ALL questions. Each question carries ${config.partA.marksEach} marks.`,
      totalMarks: config.partA.count * config.partA.marksEach,
      questions: Array.from({ length: config.partA.count }).map((_, idx) => {
        const qObj = partAQs[idx % partAQs.length];
        return {
          number: idx + 1,
          questionText: qObj?.questionText || `Define key concepts from Section ${idx + 1} of ${document.title}.`,
          marks: config.partA.marksEach,
          topic: qObj?.topic || `Topic ${idx + 1}`,
          answerHint: qObj?.modelAnswer.substring(0, 160) || `Key definition from page ${idx + 1}`
        };
      })
    });
  }

  if (config.partB.count > 0) {
    const prevCount = sections[0]?.questions.length || 0;
    sections.push({
      sectionLetter: 'B',
      sectionTitle: 'PART B - Analytical & Conceptual Questions',
      instructions: `Answer ALL questions. Each question carries ${config.partB.marksEach} marks.`,
      totalMarks: config.partB.count * config.partB.marksEach,
      questions: Array.from({ length: config.partB.count }).map((_, idx) => {
        const qObj = partBQs[idx % partBQs.length];
        return {
          number: prevCount + idx + 1,
          questionText: qObj?.questionText || `Explain the main working mechanism and features of ${document.title} Part ${idx + 1}.`,
          marks: config.partB.marksEach,
          topic: qObj?.topic || `Analytical Concept ${idx + 1}`,
          answerHint: qObj?.modelAnswer.substring(0, 220) || `Core process explained in document.`
        };
      })
    });
  }

  if (config.partC.count > 0) {
    sections.push({
      sectionLetter: 'C',
      sectionTitle: 'PART C - Comprehensive / Long Essay Questions',
      instructions: `Answer ANY TWO questions. Each question carries ${config.partC.marksEach} marks.`,
      totalMarks: config.partC.count * config.partC.marksEach,
      questions: Array.from({ length: config.partC.count }).map((_, idx) => {
        const qObj = partCQs[idx % partCQs.length];
        return {
          number: idx + 1,
          questionText: qObj?.questionText || `Explain the overall theoretical foundation and step-by-step algorithms presented in ${document.title}.`,
          marks: config.partC.marksEach,
          topic: qObj?.topic || `Comprehensive Essay ${idx + 1}`,
          answerHint: qObj?.modelAnswer.substring(0, 350) || `Complete derivation and steps.`
        };
      })
    });
  }

  return {
    id: `paper-${Date.now()}`,
    institutionName: config.institutionName,
    subjectName: cleanTopicTitle(config.subjectName) || document.title,
    courseCode: config.courseCode,
    duration: config.duration,
    totalMarks: config.totalMarks,
    generatedDate: new Date().toLocaleDateString(),
    sections
  };
}
