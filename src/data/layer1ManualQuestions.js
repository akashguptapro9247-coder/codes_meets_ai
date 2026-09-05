// ==========================================================================
// CODE MEETS AI — LAYER 1 MANUAL QUESTION BANK & SESSION UTILITIES
// ==========================================================================
// Sourced strictly and solely from layer1_manual_questions.json.
// Contains 40 technical questions:
//   - Questions 1–20:  EASY / JUNIOR pool (C Programming fundamentals)
//   - Questions 21–40: HARD / SENIOR pool (Advanced C, DS, Python, Java, Node, OS, DBMS)
//
// Distribution rules:
//   - Junior / 1st Year (Roll starts with 26): Exactly 15 Random Questions from Q1–20 (zero from 21–40).
//   - Senior / 2nd Year (Roll starts with 25): Exactly 5 Random from Q1–20 + 10 Random from Q21–40.
//     Final 15 questions are shuffled so difficulty order is randomized.
// ==========================================================================

import layer1QuestionsData from './layer1_manual_questions.json' with { type: 'json' };

// Build authoritative question bank directly from the current JSON
const easyQuestions = (layer1QuestionsData.easy_round?.questions || []).map((q) => ({
  id: q.id,
  difficulty: 'easy',
  subject: q.subject || layer1QuestionsData.easy_round?.subject || 'C Programming',
  marks: 10,
  question: q.question,
  code: q.code || null,
  options: { ...q.options },
  correct_answer: q.answer
}));

const hardQuestions = (layer1QuestionsData.hard_round?.questions || []).map((q) => ({
  id: q.id,
  difficulty: 'hard',
  subject: q.subject || 'Advanced',
  marks: 10,
  question: q.question,
  code: q.code || null,
  options: { ...q.options },
  correct_answer: q.answer
}));

export const QUESTION_BANK = {};
[...easyQuestions, ...hardQuestions].forEach((q) => {
  QUESTION_BANK[q.id] = q;
});

export const EASY_QUESTIONS = easyQuestions;
export const HARD_QUESTIONS = hardQuestions;

/**
 * Validates a student's roll number and returns batch details.
 * Accepts full 10-character roll number or 2-character batch code ('26' | '25').
 */
export function validateRollNumber(rollNumberRaw) {
  if (!rollNumberRaw) {
    return {
      valid: false,
      error: 'Roll number is required.'
    };
  }

  const rollNumber = String(rollNumberRaw).trim().toUpperCase();

  // Accept 10-character roll number or 2-character batch code ('26' | '25')
  if (rollNumber.length !== 10 && rollNumber.length !== 2) {
    return {
      valid: false,
      error: `Invalid roll number length: must be exactly 10 characters (received ${rollNumber.length} characters).`
    };
  }

  if (!/^[A-Z0-9]+$/i.test(rollNumber)) {
    return {
      valid: false,
      error: 'Invalid roll number format: must contain only letters and numbers (no special characters or spaces).'
    };
  }

  const prefix = rollNumber.substring(0, 2);

  if (prefix === '26') {
    return {
      valid: true,
      batch: '26',
      yearName: 'First Year',
      easyCount: 15,
      hardCount: 0,
      totalQuestions: 15
    };
  } else if (prefix === '25') {
    return {
      valid: true,
      batch: '25',
      yearName: 'Second Year',
      easyCount: 5,
      hardCount: 10,
      totalQuestions: 15
    };
  }

  return {
    valid: false,
    error: `Invalid roll number prefix: must start with '26' (First Year) or '25' (Second Year). Received: '${prefix}'.`
  };
}

/**
 * Shuffles an array randomly using Fisher-Yates algorithm.
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a randomized 15-question set based on the student's batch:
 *   - Junior (Roll starts with 26): Exactly 15 RANDOM questions from Questions 1–20 (Easy/Junior pool).
 *     Never selects from Questions 21–40. Total = 15.
 *   - Senior (Roll starts with 25): Exactly 5 RANDOM questions from Questions 1–20 (Easy)
 *     + Exactly 10 RANDOM questions from Questions 21–40 (Hard). Total = 15.
 *     Final 15-question list is shuffled so Easy and Hard are intermixed.
 */
export function generateRandomQuestionSet(rollNumberRaw) {
  const validation = validateRollNumber(rollNumberRaw);
  if (!validation.valid) {
    return { error: validation.error, questions: [] };
  }

  // Strictly filter: Questions 1–20 = Easy pool, Questions 21–40 = Hard pool
  const easyList = Object.values(QUESTION_BANK).filter((q) => q.difficulty === 'easy' && q.id >= 1 && q.id <= 20);
  const hardList = Object.values(QUESTION_BANK).filter((q) => q.difficulty === 'hard' && q.id >= 21 && q.id <= 40);

  // Junior: exactly 15 random from Questions 1–20 (zero from 21–40)
  // Senior: exactly 5 random from Questions 1–20 (Easy) + 10 random from Questions 21–40 (Hard)
  const selectedEasy = shuffleArray(easyList).slice(0, validation.easyCount);
  const selectedHard = shuffleArray(hardList).slice(0, validation.hardCount);

  // Combine and shuffle final 15-question list so Easy/Hard for seniors are intermixed randomly
  const combined = shuffleArray([...selectedEasy, ...selectedHard]);

  // Strip correct_answer before returning to UI components for student privacy
  const safeQuestions = combined.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    subject: q.subject,
    marks: q.marks,
    question: q.question,
    code: q.code,
    options: { ...q.options }
  }));

  return {
    valid: true,
    batch: validation.batch,
    yearName: validation.yearName,
    questions: safeQuestions
  };
}

/**
 * Evaluates a single selected answer against the authoritative question bank.
 * Used for live feedback after student clicks NEXT.
 */
export function evaluateSingleAnswer(questionId, selectedOption) {
  const question = QUESTION_BANK[questionId];
  if (!question) {
    return { is_correct: false, correct_answer: null };
  }
  const cleanSelected = String(selectedOption || '').trim().toUpperCase();
  const cleanCorrect = String(question.correct_answer || '').trim().toUpperCase();
  const isCorrect = cleanSelected === cleanCorrect;
  return {
    is_correct: isCorrect,
    correct_answer: cleanCorrect
  };
}

/**
 * Evaluates an entire map of selected answers and calculates the total score.
 * (10 marks per correct answer, max 150)
 */
export function evaluateManualAnswers(selectedAnswers = {}) {
  let correctCount = 0;
  const totalQuestions = 15;

  Object.entries(selectedAnswers).forEach(([qId, option]) => {
    const question = QUESTION_BANK[qId];
    if (question && question.correct_answer) {
      const cleanSelected = String(option || '').trim().toUpperCase();
      const cleanCorrect = String(question.correct_answer || '').trim().toUpperCase();
      if (cleanSelected === cleanCorrect) {
        correctCount += 1;
      }
    }
  });

  const score = correctCount * 10;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    score,
    correctCount,
    totalQuestions,
    accuracy
  };
}
