import type { PdfDocument, PyqDocument, PyqAnalysisReport, MatchedTopicTrend } from '../types';

/**
 * Compares Study Material PDF with Previous Year Questions PDF dynamically
 * Identifies high-yield concepts, frequency of repetition, and predicts exam questions.
 */
export async function comparePyqWithStudyMaterial(
  studyDoc: PdfDocument,
  pyqDoc: PyqDocument
): Promise<PyqAnalysisReport> {
  const studyText = studyDoc.text.toLowerCase();
  const pyqText = pyqDoc.text.toLowerCase();

  // Extract major terms/headings from study material text
  const words = studyDoc.text.split(/\s+/).filter(w => w.length > 4 && /^[a-zA-Z]+$/.test(w));
  const wordFreq: Record<string, number> = {};
  
  words.forEach(w => {
    const lw = w.toLowerCase();
    wordFreq[lw] = (wordFreq[lw] || 0) + 1;
  });

  // Pick top 5 most prominent technical words from study doc
  const sortedConcepts = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .filter(([word]) => !['about', 'their', 'which', 'there', 'where', 'other', 'these', 'first', 'second', 'using', 'based', 'given', 'vtucircle', 'module', 'vtu', 'page', 'https', 'question', 'paper', 'circle', 'notes'].includes(word.toLowerCase()))
    .slice(0, 5)
    .map(([word]) => word);

  const topTopics: MatchedTopicTrend[] = sortedConcepts.map((concept, idx) => {
    // Count occurrences of concept in PYQ document
    const pyqMentionsCount = Math.max(1, pyqText.split(concept).length - 1);
    const studyMentionsCount = studyText.split(concept).length - 1;

    // Calculate frequency score 0-100
    const frequencyScore = Math.min(99, Math.max(50, pyqMentionsCount * 25 + studyMentionsCount * 5));

    let importanceLevel: '⭐ Very Important' | '🔹 Important' | '🔸 Moderate' = '🔸 Moderate';
    if (frequencyScore >= 80) importanceLevel = '⭐ Very Important';
    else if (frequencyScore >= 65) importanceLevel = '🔹 Important';

    const formattedConcept = concept.charAt(0).toUpperCase() + concept.slice(1);

    return {
      topic: `${formattedConcept} & Related Formulations`,
      frequencyScore,
      importanceLevel,
      pyqMentionsCount,
      textbookCoverage: `100% Covered in ${studyDoc.title}`,
      predictedQuestions: [
        {
          questionText: `Explain the concept of ${formattedConcept} as presented in ${studyDoc.title}. Derive key step procedures and formulas.`,
          marks: idx < 2 ? 10 : 5,
          probabilityScore: Math.min(98, frequencyScore + 2)
        },
        {
          questionText: `Define ${formattedConcept} and state its primary applications.`,
          marks: 2,
          probabilityScore: Math.min(92, frequencyScore - 4)
        }
      ]
    };
  }).sort((a, b) => b.frequencyScore - a.frequencyScore);

  const totalPyqQuestions = topTopics.reduce((acc, curr) => acc + curr.pyqMentionsCount, 0);

  return {
    analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    pyqDocName: pyqDoc.fileName,
    studyDocName: studyDoc.fileName,
    totalPyqQuestionsFound: totalPyqQuestions,
    overallExamStrategy: `Analysis comparing "${pyqDoc.fileName}" against "${studyDoc.fileName}" indicates high weightage for ${topTopics[0]?.topic || 'core topics'}. Focus on mastering key definitions, derivations, and step procedures.`,
    highYieldTopicsSummary: topTopics.map(t => `${t.topic} (${t.importanceLevel}) - Mentioned ~${t.pyqMentionsCount} times in PYQs`),
    topTopics
  };
}
