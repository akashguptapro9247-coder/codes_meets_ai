import assert from 'assert';
import {
  QUESTION_BANK,
  validateRollNumber,
  generateRandomQuestionSet,
  evaluateSingleAnswer,
  evaluateManualAnswers
} from '../src/data/layer1ManualQuestions.js';

console.log('==============================================================================');
console.log('TEST SUITE: LAYER 1 MANUAL CODING QUESTION DISTRIBUTION');
console.log('==============================================================================\n');

// 1. Verify Question Bank Size & IDs
console.log('--- 1. QUESTION BANK INTEGRITY ---');
const allQuestions = Object.values(QUESTION_BANK);
assert.strictEqual(allQuestions.length, 40, 'Question bank must contain exactly 40 questions');

const easyQuestions = allQuestions.filter(q => q.difficulty === 'easy');
const hardQuestions = allQuestions.filter(q => q.difficulty === 'hard');

assert.strictEqual(easyQuestions.length, 20, 'Exactly 20 Easy questions');
assert.strictEqual(hardQuestions.length, 20, 'Exactly 20 Hard questions');

easyQuestions.forEach(q => {
  assert(q.id >= 1 && q.id <= 20, `Easy question id ${q.id} must be between 1 and 20`);
});

hardQuestions.forEach(q => {
  assert(q.id >= 21 && q.id <= 40, `Hard question id ${q.id} must be between 21 and 40`);
});
console.log('✓ 40 questions verified (Q1–20 Easy, Q21–40 Hard)\n');

// 2. Roll Number Validation
console.log('--- 2. ROLL NUMBER VALIDATION ---');
const juniorRoll = '26A1B2C3D4';
const seniorRoll = '25X9Y8Z7W6';
const invalidRollPrefix = '24A1B2C3D4';
const invalidRollLength = '261234';

const vJunior = validateRollNumber(juniorRoll);
assert.strictEqual(vJunior.valid, true);
assert.strictEqual(vJunior.batch, '26');
assert.strictEqual(vJunior.easyCount, 15);
assert.strictEqual(vJunior.hardCount, 0);
assert.strictEqual(vJunior.totalQuestions, 15);

const vSenior = validateRollNumber(seniorRoll);
assert.strictEqual(vSenior.valid, true);
assert.strictEqual(vSenior.batch, '25');
assert.strictEqual(vSenior.easyCount, 5);
assert.strictEqual(vSenior.hardCount, 10);
assert.strictEqual(vSenior.totalQuestions, 15);

assert.strictEqual(validateRollNumber(invalidRollPrefix).valid, false);
assert.strictEqual(validateRollNumber(invalidRollLength).valid, false);
console.log('✓ Roll number parsing verified (26 -> Junior: 15 Easy, 0 Hard; 25 -> Senior: 5 Easy, 10 Hard)\n');

// 3. Junior Students (Roll Number starting with 26)
console.log('--- 3. JUNIOR QUESTION SELECTION (26) ---');
const juniorSet = generateRandomQuestionSet(juniorRoll);
assert.strictEqual(juniorSet.valid, true);
assert.strictEqual(juniorSet.questions.length, 15, 'Junior must receive exactly 15 questions');

// All 15 MUST come from Q1–20
juniorSet.questions.forEach(q => {
  assert(q.id >= 1 && q.id <= 20, `Junior question ${q.id} must be from Q1–20`);
  assert.strictEqual(q.difficulty, 'easy', `Junior question ${q.id} must be easy`);
  assert.strictEqual(q.correct_answer, undefined, 'correct_answer must be stripped for privacy');
});

// Test randomization across multiple junior attempts
const juniorAttempts = [];
for (let i = 0; i < 20; i++) {
  const attempt = generateRandomQuestionSet(juniorRoll);
  const ids = attempt.questions.map(q => q.id).sort((a, b) => a - b).join(',');
  juniorAttempts.push(ids);
}
const uniqueJuniorCombos = new Set(juniorAttempts);
assert(uniqueJuniorCombos.size > 1, 'Junior questions must be randomized across attempts');
console.log(`✓ Junior set: exactly 15 questions from Q1–20, 0 from Q21–40`);
console.log(`✓ Junior randomization: ${uniqueJuniorCombos.size} unique combinations in 20 attempts\n`);

// 4. Senior Students (Roll Number starting with 25)
console.log('--- 4. SENIOR QUESTION SELECTION (25) ---');
const seniorSet = generateRandomQuestionSet(seniorRoll);
assert.strictEqual(seniorSet.valid, true);
assert.strictEqual(seniorSet.questions.length, 15, 'Senior must receive exactly 15 questions');

const sEasy = seniorSet.questions.filter(q => q.id >= 1 && q.id <= 20);
const sHard = seniorSet.questions.filter(q => q.id >= 21 && q.id <= 40);

assert.strictEqual(sEasy.length, 5, 'Senior must have exactly 5 questions from Q1–20');
assert.strictEqual(sHard.length, 10, 'Senior must have exactly 10 questions from Q21–40');

seniorSet.questions.forEach(q => {
  assert.strictEqual(q.correct_answer, undefined, 'correct_answer must be stripped for privacy');
});

// Test randomization across multiple senior attempts
const seniorAttempts = [];
let shuffledPositionsDiffer = false;
let previousFirstIsEasy = null;

for (let i = 0; i < 20; i++) {
  const attempt = generateRandomQuestionSet(seniorRoll);
  const ids = attempt.questions.map(q => q.id).join(',');
  seniorAttempts.push(ids);

  const firstIsEasy = attempt.questions[0].id <= 20;
  if (previousFirstIsEasy !== null && firstIsEasy !== previousFirstIsEasy) {
    shuffledPositionsDiffer = true;
  }
  previousFirstIsEasy = firstIsEasy;
}
const uniqueSeniorCombos = new Set(seniorAttempts);
assert(uniqueSeniorCombos.size > 1, 'Senior questions must be randomized across attempts');
assert(shuffledPositionsDiffer, 'Final 15 questions must be shuffled so Easy/Hard are intermixed in different positions');

console.log(`✓ Senior set: exactly 5 questions from Q1–20 + exactly 10 from Q21–40 (Total: 15)`);
console.log(`✓ Senior randomization: ${uniqueSeniorCombos.size} unique combinations in 20 attempts`);
console.log(`✓ Senior shuffling: Easy and Hard questions intermixed across the 15 positions\n`);

// 5. Test Scoring Engine (15 questions * 10 marks = 150)
console.log('--- 5. SCORING & EVALUATION ENGINE ---');
const perfectMap = {};
juniorSet.questions.forEach(q => {
  const original = QUESTION_BANK[q.id];
  perfectMap[q.id] = original.correct_answer;
});
const evalPerfect = evaluateManualAnswers(perfectMap);
assert.strictEqual(evalPerfect.score, 150, '15/15 correct must yield 150 marks');
assert.strictEqual(evalPerfect.correctCount, 15);
assert.strictEqual(evalPerfect.accuracy, 100);
console.log(`✓ Perfect score: ${evalPerfect.score} / 150 (Accuracy: ${evalPerfect.accuracy}%)`);

// Partial score test (8/15 correct)
const partialMap = {};
juniorSet.questions.forEach((q, idx) => {
  const original = QUESTION_BANK[q.id];
  if (idx < 8) {
    partialMap[q.id] = original.correct_answer;
  } else {
    partialMap[q.id] = original.correct_answer === 'A' ? 'B' : 'A';
  }
});
const evalPartial = evaluateManualAnswers(partialMap);
assert.strictEqual(evalPartial.score, 80, '8/15 correct must yield 80 marks');
assert.strictEqual(evalPartial.correctCount, 8);
assert.strictEqual(evalPartial.accuracy, Math.round((8 / 15) * 100));
console.log(`✓ Partial score: ${evalPartial.score} / 150 (${evalPartial.correctCount}/15 correct, Accuracy: ${evalPartial.accuracy}%)\n`);

// 6. Test Single Answer Evaluation (Real-time feedback)
console.log('--- 6. REAL-TIME ANSWER FEEDBACK ---');
const q1 = QUESTION_BANK[1];
const correctCheck = evaluateSingleAnswer(1, q1.correct_answer);
assert.strictEqual(correctCheck.is_correct, true);

const wrongCheck = evaluateSingleAnswer(1, q1.correct_answer === 'A' ? 'B' : 'A');
assert.strictEqual(wrongCheck.is_correct, false);
console.log('✓ evaluateSingleAnswer correctly validates chosen options\n');

console.log('==============================================================================');
console.log('ALL TESTS PASSED WITH 100% SUCCESS');
console.log('==============================================================================');
