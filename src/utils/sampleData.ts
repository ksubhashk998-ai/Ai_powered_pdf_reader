import type { PdfDocument, PyqDocument, QuestionItem, ChapterSummary, PyqAnalysisReport, LanguageOption } from '../types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export const SAMPLE_STUDY_MATERIAL_TEXT = `
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
COURSE: MACHINE LEARNING (CS-601) - UNIT 1: SUPERVISED LEARNING & ALGORITHMIC FUNDAMENTALS

CHAPTER 1: INTRODUCTION TO MACHINE LEARNING
Machine learning (ML) is a core subfield of Artificial Intelligence that enables computer systems to learn patterns from historical data and make automated predictions or decisions without being explicitly programmed. ML algorithms are categorized into Supervised Learning, Unsupervised Learning, Reinforcement Learning, and Semi-Supervised Learning.

Supervised Learning involves algorithms learning from labeled datasets, where each input example is paired with an target output label. Examples include classification (predicting discrete class labels) and regression (predicting continuous numeric values).
Unsupervised Learning works on unlabeled data to discover hidden patterns, underlying groupings, or cluster structures (e.g., K-Means clustering, Principal Component Analysis - PCA).

CHAPTER 2: DECISION TREE LEARNING & ID3 ALGORITHM
A Decision Tree is a non-parametric supervised learning algorithm used for both classification and regression tasks. It exhibits a tree-like flowchart structure where internal nodes represent tests on attribute values, branches represent test outcomes, and leaf nodes represent final class labels or decisions.

The ID3 (Iterative Dichotomiser 3) algorithm developed by Ross Quinlan builds a decision tree top-down using a greedy search through the space of possible branch tests. ID3 selects attributes based on Information Gain, which measures how well a given attribute separates training examples according to target classification.

Information Gain is calculated using Entropy:
Entropy H(S) = - ∑ (p_i * log2(p_i)) where p_i is the proportion of examples belonging to class i.
Information Gain IG(S, A) = Entropy H(S) - ∑ ((|S_v| / |S|) * H(S_v)) for all attribute values v of A.
Attribute with highest Information Gain is selected at each split node. Key limitations of ID3 include overfitting on high-cardinality nominal attributes and inability to directly handle continuous numerical features or missing values (addressed in C4.5).

CHAPTER 3: NAIVE BAYES CLASSIFICATION
The Naive Bayes classifier is a probabilistic classifier based on applying Bayes' Theorem with strong (naive) independence assumptions between features.
Bayes' Theorem formulation:
P(C | X) = (P(X | C) * P(C)) / P(X)
Where P(C | X) is the posterior probability of class C given feature vector X = (x1, x2, ..., xn).
The "naive" assumption states that attributes x1, x2, ..., xn are conditionally independent of each other given the class label C:
P(X | C) = ∏ P(x_i | C)

Because of this conditional independence assumption, Naive Bayes requires very small amounts of training data to estimate necessary statistical parameters (mean and variance for Gaussian Naive Bayes, word counts for Multinomial Naive Bayes). It is widely used in text classification, spam filtering, and sentiment analysis.

CHAPTER 4: MODEL EVALUATION, BIAS-VARIANCE TRADEOFF & OVERFITTING
Overfitting occurs when a statistical model learns noise and details in training data to the extent that it negatively impacts model performance on new unseen test data. Underfitting occurs when the model is too simple to capture the underlying structure of data.

Bias-Variance Tradeoff:
- Bias represents simplifying assumptions made by a model to render target function easier to approximate (High bias leads to underfitting).
- Variance represents model sensitivity to small fluctuations in training set (High variance leads to overfitting).
- Total Expected Error = Bias^2 + Variance + Irreducible Error.

Evaluation Metrics for Classification:
1. Confusion Matrix: Table displaying True Positives (TP), True Negatives (TN), False Positives (FP), and False Negatives (FN).
2. Accuracy = (TP + TN) / (TP + TN + FP + FN)
3. Precision = TP / (TP + FP) (measures correctness of positive predictions)
4. Recall / Sensitivity = TP / (TP + FN) (measures ability to find all true positive instances)
5. F1-Score = 2 * (Precision * Recall) / (Precision + Recall) (harmonic mean of Precision and Recall)

CHAPTER 5: K-NEAREST NEIGHBORS (KNN) & REGRESSION
K-Nearest Neighbors (KNN) is a lazy learning instance-based algorithm that stores all available instances and classifies new data based on distance metrics (e.g., Euclidean Distance, Manhattan Distance). Distance between two points x and y in n-dimensional space:
Euclidean Distance d(x,y) = sqrt( ∑ (x_i - y_i)^2 )

Linear Regression models the relationship between dependent variable Y and independent variables X using a linear equation Y = β0 + β1*X + ε. Model coefficients β are optimized using Ordinary Least Squares (OLS) or Gradient Descent optimization algorithm.
`;

export const SAMPLE_PYQ_TEXT = `
VTU / ANNA UNIVERSITY END-SEMESTER EXAMINATIONS (2022 - 2025)
SUBJECT: MACHINE LEARNING & AI (CS-601) - PREVIOUS YEAR QUESTIONS COMPILATION

YEAR 2022 EXAM QUESTIONS:
1. (a) Define Supervised and Unsupervised learning with suitable real-world applications. [5 Marks]
   (b) Explain the ID3 algorithm step-by-step with an example dataset. Calculate Information Gain and Entropy formulas. [10 Marks]
2. (a) State Bayes' Theorem. Explain Naive Bayes classification with its independence assumption. [10 Marks]
3. Write short notes on Precision, Recall, F1-Score, and Confusion Matrix. [5 Marks]

YEAR 2023 EXAM QUESTIONS:
1. Explain ID3 Decision Tree construction algorithm. How does Information Gain differ from Gain Ratio? [10 Marks]
2. Differentiate between Overfitting and Underfitting. Explain Bias-Variance Tradeoff with suitable curves. [5 Marks]
3. Explain Naive Bayes algorithm for text classification and spam detection. [10 Marks]
4. Define KNN algorithm. Calculate Euclidean Distance between points P1(2, 4) and P2(5, 8). [2 Marks]

YEAR 2024 EXAM QUESTIONS:
1. Construct a Decision Tree using ID3 algorithm. Derive mathematical formulas for Entropy H(S) and Information Gain IG(S, A). [10 Marks]
2. Derive Naive Bayes classifier formula P(C|X) = P(X|C)P(C)/P(X). Why is it called "naive"? [5 Marks]
3. Define Precision, Recall and F1-score with formulas. [2 Marks]
4. What is a Confusion Matrix? Label TP, TN, FP, and FN in a 2x2 matrix format. [2 Marks]

YEAR 2025 MID-TERM QUESTIONS:
1. Compare ID3 algorithm with Naive Bayes algorithm in terms of computational complexity and assumption of features. [5 Marks]
2. Explain Gradient Descent algorithm for Linear Regression. [5 Marks]
3. Explain 2-mark definitions of Overfitting, Bias, Variance, and K-Nearest Neighbor. [2 Marks each]
`;

export const SAMPLE_STUDY_DOC: PdfDocument = {
  id: 'doc-sample-ml-01',
  title: 'Machine Learning Unit 1 - Supervised Learning & Algorithms',
  fileName: 'ML_Unit_1_Supervised_Learning_Notes.pdf',
  text: SAMPLE_STUDY_MATERIAL_TEXT,
  pages: [
    { pageNum: 1, text: SAMPLE_STUDY_MATERIAL_TEXT.substring(0, 750) },
    { pageNum: 2, text: SAMPLE_STUDY_MATERIAL_TEXT.substring(750, 1600) },
    { pageNum: 3, text: SAMPLE_STUDY_MATERIAL_TEXT.substring(1600, 2500) },
    { pageNum: 4, text: SAMPLE_STUDY_MATERIAL_TEXT.substring(2500) }
  ],
  wordCount: 580,
  charCount: 3820,
  uploadedAt: new Date().toISOString(),
  isSample: true
};

export const SAMPLE_PYQ_DOC: PyqDocument = {
  id: 'pyq-sample-ml-01',
  title: 'ML CS-601 End-Semester Exam Question Papers (2022-2025)',
  fileName: 'CS601_ML_Previous_Year_Question_Papers_2022_2025.pdf',
  text: SAMPLE_PYQ_TEXT,
  pages: [
    { pageNum: 1, text: SAMPLE_PYQ_TEXT.substring(0, 600) },
    { pageNum: 2, text: SAMPLE_PYQ_TEXT.substring(600) }
  ],
  uploadedAt: new Date().toISOString(),
  isSample: true
};

export const SAMPLE_CHAPTER_SUMMARIES: ChapterSummary[] = [
  {
    id: 'sum-1',
    chapterNumber: 1,
    title: 'Introduction to Supervised & Unsupervised Learning',
    summary: 'Machine learning enables computers to learn patterns from historical data. Supervised learning relies on labeled input-output pairs (classification/regression), while unsupervised learning discovers clusters and groupings in unlabeled data.',
    keyTakeaways: [
      'Supervised learning requires labeled dataset (inputs + targets)',
      'Unsupervised learning works on unlabeled data (clustering/PCA)',
      'Classification outputs discrete classes; Regression outputs continuous numbers'
    ],
    keyTerms: [
      { term: 'Labeled Data', definition: 'Dataset containing input features along with expected target values' },
      { term: 'Classification', definition: 'Supervised ML task of predicting categorical output labels' }
    ]
  },
  {
    id: 'sum-2',
    chapterNumber: 2,
    title: 'ID3 Algorithm & Decision Trees',
    summary: 'Decision trees build top-down flowchart structures using attribute tests. The ID3 algorithm selects attributes at each split node using Information Gain derived from Entropy calculations.',
    keyTakeaways: [
      'Information Gain IG(S, A) measures reduction in Entropy',
      'Entropy H(S) = - ∑ (p_i * log2(p_i))',
      'ID3 prefers high-cardinality attributes and may overfit without pruning'
    ],
    keyTerms: [
      { term: 'Entropy', definition: 'Mathematical measure of impurity or uncertainty in a dataset' },
      { term: 'Information Gain', definition: 'Expected reduction in entropy achieved by partitioning samples according to an attribute' }
    ]
  },
  {
    id: 'sum-3',
    chapterNumber: 3,
    title: 'Naive Bayes Probabilistic Classifier',
    summary: 'Naive Bayes applies Bayes theorem under the naive assumption that features are conditionally independent given the class. Excellent for text filtering and high-dimensional datasets.',
    keyTakeaways: [
      'Bayes Theorem: P(C|X) = P(X|C)P(C)/P(X)',
      'Naive assumption simplifies multivariate joint probabilities into products: P(X|C) = ∏ P(x_i|C)',
      'Fast training and effective for spam detection and sentiment analysis'
    ],
    keyTerms: [
      { term: 'Prior Probability P(C)', definition: 'Initial belief probability of a class before observing evidence' },
      { term: 'Posterior Probability P(C|X)', definition: 'Updated probability of class C given feature evidence X' }
    ]
  },
  {
    id: 'sum-4',
    chapterNumber: 4,
    title: 'Bias-Variance Tradeoff & Model Evaluation',
    summary: 'Model generalization requires balancing Bias (underfitting) and Variance (overfitting). Evaluation relies on Confusion Matrix, Precision, Recall, and F1-Score metrics.',
    keyTakeaways: [
      'Overfitting = Low training error + High test error (High variance)',
      'Underfitting = High training error + High test error (High bias)',
      'Precision = TP / (TP + FP); Recall = TP / (TP + FN); F1 = 2*P*R/(P+R)'
    ],
    keyTerms: [
      { term: 'Confusion Matrix', definition: '2x2 or NxN cross-tabulation table comparing actual vs predicted class labels' },
      { term: 'F1-Score', definition: 'Harmonic mean of precision and recall providing balanced performance evaluation' }
    ]
  }
];

export const SAMPLE_IMPORTANT_QUESTIONS: QuestionItem[] = [
  {
    id: 'q-1',
    questionText: 'Explain the ID3 algorithm step-by-step for constructing a Decision Tree. Write the mathematical formulas for Entropy and Information Gain.',
    marks: 10,
    importance: 'Very Important',
    topic: 'Decision Tree Learning & ID3 Algorithm',
    pageReference: 2,
    keyPoints: [
      'Define Decision Tree and top-down greedy search structure',
      'Formula for Entropy: H(S) = - ∑ (p_i * log2(p_i))',
      'Formula for Information Gain: IG(S, A) = H(S) - ∑ (|S_v|/|S|) * H(S_v)',
      'Attribute selection criterion: Select attribute with highest Information Gain',
      'Recursive tree construction stopping conditions (pure leaf node or empty attributes)'
    ],
    modelAnswer: `The ID3 (Iterative Dichotomiser 3) algorithm builds a decision tree top-down from a given dataset S.

1. Mathematical Formulation:
- Entropy H(S): Measures the uncertainty or impurity of set S.
  H(S) = - ∑ [p_i * log2(p_i)] where p_i is the proportion of instances in class i.
- Information Gain IG(S, A): Measures the expected reduction in entropy caused by splitting S on attribute A.
  IG(S, A) = H(S) - ∑ [ (|S_v| / |S|) * H(S_v) ] for each subset S_v created by attribute value v.

2. Step-by-Step Algorithm Procedure:
Step A: Calculate total entropy H(S) of target labels.
Step B: For each attribute A, split data S into subsets S_v based on values of A and calculate IG(S, A).
Step C: Select attribute A_max with highest Information Gain as root/internal decision node.
Step D: Create branch for each value of A_max and divide dataset S into branch subsets.
Step E: Repeat process recursively until all instances in subset belong to same class or no remaining attributes.`
  },
  {
    id: 'q-2',
    questionText: 'State Bayes Theorem. Explain Naive Bayes classification with its conditional independence assumption and its application in text classification.',
    marks: 10,
    importance: 'Very Important',
    topic: 'Naive Bayes Classifier',
    pageReference: 3,
    keyPoints: [
      'State Bayes Theorem: P(C|X) = (P(X|C) * P(C)) / P(X)',
      'Explain "Naive" assumption: Features x_i are conditionally independent given class C',
      'Show product simplification: P(X|C) = ∏ P(x_i|C)',
      'Explain application in spam filtering / sentiment analysis'
    ],
    modelAnswer: `Bayes' Theorem calculates the posterior probability P(C|X) of a class C given an input feature vector X = (x1, x2, ..., xn).

Formula: P(C|X) = [ P(X|C) * P(C) ] / P(X)

Conditional Independence Assumption:
The algorithm is termed "Naive" because it assumes that presence or absence of a particular feature x_i is completely independent of the presence or absence of any other feature, given class label C.
Mathematically: P(x1, x2, ..., xn | C) = P(x1|C) * P(x2|C) * ... * P(xn|C) = ∏ P(x_i|C).

Application in Text Filtering:
In spam classification, words in an email act as independent features. The product of word probabilities P(word_i | Spam) determines whether an email is categorized as Spam or Ham.`
  },
  {
    id: 'q-3',
    questionText: 'Differentiate between Overfitting and Underfitting. Explain the Bias-Variance Tradeoff with suitable curves.',
    marks: 5,
    importance: 'Very Important',
    topic: 'Model Evaluation & Bias-Variance Tradeoff',
    pageReference: 4,
    keyPoints: [
      'Overfitting: Model fits noise in training data; Low train error, High test error',
      'Underfitting: Model too simple; High train error, High test error',
      'Bias: Error from erroneous assumptions (Underfitting)',
      'Variance: Error from sensitivity to small fluctuations in training set (Overfitting)',
      'Total Error = Bias^2 + Variance + Irreducible Error'
    ],
    modelAnswer: `Overfitting occurs when a learning algorithm fits training data too closely, learning noisy fluctuations that fail to generalize to unseen test instances.
Underfitting occurs when a model is overly simplistic and fails to capture underlying patterns even in training data.

Bias-Variance Tradeoff:
- High Bias: Simplistic assumptions causing underfitting.
- High Variance: Overly complex model sensitive to training set variations causing overfitting.
- Optimal Model Complexity lies at the point where Total Error (Bias^2 + Variance + Irreducible Error) is minimized.`
  },
  {
    id: 'q-4',
    questionText: 'Define Precision, Recall, and F1-Score. Give their mathematical formulas and explain Confusion Matrix.',
    marks: 5,
    importance: 'Important',
    topic: 'Evaluation Metrics',
    pageReference: 4,
    keyPoints: [
      'Confusion Matrix 2x2 structure (TP, TN, FP, FN)',
      'Precision = TP / (TP + FP)',
      'Recall = TP / (TP + FN)',
      'F1-Score = 2 * (Precision * Recall) / (Precision + Recall)'
    ],
    modelAnswer: `A Confusion Matrix summarizes prediction results on a classification task.
- TP (True Positive): Positive correctly predicted as Positive.
- TN (True Negative): Negative correctly predicted as Negative.
- FP (False Positive): Negative incorrectly predicted as Positive (Type I error).
- FN (False Negative): Positive incorrectly predicted as Negative (Type II error).

Formulas:
1. Precision = TP / (TP + FP) -> Ratio of correctly predicted positive observations to total predicted positives.
2. Recall = TP / (TP + FN) -> Ratio of correctly predicted positive observations to all actual positive observations.
3. F1-Score = 2 * (Precision * Recall) / (Precision + Recall) -> Harmonic mean balancing Precision and Recall.`
  },
  {
    id: 'q-5',
    questionText: 'Define Supervised Learning vs Unsupervised Learning with one example each.',
    marks: 2,
    importance: 'Important',
    topic: 'ML Fundamentals',
    pageReference: 1,
    keyPoints: [
      'Supervised: Uses labeled data (e.g. Email Spam Detection)',
      'Unsupervised: Uses unlabeled data (e.g. Customer Segmentation via K-Means)'
    ],
    modelAnswer: `Supervised Learning trains on labeled data (inputs paired with output labels), e.g., predicting house prices using historical sales data.
Unsupervised Learning extracts patterns from unlabeled data without predefined output targets, e.g., K-Means clustering for customer segmentation.`
  },
  {
    id: 'q-6',
    questionText: 'What is Entropy in ID3 decision tree learning? State its formula.',
    marks: 2,
    importance: 'Important',
    topic: 'Decision Trees',
    pageReference: 2,
    keyPoints: [
      'Entropy measures impurity/randomness of dataset',
      'Formula: H(S) = - ∑ (p_i * log2(p_i))'
    ],
    modelAnswer: `Entropy measures the level of impurity, randomness, or uncertainty in a dataset S.
Formula: H(S) = - ∑ (p_i * log2(p_i)) where p_i is the probability of class i in dataset S.`
  },
  {
    id: 'q-7',
    questionText: 'Define KNN algorithm and state Euclidean Distance formula between 2 points.',
    marks: 2,
    importance: 'Moderate',
    topic: 'KNN Classifier',
    pageReference: 5,
    keyPoints: [
      'KNN is an instance-based lazy learning algorithm',
      'Euclidean Distance d(x,y) = sqrt( ∑ (x_i - y_i)^2 )'
    ],
    modelAnswer: `K-Nearest Neighbors (KNN) is an instance-based lazy classifier that assigns a sample the majority class of its K nearest neighbors.
Euclidean distance formula: d(p, q) = sqrt( ∑_{i=1}^n (p_i - q_i)^2 ).`
  }
];

export const SAMPLE_PYQ_ANALYSIS_REPORT: PyqAnalysisReport = {
  analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  pyqDocName: 'CS601_ML_Previous_Year_Question_Papers_2022_2025.pdf',
  studyDocName: 'ML_Unit_1_Supervised_Learning_Notes.pdf',
  totalPyqQuestionsFound: 14,
  overallExamStrategy: 'High emphasis on Decision Tree ID3 algorithm calculations (appears in 100% of 2022-2025 papers for 10 marks) and Naive Bayes derivation/spam applications. Model evaluation metrics (Precision/Recall/F1) appear consistently in 2-mark and 5-mark sections.',
  highYieldTopicsSummary: [
    'ID3 Algorithm, Information Gain & Entropy Formulas (10 Marks - 100% frequency in PYQs)',
    'Naive Bayes Theorem & Conditional Independence Assumption (10 Marks / 5 Marks)',
    'Bias-Variance Tradeoff & Overfitting vs Underfitting (5 Marks)',
    'Precision, Recall, F1-Score & Confusion Matrix (2 Marks / 5 Marks)',
    'KNN Euclidean Distance Definition (2 Marks)'
  ],
  topTopics: [
    {
      topic: 'ID3 Algorithm & Information Gain / Entropy',
      frequencyScore: 95,
      importanceLevel: '⭐ Very Important',
      pyqMentionsCount: 4,
      textbookCoverage: '100% Covered in Chapter 2 (Page 2)',
      predictedQuestions: [
        {
          questionText: 'Explain the ID3 algorithm step-by-step for constructing a Decision Tree. Write formulas for Entropy H(S) and Information Gain IG(S, A).',
          marks: 10,
          probabilityScore: 98
        },
        {
          questionText: 'What is Information Gain? How is it used for attribute selection in Decision Trees?',
          marks: 5,
          probabilityScore: 92
        }
      ]
    },
    {
      topic: 'Naive Bayes Probabilistic Classifier',
      frequencyScore: 88,
      importanceLevel: '⭐ Very Important',
      pyqMentionsCount: 3,
      textbookCoverage: '100% Covered in Chapter 3 (Page 3)',
      predictedQuestions: [
        {
          questionText: 'State Bayes Theorem. Explain Naive Bayes classifier and its conditional independence assumption with an example.',
          marks: 10,
          probabilityScore: 94
        },
        {
          questionText: 'Why is Naive Bayes classifier called "naive"? Explain its application in spam classification.',
          marks: 5,
          probabilityScore: 89
        }
      ]
    },
    {
      topic: 'Bias-Variance Tradeoff & Overfitting',
      frequencyScore: 78,
      importanceLevel: '🔹 Important',
      pyqMentionsCount: 3,
      textbookCoverage: '100% Covered in Chapter 4 (Page 4)',
      predictedQuestions: [
        {
          questionText: 'Differentiate between Overfitting and Underfitting. Explain the Bias-Variance tradeoff with curves.',
          marks: 5,
          probabilityScore: 86
        }
      ]
    },
    {
      topic: 'Precision, Recall, F1-Score & Confusion Matrix',
      frequencyScore: 75,
      importanceLevel: '🔹 Important',
      pyqMentionsCount: 3,
      textbookCoverage: '100% Covered in Chapter 4 (Page 4)',
      predictedQuestions: [
        {
          questionText: 'Define Precision, Recall and F1-score with formulas. Construct a Confusion Matrix table.',
          marks: 5,
          probabilityScore: 84
        },
        {
          questionText: 'What is a Confusion Matrix? Define True Positive and False Positive.',
          marks: 2,
          probabilityScore: 91
        }
      ]
    },
    {
      topic: 'Supervised vs Unsupervised Learning & KNN',
      frequencyScore: 65,
      importanceLevel: '🔸 Moderate',
      pyqMentionsCount: 2,
      textbookCoverage: '100% Covered in Chapters 1 & 5 (Pages 1 & 5)',
      predictedQuestions: [
        {
          questionText: 'Define Supervised Learning and Unsupervised Learning with suitable real-world applications.',
          marks: 5,
          probabilityScore: 78
        },
        {
          questionText: 'Define KNN algorithm. Write Euclidean Distance formula.',
          marks: 2,
          probabilityScore: 82
        }
      ]
    }
  ]
};
