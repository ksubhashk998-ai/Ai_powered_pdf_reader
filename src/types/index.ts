export type LanguageCode = 'en' | 'kn' | 'hi' | 'es' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface PdfPage {
  pageNum: number;
  text: string;
}

export interface PdfDocument {
  id: string;
  fileName: string;
  title: string;
  text: string;
  pages: PdfPage[];
  wordCount: number;
  charCount: number;
  uploadedAt: string;
  isSample?: boolean;
}

export interface PyqDocument {
  id: string;
  fileName: string;
  title: string;
  text: string;
  pages: PdfPage[];
  uploadedAt: string;
  isSample?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: number[]; // Page numbers
  timestamp: string;
}

export type ExplanationLevel = 'ELI5' | 'Standard' | 'Advanced';

export interface ChapterSummary {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  keyTakeaways: string[];
  keyTerms: { term: string; definition: string }[];
}

export interface QuestionItem {
  id: string;
  questionText: string;
  marks: 2 | 5 | 10;
  importance: 'Very Important' | 'Important' | 'Moderate';
  topic: string;
  modelAnswer: string;
  keyPoints: string[];
  pageReference?: number;
}

export interface QuestionPaperConfig {
  institutionName: string;
  subjectName: string;
  courseCode: string;
  duration: string;
  totalMarks: number;
  partA: { count: number; marksEach: number };
  partB: { count: number; marksEach: number };
  partC: { count: number; marksEach: number };
  includeAnswers: boolean;
}

export interface PaperQuestion {
  number: number;
  questionText: string;
  marks: number;
  topic: string;
  answerHint: string;
}

export interface PaperSection {
  sectionLetter: string;
  sectionTitle: string;
  instructions: string;
  totalMarks: number;
  questions: PaperQuestion[];
}

export interface GeneratedQuestionPaper {
  id: string;
  institutionName: string;
  subjectName: string;
  courseCode: string;
  duration: string;
  totalMarks: number;
  generatedDate: string;
  sections: PaperSection[];
}

export interface MatchedTopicTrend {
  topic: string;
  frequencyScore: number; // 0-100
  importanceLevel: '⭐ Very Important' | '🔹 Important' | '🔸 Moderate';
  pyqMentionsCount: number;
  textbookCoverage: string;
  predictedQuestions: {
    questionText: string;
    marks: number;
    probabilityScore: number;
  }[];
}

export interface PyqAnalysisReport {
  analyzedAt: string;
  pyqDocName: string;
  studyDocName: string;
  totalPyqQuestionsFound: number;
  topTopics: MatchedTopicTrend[];
  overallExamStrategy: string;
  highYieldTopicsSummary: string[];
}

export type ActiveTab = 'upload' | 'chat' | 'explain' | 'questions' | 'exam-gen' | 'pyq-analyzer' | 'pdf-viewer';
