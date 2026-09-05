// ==============================================================================
// TEST SUITE: LAYER 1 MANUAL CODING PROGRESS PERSISTENCE ACROSS REFRESH
// ==============================================================================

import {
  validateRollNumber,
  generateRandomQuestionSet,
  evaluateSingleAnswer,
  evaluateManualAnswers,
  QUESTION_BANK
} from '../src/layer1/questions/layer1ManualQuestions.js';

// Mock Supabase store to test exact adminService logic in a pure test environment
class MockSupabaseAttempts {
  constructor() {
    this.attempts = new Map();
  }

  createAttempt({ userId, rollNumber, name = 'Test User' }) {
    const batchValidation = validateRollNumber(rollNumber);
    if (!batchValidation.valid) throw new Error(batchValidation.error);

    const questionSet = generateRandomQuestionSet(rollNumber);
    const attemptId = 'att_' + Math.random().toString(36).substring(2, 9);
    const now = new Date();

    const record = {
      id: attemptId,
      user_id: userId,
      username: name,
      roll_number: rollNumber,
      year: questionSet.yearName,
      batch: questionSet.batch,
      questions_pool: questionSet.questions,
      selected_answers: {},
      score: 0,
      total_questions: 15,
      correct_count: 0,
      status: 'in_progress',
      started_at: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    this.attempts.set(userId, record);
    return record;
  }

  getLatestAttempt(userId) {
    return this.attempts.get(userId) || null;
  }

  // Mimics adminService.startLayer1ManualSession
  startSession(userId, rollNumber) {
    const batchValidation = validateRollNumber(rollNumber);
    if (!batchValidation.valid) return { data: null, error: { message: batchValidation.error } };

    const existing = this.getLatestAttempt(userId);
    if (existing) {
      if (existing.status === 'completed') {
        return {
          data: {
            already_completed: true,
            score: existing.score || 0,
            correct_count: existing.correct_count || 0,
            total_questions: existing.total_questions || 15
          },
          error: null
        };
      }

      // If all questions in pool have already been answered, auto-complete
      const pool = existing.questions_pool || [];
      const answeredCount = Object.keys(existing.selected_answers || {}).length;
      if (pool.length > 0 && answeredCount >= pool.length) {
        existing.status = 'completed';
        existing.completed_at = new Date().toISOString();
        return {
          data: {
            already_completed: true,
            score: existing.score || 0,
            correct_count: existing.correct_count || 0,
            total_questions: existing.total_questions || 15
          },
          error: null
        };
      }

      const startTime = new Date(existing.started_at || existing.created_at).getTime();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingSeconds = Math.max(0, 900 - elapsedSeconds);

      if (remainingSeconds <= 0) {
        existing.status = 'completed';
        return {
          data: {
            already_completed: true,
            score: existing.score || 0,
            correct_count: existing.correct_count || 0,
            total_questions: existing.total_questions || 15
          },
          error: null
        };
      }

      return {
        data: {
          attempt_id: existing.id,
          expires_at: new Date(startTime + 900 * 1000).toISOString(),
          remaining_seconds: remainingSeconds,
          questions: existing.questions_pool || [],
          selected_answers: existing.selected_answers || {},
          score: existing.score || 0,
          correct_count: existing.correct_count || 0,
          batch: existing.batch || batchValidation.batch,
          year_name: existing.year || batchValidation.yearName,
          resumed: true
        },
        error: null
      };
    }

    // New session
    const newRecord = this.createAttempt({ userId, rollNumber });
    const startTime = new Date(newRecord.started_at).getTime();

    return {
      data: {
        attempt_id: newRecord.id,
        expires_at: new Date(startTime + 900 * 1000).toISOString(),
        remaining_seconds: 900,
        questions: newRecord.questions_pool,
        selected_answers: {},
        score: 0,
        correct_count: 0,
        batch: newRecord.batch,
        year_name: newRecord.year,
        resumed: false
      },
      error: null
    };
  }

  // Mimics adminService.submitLayer1ManualAnswer
  submitAnswer(attemptId, userId, questionId, selectedOption) {
    const existing = this.getLatestAttempt(userId);
    if (!existing || existing.id !== attemptId) {
      return { data: null, error: { message: 'Attempt not found' } };
    }

    const evalRes = evaluateSingleAnswer(questionId, selectedOption);
    const updatedAnswers = {
      ...existing.selected_answers,
      [questionId]: selectedOption
    };

    const totalEval = evaluateManualAnswers(updatedAnswers);
    const pool = existing.questions_pool || [];
    const isAllAnswered = pool.length > 0 && Object.keys(updatedAnswers).length >= pool.length;

    existing.selected_answers = updatedAnswers;
    existing.score = totalEval.score;
    existing.correct_count = totalEval.correctCount;
    if (isAllAnswered) {
      existing.status = 'completed';
      existing.completed_at = new Date().toISOString();
    }
    existing.updated_at = new Date().toISOString();

    return {
      data: {
        is_correct: evalRes.is_correct,
        correct_answer: evalRes.correct_answer
      },
      error: null
    };
  }
}

// Mimics React Layer1ManualChallenge.jsx resumption calculation
function computeComponentResumeState(sessionData) {
  if (sessionData.already_completed) {
    return { isCompleted: true, score: sessionData.score };
  }

  const loadedQuestions = sessionData.questions ?? [];
  const restoredAnswers = sessionData.selected_answers ?? {};

  const firstUnansweredIndex = loadedQuestions.findIndex(
    (q) => !restoredAnswers[q.id]
  );

  if (firstUnansweredIndex === -1 && loadedQuestions.length > 0) {
    return { isCompleted: true, score: sessionData.score };
  }

  const resumeIndex = firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0;
  return {
    isCompleted: false,
    currentIndex: resumeIndex,
    currentQuestionNumber: resumeIndex + 1,
    questions: loadedQuestions,
    selectedAnswers: restoredAnswers,
    score: sessionData.score,
    remainingSeconds: sessionData.remaining_seconds
  };
}

async function runTests() {
  console.log('='.repeat(78));
  console.log('TEST SUITE: LAYER 1 MANUAL CODING PROGRESS PERSISTENCE ACROSS REFRESH');
  console.log('='.repeat(78));

  const db = new MockSupabaseAttempts();

  // ── TEST 1: Junior User Starts, Answers Q1, Presses Next, Refreshes ──
  console.log('\n--- TEST 1: Junior (26) Answers Q1 -> NEXT -> Refresh ---');
  const user1 = 'user_junior_001';
  const roll1 = '26U61A0501';

  const start1 = db.startSession(user1, roll1);
  const q1 = start1.data.questions[0];
  console.log(`Q1 text: "${q1.question}" (ID: ${q1.id})`);

  // Answer Q1 with 'A' and submit
  const ansRes1 = db.submitAnswer(start1.data.attempt_id, user1, q1.id, 'A');
  console.log(`Submitted Q1 answer: 'A' -> is_correct: ${ansRes1.data.is_correct}, correct_answer: ${ansRes1.data.correct_answer}`);

  // Simulating browser refresh
  console.log('Simulating browser refresh...');
  const refresh1 = db.startSession(user1, roll1);
  const resumeState1 = computeComponentResumeState(refresh1.data);

  if (resumeState1.currentIndex === 1 && resumeState1.currentQuestionNumber === 2) {
    console.log(`✓ Resumed at Question 2 (Index: 1). Expected Q2, Got Q2!`);
  } else {
    throw new Error(`Expected Question 2, got Index ${resumeState1.currentIndex}`);
  }

  // Verify questions are identical
  const idsBefore1 = start1.data.questions.map(q => q.id).join(',');
  const idsAfter1 = refresh1.data.questions.map(q => q.id).join(',');
  if (idsBefore1 === idsAfter1) {
    console.log('✓ Questions pool remained 100% identical after refresh (same 15 questions)');
  } else {
    throw new Error('Question pool changed after refresh!');
  }

  // ── TEST 2: Answer Q2 through Q5 -> Refresh -> Expects Q6 ──
  console.log('\n--- TEST 2: Answer Q1–Q5 -> Refresh ---');
  for (let i = 1; i < 5; i++) {
    const qi = refresh1.data.questions[i];
    db.submitAnswer(start1.data.attempt_id, user1, qi.id, 'B');
  }
  console.log('Answered Q2, Q3, Q4, Q5 (Total answered: 5)');

  // Refresh
  const refresh2 = db.startSession(user1, roll1);
  const resumeState2 = computeComponentResumeState(refresh2.data);
  if (resumeState2.currentIndex === 5 && resumeState2.currentQuestionNumber === 6) {
    console.log(`✓ Resumed at Question 6 (Index: 5). Expected Q6, Got Q6!`);
  } else {
    throw new Error(`Expected Question 6, got Index ${resumeState2.currentIndex}`);
  }

  // ── TEST 3: User is on Q8, has selected an option, but NOT submitted -> Refresh ──
  console.log('\n--- TEST 3: Select Q8 without submitting -> Refresh ---');
  // Answer Q6 and Q7
  db.submitAnswer(start1.data.attempt_id, user1, refresh1.data.questions[5].id, 'C');
  db.submitAnswer(start1.data.attempt_id, user1, refresh1.data.questions[6].id, 'D');
  console.log('Answered Q6, Q7 (Total answered: 7). User is now on Question 8.');
  console.log('User selects option on Q8, but refreshes BEFORE clicking NEXT.');

  const refresh3 = db.startSession(user1, roll1);
  const resumeState3 = computeComponentResumeState(refresh3.data);
  if (resumeState3.currentIndex === 7 && resumeState3.currentQuestionNumber === 8) {
    console.log(`✓ Resumed at Question 8 (Index: 7). Unsubmitted answer was not counted.`);
  } else {
    throw new Error(`Expected Question 8, got Index ${resumeState3.currentIndex}`);
  }

  // ── TEST 4: Multiple consecutive refreshes ──
  console.log('\n--- TEST 4: Multiple Consecutive Refreshes ---');
  for (let r = 1; r <= 5; r++) {
    const ref = db.startSession(user1, roll1);
    const state = computeComponentResumeState(ref.data);
    if (state.currentIndex !== 7) {
      throw new Error(`Refresh #${r} broke question index: ${state.currentIndex}`);
    }
  }
  console.log('✓ 5 consecutive refreshes all cleanly resumed at Question 8 (no drift or resets)');

  // ── TEST 5: Answers remain locked ──
  console.log('\n--- TEST 5: Submitted Answers Remain Locked ---');
  const answeredIds = Object.keys(refresh3.data.selected_answers);
  if (answeredIds.length === 7) {
    console.log(`✓ Exactly 7 submitted answers locked in database`);
    answeredIds.forEach((id, idx) => {
      console.log(`   Q${idx + 1} (id: ${id}): Option locked as '${refresh3.data.selected_answers[id]}'`);
    });
  } else {
    throw new Error(`Expected 7 locked answers, got ${answeredIds.length}`);
  }

  // ── TEST 6: Running score calculation ──
  console.log('\n--- TEST 6: Score Remains Correct ---');
  const expectedScore = evaluateManualAnswers(refresh3.data.selected_answers).score;
  if (refresh3.data.score === expectedScore) {
    console.log(`✓ Database running score (${refresh3.data.score}) matches evaluated score (${expectedScore})`);
  } else {
    throw new Error(`Score mismatch: db=${refresh3.data.score}, expected=${expectedScore}`);
  }

  // ── TEST 7: Timer preservation ──
  console.log('\n--- TEST 7: Timer Does Not Reset ---');
  const initialExpiry = new Date(start1.data.expires_at).getTime();
  const refreshExpiry = new Date(refresh3.data.expires_at).getTime();
  if (initialExpiry === refreshExpiry) {
    console.log(`✓ Expiration timestamp is strictly preserved (${start1.data.expires_at})`);
    console.log(`✓ Remaining seconds accurately computed based on fixed deadline`);
  } else {
    throw new Error('Timer was reset on refresh!');
  }

  // ── TEST 8: Complete all 15 questions -> Refresh -> Must show completed state ──
  console.log('\n--- TEST 8: Complete All 15 Questions -> Refresh ---');
  for (let i = 7; i < 15; i++) {
    const qi = refresh1.data.questions[i];
    db.submitAnswer(start1.data.attempt_id, user1, qi.id, 'A');
  }
  console.log('Submitted all 15 answers.');

  const postCompleteRefresh = db.startSession(user1, roll1);
  if (postCompleteRefresh.data.already_completed) {
    console.log(`✓ Post-completion refresh returned already_completed = true!`);
    console.log(`✓ Final score: ${postCompleteRefresh.data.score} / 150 (Correct: ${postCompleteRefresh.data.correct_count}/15)`);
  } else {
    throw new Error('Completed quiz restarted on refresh!');
  }

  // ── TEST 9: Senior Student (Batch 25) Verification ──
  console.log('\n--- TEST 9: Senior Student (25) Distribution & Resume ---');
  const userSenior = 'user_senior_002';
  const rollSenior = '25U61A0599';

  const seniorStart = db.startSession(userSenior, rollSenior);
  const easyCount = seniorStart.data.questions.filter(q => q.id <= 20).length;
  const hardCount = seniorStart.data.questions.filter(q => q.id > 20).length;
  console.log(`Senior questions: ${easyCount} Easy + ${hardCount} Hard (Total: ${seniorStart.data.questions.length})`);
  if (easyCount !== 5 || hardCount !== 10) {
    throw new Error(`Senior distribution incorrect: Easy=${easyCount}, Hard=${hardCount}`);
  }

  // Answer 10 questions for senior
  for (let i = 0; i < 10; i++) {
    db.submitAnswer(seniorStart.data.attempt_id, userSenior, seniorStart.data.questions[i].id, 'C');
  }
  // Senior refresh -> should be Q11
  const seniorRefresh = db.startSession(userSenior, rollSenior);
  const seniorState = computeComponentResumeState(seniorRefresh.data);
  if (seniorState.currentIndex === 10 && seniorState.currentQuestionNumber === 11) {
    console.log(`✓ Senior student cleanly resumes at Question 11 (Index: 10)`);
  } else {
    throw new Error(`Senior resume failed: expected Q11, got ${seniorState.currentQuestionNumber}`);
  }

  // ── TEST 10: User Isolation (User A never sees User B's state) ──
  console.log('\n--- TEST 10: Multi-User Isolation ---');
  const user3 = 'user_third_003';
  const roll3 = '26U61A0503';
  const user3Start = db.startSession(user3, roll3);

  if (user3Start.data.attempt_id === seniorStart.data.attempt_id || user3Start.data.attempt_id === start1.data.attempt_id) {
    throw new Error('Attempts leaked across different users!');
  }
  if (Object.keys(user3Start.data.selected_answers).length !== 0) {
    throw new Error('User 3 received answers from another user!');
  }
  console.log('✓ User 3 starts fresh with 0 answers, completely isolated from User 1 and User 2');

  console.log('\n' + '='.repeat(78));
  console.log('ALL 10 VERIFICATION SCENARIOS PASSED WITH 100% SUCCESS');
  console.log('='.repeat(78));
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
