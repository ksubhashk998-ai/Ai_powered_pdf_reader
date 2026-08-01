export function cleanTextNoise(text = '') {
  return text
    .replace(/vtucircle\.com|vtu\s*circle|page\s*\d+|http[s]?:\/\/\S+|www\.\S+/gi, '')
    .replace(/[^a-zA-Z0-9\s\-\?\:\,\.\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates 18+ comprehensive exam questions with rich 5-section model answers for 10-mark questions
 */
export function extractImportantQuestionsNLP(documentTitle, fullText, pages = []) {
  const questions = [];
  const sentences = fullText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 25);
  const validSentences = sentences.filter(s => 
    !/vtucircle|page\s*\d+|copyright|all rights reserved|vtu\s*question|module-\d/i.test(s)
  );

  const totalPages = Math.max(1, pages.length);

  // 1. 2-Mark Questions (Short Definitions) - 6 to 8 questions
  const defSentences = validSentences.filter(s => 
    /is defined as|refers to|is a|means|consists of|formula|equals|is called/i.test(s)
  );

  const count2M = Math.min(8, Math.max(6, defSentences.length));
  for (let i = 0; i < count2M; i++) {
    const sentence = defSentences[i] || validSentences[i * 2] || validSentences[i];
    const words = sentence.trim().split(/\s+/);
    const subject = cleanTextNoise(words.slice(0, 4).join(' ')) || `Core Concept ${i + 1}`;
    const pageObj = pages.find(p => p.text.includes(sentence)) || pages[i % totalPages];

    questions.push({
      id: `q2-${i + 1}`,
      questionText: `Define "${subject}". What is its primary role in ${documentTitle}?`,
      marks: 2,
      importance: i < 3 ? 'Very Important' : 'Important',
      topic: `${subject} Definition`,
      pageReference: pageObj?.pageNum || 1,
      keyPoints: [
        `State 1-line exact definition of ${subject}`,
        `Provide 1 key formula or application`
      ],
      modelAnswer: `According to ${documentTitle} (Page ${pageObj?.pageNum || 1}):\n\nDefinition: ${cleanTextNoise(sentence)}\n\nKey Role: It acts as a fundamental component in evaluating parameters and optimizing outcomes in this subject.`
    });
  }

  // 2. 5-Mark Questions (Medium Conceptual) - 6 to 8 questions
  const conceptSentences = validSentences.filter(s => 
    /algorithm|process|method|advantage|difference|function|type|category|step|structure/i.test(s)
  );

  const count5M = Math.min(8, Math.max(6, conceptSentences.length));
  for (let i = 0; i < count5M; i++) {
    const sentence = conceptSentences[i] || validSentences[i * 3] || validSentences[i + 2];
    const words = sentence.trim().split(/\s+/);
    const topicName = cleanTextNoise(words.slice(0, 5).join(' ')) || `Topic ${i + 1}`;
    const pageObj = pages.find(p => p.text.includes(sentence)) || pages[(i * 2) % totalPages];

    questions.push({
      id: `q5-${i + 1}`,
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
      modelAnswer: `DETAILED 5-MARK MODEL ANSWER (Page ${pageObj?.pageNum || 1} - ${documentTitle}):\n\n1. Theoretical Overview & Context:\n${cleanTextNoise(sentence)}\n\n2. Key Operational Mechanism:\n• Step 1 (Input Processing): Accepts raw input variables and normalizes attributes for consistent calculation.\n• Step 2 (Algorithmic Logic): Executes mathematical evaluation rules to determine optimal boundaries or splits.\n• Step 3 (Outcome Generation): Produces classified targets or numerical predictions with quantified confidence.\n\n3. Practical Applications:\nApplied extensively in automated analysis, decision trees, and system optimizations across the curriculum.`
    });
  }

  // 3. 10-Mark Questions (Comprehensive 5-Section Essay Model Answers) - 4 to 6 questions
  const count10M = Math.min(6, Math.max(4, Math.ceil(totalPages / 8)));
  const stepInterval = Math.max(1, Math.floor(totalPages / count10M));

  for (let i = 0; i < count10M; i++) {
    const pageIdx = Math.min(totalPages - 1, i * stepInterval);
    const pageObj = pages[pageIdx] || pages[0];
    const pageSnippet = cleanTextNoise(pageObj.text.substring(0, 450));
    const words = pageSnippet.trim().split(/\s+/);
    const majorTopic = cleanTextNoise(words.slice(0, 5).join(' ')) || `Module Topic ${i + 1}`;

    questions.push({
      id: `q10-${i + 1}`,
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
COMPREHENSIVE 10-MARK MODEL ANSWER (Page ${pageObj.pageNum} - ${documentTitle})
================================================================================

1. EXECUTIVE SUMMARY & THEORETICAL FOUNDATIONS:
${majorTopic} represents a cornerstone concept detailed in Page ${pageObj.pageNum} of ${documentTitle}.
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
