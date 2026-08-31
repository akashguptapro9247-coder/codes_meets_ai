// ==========================================================================
// CODE MEETS AI — LAYER 1 MANUAL: CLIENT-SAFE UTILITIES ONLY
// ==========================================================================
// SECURITY NOTE: Questions and correct answers are NO LONGER stored here.
// They live exclusively in the Supabase `layer_1_question_bank` table (server-side)
// and are served via RPC functions that never expose correct_answer to the client.
//
// This file retains ONLY:
//   - validateRollNumber() — for routing/batch detection on the client
// ==========================================================================

/**
 * Validates 10-character alphanumeric roll number and detects batch & year.
 * Returns { valid, error?, batch?, yearName?, easyCount?, hardCount?, totalQuestions? }
 *
 * Junior (Batch 26): 10 Easy + 5 Hard = 15 questions
 * Senior (Batch 25): 10 Hard + 5 Easy = 15 questions
 */
export function validateRollNumber(rollNumberRaw) {
  if (!rollNumberRaw) {
    return {
      valid: false,
      error: 'Roll number is required.'
    };
  }

  const rollNumber = String(rollNumberRaw).trim().toUpperCase();

  // 1. Check exact length of 10 characters
  if (rollNumber.length !== 10) {
    return {
      valid: false,
      error: `Invalid roll number length: must be exactly 10 characters (received ${rollNumber.length} characters).`
    };
  }

  // 2. Check alphanumeric character format
  if (!/^[A-Z0-9]{10}$/i.test(rollNumber)) {
    return {
      valid: false,
      error: 'Invalid roll number format: must contain only letters and numbers (no special characters or spaces).'
    };
  }

  // 3. Check first two characters (26 -> 1st Year, 25 -> 2nd Year)
  const prefix = rollNumber.substring(0, 2);

  if (prefix === '26') {
    return {
      valid: true,
      batch: '26',
      yearName: 'First Year',
      easyCount: 10,
      hardCount: 5,
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
  } else {
    return {
      valid: false,
      error: `Unsupported roll number batch: "${prefix}XXXXXXXX". Only roll numbers starting with 26 (1st Year) or 25 (2nd Year) are supported for this event.`
    };
  }
}
