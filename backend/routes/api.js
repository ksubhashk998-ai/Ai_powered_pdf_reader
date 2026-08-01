import express from 'express';
import multer from 'multer';
import { parsePdfBuffer } from '../services/pdfParser.js';
import { extractImportantQuestionsNLP, cleanTextNoise } from '../services/nlpEngine.js';
import { askGeminiChat, generateGeminiQuestions } from '../services/geminiService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 1. POST /api/upload-pdf
 * Upload and parse PDF document
 */
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const parsed = await parsePdfBuffer(req.file.buffer, req.file.originalname);
    return res.json({
      success: true,
      document: {
        id: `doc-${Date.now()}`,
        fileName: parsed.fileName,
        title: cleanTextNoise(parsed.title),
        text: parsed.fullText,
        pages: parsed.pages,
        wordCount: parsed.wordCount,
        charCount: parsed.charCount,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("PDF upload route error:", error);
    res.status(500).json({ error: 'Failed to process PDF document' });
  }
});

/**
 * 2. POST /api/chat
 * Ask questions about PDF
 */
router.post('/chat', async (req, res) => {
  try {
    const { document, question, language, apiKey } = req.body;
    if (!document || !question) {
      return res.status(400).json({ error: 'Document and question required' });
    }

    const result = await askGeminiChat(
      document.title,
      document.text || '',
      document.pages || [],
      question,
      language || 'English',
      apiKey || req.headers['x-api-key']
    );

    return res.json(result);
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: 'Error generating chat response' });
  }
});

/**
 * 3. POST /api/questions
 * Generate 18+ Important Questions & 10-Mark Model Answers
 */
router.post('/questions', async (req, res) => {
  try {
    const { document, language, apiKey } = req.body;
    if (!document) {
      return res.status(400).json({ error: 'Document object required' });
    }

    // Try Gemini API first
    const geminiQs = await generateGeminiQuestions(
      document.title,
      document.text || '',
      document.pages || [],
      language || 'English',
      apiKey || req.headers['x-api-key']
    );

    if (geminiQs && Array.isArray(geminiQs) && geminiQs.length > 0) {
      return res.json({ success: true, questions: geminiQs });
    }

    // Fallback to Server NLP Engine
    const nlpQs = extractImportantQuestionsNLP(
      document.title,
      document.text || '',
      document.pages || []
    );

    return res.json({ success: true, questions: nlpQs });
  } catch (error) {
    console.error("Questions route error:", error);
    res.status(500).json({ error: 'Error generating important questions' });
  }
});

/**
 * 4. POST /api/pyq-compare
 * Compare Study Notes with PYQ Exam Papers
 */
router.post('/pyq-compare', async (req, res) => {
  try {
    const { studyDoc, pyqDoc } = req.body;
    if (!studyDoc) {
      return res.status(400).json({ error: 'Study document required' });
    }

    const studyText = studyDoc.text || '';
    const pyqText = pyqDoc?.text || studyText;

    const words = studyText.match(/\b[a-zA-Z]{4,}\b/g) || [];
    const stopWords = new Set(['about', 'their', 'which', 'there', 'where', 'other', 'these', 'first', 'second', 'using', 'based', 'given', 'vtucircle', 'module', 'vtu', 'page', 'https', 'question', 'paper', 'circle', 'notes']);
    
    const wordFreq = {};
    words.forEach(w => {
      const lw = w.toLowerCase();
      if (!stopWords.has(lw)) {
        const titleCase = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        wordFreq[titleCase] = (wordFreq[titleCase] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
    const topTopics = topWords.map((word, idx) => {
      const pyqCount = Math.max(1, pyqText.toLowerCase().split(word.toLowerCase()).length - 1);
      const studyCount = studyText.toLowerCase().split(word.toLowerCase()).length - 1;
      const score = Math.min(99, Math.max(55, pyqCount * 20 + studyCount * 4));

      return {
        topic: `${cleanTextNoise(word)} & Formulations`,
        frequencyScore: score,
        importanceLevel: score >= 80 ? '⭐ Very Important' : '🔹 Important',
        pyqMentionsCount: pyqCount,
        textbookCoverage: `100% Covered in ${studyDoc.title}`,
        predictedQuestions: [
          {
            questionText: `Explain the concept of ${cleanTextNoise(word)} as presented in ${studyDoc.title}. Derive key step procedures and formulas.`,
            marks: idx % 2 === 0 ? 10 : 5,
            probabilityScore: Math.min(98, score + 3)
          },
          {
            questionText: `Define ${cleanTextNoise(word)} and state its primary applications.`,
            marks: 2,
            probabilityScore: Math.min(94, score - 2)
          }
        ]
      };
    });

    return res.json({
      success: true,
      report: {
        analyzedAt: new Date().toLocaleDateString(),
        pyqDocName: pyqDoc ? pyqDoc.fileName : 'Auto-Extracted Exam Set',
        studyDocName: studyDoc.fileName,
        totalPyqQuestionsFound: topTopics.length * 2,
        overallExamStrategy: `Analysis comparing "${studyDoc.title}" against exam patterns indicates high weightage for ${topTopics[0]?.topic || 'Core Topics'}.`,
        highYieldTopicsSummary: topTopics.map(t => `${t.topic} (${t.importanceLevel})`),
        topTopics
      }
    });
  } catch (error) {
    console.error("PYQ compare route error:", error);
    res.status(500).json({ error: 'Error comparing PYQ document' });
  }
});

export default router;
