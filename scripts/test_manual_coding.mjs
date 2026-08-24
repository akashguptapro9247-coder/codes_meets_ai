import {
  EASY_QUESTIONS,
  HARD_QUESTIONS,
  validateRollNumber,
  generateRandomQuestionSet,
  evaluateManualAnswers
} from '../src/data/layer1ManualQuestions.js';

console.log('====================================================');
console.log('CODE MEETS AI - LAYER 1 MANUAL CODING VERIFICATION');
console.log('====================================================\n');

// 1. Test Roll Number Validation
console.log('--- 1. Testing Roll Number Validation ---');
const testCases = [
  { roll: '2601234567', expectedValid: true, expectedBatch: '26', expectedYear: 'First Year' },
  { roll: '2512345678', expectedValid: true, expectedBatch: '25', expectedYear: 'Second Year' },
  { roll: '1234567890', expectedValid: false, errorContains: 'Unsupported roll number batch' },
  { roll: '261234567', expectedValid: false, errorContains: 'must be exactly 10 digits' },
  { roll: '26123456789', expectedValid: false, errorContains: 'must be exactly 10 digits' },
  { roll: 'ABC1234567', expectedValid: false, errorContains: 'must be exactly 10 digits' }
];

let validationPassed = true;
testCases.forEach((tc) => {
  const res = validateRollNumber(tc.roll);
  if (tc.expectedValid) {
    const ok = res.valid === true && res.batch === tc.expectedBatch && res.yearName === tc.expectedYear;
    console.log(`[ROLL: ${tc.roll}] -> VALID (${res.yearName}, Batch ${res.batch}): ${ok ? '✓ PASS' : '✗ FAIL'}`);
    if (!ok) validationPassed = false;
  } else {
    const ok = res.valid === false && res.error && res.error.includes(tc.errorContains);
    console.log(`[ROLL: ${tc.roll}] -> REJECTED (${res.error}): ${ok ? '✓ PASS' : '✗ FAIL'}`);
    if (!ok) validationPassed = false;
  }
});

// 2. Test Question Database
console.log('\n--- 2. Testing Question Database ---');
console.log(`Easy Questions in DB: ${EASY_QUESTIONS.length} (Expected: 15) -> ${EASY_QUESTIONS.length === 15 ? '✓ PASS' : '✗ FAIL'}`);
console.log(`Hard Questions in DB: ${HARD_QUESTIONS.length} (Expected: 15) -> ${HARD_QUESTIONS.length === 15 ? '✓ PASS' : '✗ FAIL'}`);

// 3. Test Random Question Set Generation
console.log('\n--- 3. Testing Random Question Selection & Distribution ---');

// Batch 26 (First Year): 8 Easy + 2 Hard
const firstYearSet = generateRandomQuestionSet('26');
const fEasy = firstYearSet.filter(q => q.difficulty === 'easy').length;
const fHard = firstYearSet.filter(q => q.difficulty === 'hard').length;
console.log(`First Year (Batch 26): ${firstYearSet.length} Total (${fEasy} Easy, ${fHard} Hard) -> ${firstYearSet.length === 10 && fEasy === 8 && fHard === 2 ? '✓ PASS' : '✗ FAIL'}`);

// Batch 25 (Second Year): 2 Easy + 8 Hard
const secondYearSet = generateRandomQuestionSet('25');
const sEasy = secondYearSet.filter(q => q.difficulty === 'easy').length;
const sHard = secondYearSet.filter(q => q.difficulty === 'hard').length;
console.log(`Second Year (Batch 25): ${secondYearSet.length} Total (${sEasy} Easy, ${sHard} Hard) -> ${secondYearSet.length === 10 && sEasy === 2 && sHard === 8 ? '✓ PASS' : '✗ FAIL'}`);

// Verify option order preservation
console.log('\n--- 4. Testing Option Order Integrity (A/B/C/D must NOT be shuffled) ---');
let optionIntegrityPassed = true;
firstYearSet.forEach(q => {
  const keys = Object.keys(q.options);
  if (keys.join(',') !== 'A,B,C,D') optionIntegrityPassed = false;
});
console.log(`Option keys order strictly preserved as A,B,C,D: ${optionIntegrityPassed ? '✓ PASS' : '✗ FAIL'}`);

// 5. Test Scoring Evaluation
console.log('\n--- 5. Testing Scoring & Evaluation Engine ---');
// Perfect score test
const perfectAnswers = {};
firstYearSet.forEach(q => {
  perfectAnswers[q.id] = q.correct_answer;
});
const perfectResult = evaluateManualAnswers(firstYearSet, perfectAnswers);
console.log(`Perfect 10/10 Score: ${perfectResult.score} / 100 (${perfectResult.correctCount} Correct) -> ${perfectResult.score === 100 && perfectResult.correctCount === 10 ? '✓ PASS' : '✗ FAIL'}`);

// 7/10 score test
const partialAnswers = {};
firstYearSet.forEach((q, i) => {
  if (i < 7) {
    partialAnswers[q.id] = q.correct_answer;
  } else {
    // Pick wrong answer
    partialAnswers[q.id] = q.correct_answer === 'A' ? 'B' : 'A';
  }
});
const partialResult = evaluateManualAnswers(firstYearSet, partialAnswers);
console.log(`Partial 7/10 Score: ${partialResult.score} / 100 (${partialResult.correctCount} Correct) -> ${partialResult.score === 70 && partialResult.correctCount === 7 ? '✓ PASS' : '✗ FAIL'}`);

console.log('\n====================================================');
console.log('ALL MANUAL CODING ENGINE TESTS EXECUTED SUCCESSFULLY!');
console.log('====================================================');
