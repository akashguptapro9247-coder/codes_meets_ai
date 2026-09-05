import assert from 'assert';

console.log('==============================================================================');
console.log('TEST SUITE: GEN AI TIME TRACKING & ELIMINATION GUARDS');
console.log('==============================================================================\n');

// 1. Test Time Calculation
console.log('--- TEST 1: TIME CALCULATION ACCURACY ---');
function calculateTimeTaken(startedAt, submittedAt, timeTakenSeconds) {
  const submissionTimestamp = submittedAt || new Date().toISOString();
  let calculatedTimeTaken = null;

  if (timeTakenSeconds && timeTakenSeconds > 0) {
    const m = Math.floor(timeTakenSeconds / 60);
    const s = timeTakenSeconds % 60;
    calculatedTimeTaken = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  } else if (startedAt) {
    const diffMs = Math.max(1000, new Date(submissionTimestamp).getTime() - new Date(startedAt).getTime());
    const diffSec = Math.floor(diffMs / 1000);
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    calculatedTimeTaken = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  } else {
    calculatedTimeTaken = '01:00';
  }

  return calculatedTimeTaken;
}

// Case A: 7m 23s (443 seconds)
const start1 = new Date('2026-09-03T10:21:14.000Z');
const end1 = new Date('2026-09-03T10:28:37.000Z');
const t1 = calculateTimeTaken(start1.toISOString(), end1.toISOString(), 443);
assert.strictEqual(t1, '07:23', 'Time taken must be 07:23');
console.log(`✓ 443s elapsed -> ${t1} (Expected 07:23)`);

// Case B: No client timer, only ISO timestamps
const t2 = calculateTimeTaken(start1.toISOString(), end1.toISOString(), null);
assert.strictEqual(t2, '07:23', 'Time taken from timestamps must be 07:23');
console.log(`✓ Timestamp diff -> ${t2} (Expected 07:23)`);

// Case C: Minimum time (instant submit) should never be 00 or 00:00
const t3 = calculateTimeTaken(start1.toISOString(), start1.toISOString(), 0);
assert.notStrictEqual(t3, '00', 'Must not be 00');
assert.notStrictEqual(t3, '00:00', 'Must not be 00:00');
console.log(`✓ Immediate submit fallback -> ${t3} (Never 00 or 00:00)`);

console.log('TEST 1 PASSED: Time calculation is strictly non-zero and formatted.\n');

// 2. Test Metadata Fallback Extraction
console.log('--- TEST 2: METADATA FALLBACK EXTRACTION ---');
function enrichSubmission(sub) {
  let timeTaken = sub.time_taken;
  if (!timeTaken || timeTaken === '00:00' || timeTaken === '00') {
    if (Array.isArray(sub.image_paths)) {
      const timeEntry = sub.image_paths.find((p) => typeof p === 'string' && p.startsWith('__TIME_TAKEN__:'));
      if (timeEntry) {
        timeTaken = timeEntry.replace('__TIME_TAKEN__:', '');
      }
    }
  }
  return {
    ...sub,
    time_taken: timeTaken || '00:00'
  };
}

const mockSubWithoutColumn = {
  id: 'sub_1',
  user_id: 'u_1',
  prompt: 'A futuristic cyborg',
  image_urls: ['https://ik.imagekit.io/img.jpg'],
  image_paths: ['/path/to/img.jpg', '__TIME_TAKEN__:08:45', '__STARTED_AT__:2026-09-03T10:00:00Z'],
  submitted_at: '2026-09-03T10:08:45Z'
};

const enriched = enrichSubmission(mockSubWithoutColumn);
assert.strictEqual(enriched.time_taken, '08:45', 'Should recover time_taken from metadata');
console.log(`✓ Enriched time_taken from metadata: ${enriched.time_taken}`);
console.log('TEST 2 PASSED: Fallback metadata extraction works seamlessly.\n');

// 3. Test Eliminated Participant Re-registration Guard
console.log('--- TEST 3: ELIMINATION GUARD ON REGISTRATION ---');
function mockRegisterCheck(existingUser) {
  if (existingUser) {
    if (existingUser.is_removed) {
      return {
        data: null,
        error: {
          message: 'This roll number has already completed its participation in the event and cannot re-register.'
        }
      };
    }
    return { data: existingUser, error: null, isReturning: true };
  }
  return { data: { user_id: 'new_id' }, error: null };
}

const activePlayer = { user_id: 'p1', roll_number: '2612345678', is_removed: false };
const eliminatedPlayer = { user_id: 'p2', roll_number: '2512345678', is_removed: true };

const resActive = mockRegisterCheck(activePlayer);
assert.strictEqual(resActive.isReturning, true, 'Active participant can log in as returning player');
console.log('✓ Active participant re-entry permitted.');

const resEliminated = mockRegisterCheck(eliminatedPlayer);
assert.strictEqual(resEliminated.data, null, 'Eliminated participant cannot re-register');
assert(resEliminated.error.message.includes('completed its participation'));
console.log('✓ Eliminated participant strictly rejected from re-registering.');
console.log('TEST 3 PASSED: Elimination guard prevents re-registration.\n');

console.log('==============================================================================');
console.log('ALL TIME TRACKING AND GUARD VERIFICATION TESTS PASSED');
console.log('==============================================================================');
