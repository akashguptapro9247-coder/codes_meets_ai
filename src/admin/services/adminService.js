// ==========================================================================
// CODE MEETS AI - RESILIENT ADMIN DATABASE SERVICE (SUPABASE SOURCE OF TRUTH)
// ==========================================================================
// Handles all CRUD operations, error diagnostics, cascades, ImageKit metadata,
// Layer 1 GenAI submissions, manual verification scoring, and score sync.
// Layer 3 Combined = ((P1_L1_Avg + P1_L2_Avg) + (P2_L1_Avg + P2_L2_Avg)) / 2
// ==========================================================================

import { supabase, isSupabaseConfigured } from '../../shared/services/supabaseClient.js';
import { imagekitClient } from '../../shared/services/imagekitClient.js';
import {
  generateRandomQuestionSet,
  evaluateSingleAnswer,
  evaluateManualAnswers,
  validateRollNumber
} from '../../layer1/questions/layer1ManualQuestions.js';

export const adminService = {
  // ------------------------------------------------------------------------
  // 1. USERS CRUD
  // ------------------------------------------------------------------------
  async fetchUsers() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase is not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('serial_number', { ascending: true });

      if (error) {
        console.error('[Supabase::fetchUsers] Query error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchUsers] Exception:', err);
      return { data: [], error: err };
    }
  },

  async registerUser(userData) {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: null, error: { message: 'Supabase credentials not configured' } };
    }

    try {
      const rollNumber = (userData.rollNumber || userData.roll_number || '').trim().toUpperCase();

      // Enforce strict 10-character alphanumeric roll number starting with 25 or 26
      if (rollNumber.length !== 10) {
        return {
          data: null,
          error: {
            message: `Roll number must be exactly 10 characters (received ${rollNumber.length}).`
          }
        };
      }

      if (!rollNumber.startsWith('25') && !rollNumber.startsWith('26')) {
        return {
          data: null,
          error: {
            message: 'Roll number must start with 25 (Second Year) or 26 (First Year).'
          }
        };
      }

      if (!/^[A-Z0-9]{10}$/i.test(rollNumber)) {
        return {
          data: null,
          error: {
            message: 'Roll number must contain only letters and numbers (no special characters).'
          }
        };
      }

      const yearNumber = rollNumber.startsWith('26') ? 1 : rollNumber.startsWith('25') ? 2 : (parseInt(userData.year, 10) || 1);

      const payload = {
        name: userData.name.trim(),
        roll_number: rollNumber,
        branch: userData.branch,
        year: yearNumber,
        section: userData.section
      };

      // Check if player with this roll number already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('user_id, roll_number, name')
        .eq('roll_number', payload.roll_number)
        .maybeSingle();

      if (existingUser) {
        return {
          data: null,
          error: {
            code: '23505',
            message: 'Roll number is already registered. Please contact event admin if you believe this is an error.'
          }
        };
      }

      const { data, error } = await supabase
        .from('users')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          return {
            data: null,
            error: {
              code: '23505',
              message: 'Roll number is already registered.'
            }
          };
        }
        console.error('[Supabase::registerUser] Insert error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::registerUser] Exception:', err);
      return { data: null, error: err };
    }
  },

  async updateUser(userId, updateFields) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const rawRoll = (updateFields.roll_number || updateFields.rollNumber || '').trim().toUpperCase();
      const yearNumber = rawRoll.startsWith('26') ? 1 : rawRoll.startsWith('25') ? 2 : (parseInt(updateFields.year, 10) || 1);

      const payload = {
        name: updateFields.name.trim(),
        roll_number: rawRoll,
        branch: updateFields.branch,
        year: yearNumber,
        section: updateFields.section
      };

      const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('[Supabase::updateUser] Error updating user:', error);
        return { data: null, error };
      }

      // Propagate denormalized name update
      if (payload.name) {
        await Promise.allSettled([
          supabase.from('layer_1').update({ name: payload.name }).eq('user_id', userId),
          supabase.from('layer_2').update({ name: payload.name }).eq('user_id', userId),
          supabase.from('layer_1_genai_submissions').update({ username: payload.name }).eq('user_id', userId),
          supabase.from('duos').update({ player_1_name: payload.name }).eq('player_1_id', userId),
          supabase.from('duos').update({ player_2_name: payload.name }).eq('player_2_id', userId)
        ]);
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::updateUser] Exception:', err);
      return { data: null, error: err };
    }
  },

  async deleteUser(userId) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      // 1. Explicitly remove associated duo records to prevent foreign key constraint block
      await supabase.from('duos').delete().or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`);

      // 2. Fetch and remove associated layer_1_genai_submissions + ImageKit files
      try {
        const { data: subData } = await supabase
          .from('layer_1_genai_submissions')
          .select('image_file_ids')
          .eq('user_id', userId)
          .maybeSingle();

        if (subData?.image_file_ids && Array.isArray(subData.image_file_ids) && subData.image_file_ids.length > 0) {
          imagekitClient.deleteImages(subData.image_file_ids).catch((e) => console.warn('ImageKit delete warning:', e));
        }

        await supabase.from('layer_1_genai_submissions').delete().eq('user_id', userId);
      } catch (subErr) {
        console.warn('Submission cleanup notice:', subErr);
      }

      // 3. Explicitly remove associated layer_1, layer_2, and manual attempt records
      await supabase.from('layer_1_manual_attempts').delete().eq('user_id', userId);
      await supabase.from('layer_1').delete().eq('user_id', userId);
      await supabase.from('layer_2').delete().eq('user_id', userId);

      // 4. Delete user record
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('[Supabase::deleteUser] Error deleting user:', error);
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::deleteUser] Exception:', err);
      return { error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 2. LAYER 1 GENAI SUBMISSIONS & MANUAL MARKS VERIFICATION
  // ------------------------------------------------------------------------
  async fetchLayer1Submissions() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('layer_1_genai_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('[Supabase::fetchLayer1Submissions] Error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchLayer1Submissions] Exception:', err);
      return { data: [], error: err };
    }
  },

  async fetchLayer1SubmissionForUser(userId) {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('layer_1_genai_submissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase::fetchLayer1SubmissionForUser] Query warning:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Participant Submits GenAI Prompt & Image Assets (Single Submission Only)
   */
  async submitLayer1GenAi({ userId, username, rollNumber, prompt, imageItems, timeTaken, timeTakenSeconds }) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Database client not initialized' } };
    }

    if (!userId) {
      return { error: { message: 'Participant session identity missing. Please re-register.' } };
    }

    if (!prompt || !prompt.trim()) {
      return { error: { message: 'Please write a reconstruction prompt before submitting.' } };
    }

    try {
      // 1. Check if user already has an active submission (One submission only enforcement)
      const { data: existing } = await supabase
        .from('layer_1_genai_submissions')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        return {
          data: null,
          error: { message: 'You have already submitted your Layer 1 GenAI challenge. Duplicate submissions are not allowed.' }
        };
      }

      // 2. Upload new image files to ImageKit via secure backend
      let uploadedImages = [];
      if (imageItems && imageItems.length > 0) {
        try {
          uploadedImages = await imagekitClient.uploadMultipleImages(imageItems, userId);
        } catch (uploadErr) {
          console.error('[Supabase::submitLayer1GenAi] ImageKit upload error:', uploadErr);
          return { error: { message: `Image upload failed: ${uploadErr.message || 'Please check your connection.'}` } };
        }
      }

      const imageUrls = uploadedImages.map((img) => img.url).filter(Boolean);
      const imageFileIds = uploadedImages.map((img) => img.fileId).filter(Boolean);
      const imagePaths = uploadedImages.map((img) => img.filePath).filter(Boolean);

      // 3. Insert submission record in Supabase (enforced by UNIQUE constraint on user_id)
      const payload = {
        user_id: userId,
        username: username || 'Participant',
        roll_number: rollNumber || '',
        prompt: prompt.trim(),
        image_urls: imageUrls,
        image_file_ids: imageFileIds,
        image_paths: imagePaths,
        time_taken: timeTaken || '00:00',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let { data, error } = await supabase
        .from('layer_1_genai_submissions')
        .insert([payload])
        .select()
        .single();

      // Graceful fallback if time_taken column does not exist yet on remote table
      if (error && (error.code === '42703' || error.message?.includes('time_taken'))) {
        const fallbackPayload = { ...payload };
        delete fallbackPayload.time_taken;
        const fallbackRes = await supabase
          .from('layer_1_genai_submissions')
          .insert([fallbackPayload])
          .select()
          .single();
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
          return {
            data: null,
            error: { message: 'You have already submitted your Layer 1 GenAI challenge.' }
          };
        }
        console.error('[Supabase::submitLayer1GenAi] Error saving submission:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::submitLayer1GenAi] Exception:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Admin Deletes a GenAI Submission (Participant can now submit again)
   */
  async deleteLayer1GenAiSubmission(submissionId, userId) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      // 1. Fetch submission to get image file IDs for ImageKit cleanup
      let query = supabase.from('layer_1_genai_submissions').select('*');
      if (submissionId) {
        query = query.eq('id', submissionId);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else {
        return { error: { message: 'Submission ID or User ID required' } };
      }

      const { data: subData } = await query.maybeSingle();

      if (subData?.image_file_ids && Array.isArray(subData.image_file_ids) && subData.image_file_ids.length > 0) {
        imagekitClient.deleteImages(subData.image_file_ids).catch((e) => console.warn('ImageKit delete warning:', e));
      }

      // 2. Delete the submission record from Supabase
      let delQuery = supabase.from('layer_1_genai_submissions').delete();
      if (submissionId) {
        delQuery = delQuery.eq('id', submissionId);
      } else {
        delQuery = delQuery.eq('user_id', userId);
      }
      const { error: delError } = await delQuery;

      if (delError) {
        console.error('[Supabase::deleteLayer1GenAiSubmission] Error deleting submission:', delError);
        return { error: delError };
      }

      // 3. Reset GenAI marks in layer_1 table (and keep manual marks intact)
      const targetUserId = userId || subData?.user_id;
      if (targetUserId) {
        const { data: l1Record } = await supabase
          .from('layer_1')
          .select('layer_1_manual_marks, name')
          .eq('user_id', targetUserId)
          .maybeSingle();

        const currentManual = parseFloat(l1Record?.layer_1_manual_marks) || 0;
        const userName = l1Record?.name || subData?.username || '';
        await this.updateLayer1Marks(targetUserId, 0, currentManual, userName);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('[Supabase::deleteLayer1GenAiSubmission] Exception:', err);
      return { error: err };
    }
  },

  /**
   * Admin Evaluates & Saves GenAI Marks for a Submission
   */
  async updateLayer1SubmissionMarks(submissionId, userId, marks, name = '') {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const numericMarks = Math.max(0, parseFloat(marks) || 0);

      // 1. Update layer_1_genai_submissions record
      const { data: subData, error: subError } = await supabase
        .from('layer_1_genai_submissions')
        .update({
          marks: numericMarks,
          status: 'reviewed',
          marked_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

      if (subError) {
        console.error('[Supabase::updateLayer1SubmissionMarks] Error:', subError);
        return { error: subError };
      }

      // 2. Fetch current manual marks from layer_1 table (if already entered)
      const { data: l1Record } = await supabase
        .from('layer_1')
        .select('layer_1_manual_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const manualMarks = parseFloat(l1Record?.layer_1_manual_marks) || 0;
      const userName = name || l1Record?.name || subData?.username || '';

      // 3. Update layer_1 table with the new GenAI marks, triggering average and user sync
      await this.updateLayer1Marks(userId, numericMarks, manualMarks, userName);

      return { data: subData, error: null };
    } catch (err) {
      console.error('[Supabase::updateLayer1SubmissionMarks] Exception:', err);
      return { error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 3. LAYER 1 MANUAL CODING ATTEMPTS & AUTO-SCORING
  // ------------------------------------------------------------------------
  async fetchLayer1ManualAttempts() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('layer_1_manual_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('[Supabase::fetchLayer1ManualAttempts] Error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchLayer1ManualAttempts] Exception:', err);
      return { data: [], error: err };
    }
  },

  async fetchLayer1ManualAttemptForUser(userId) {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      return { data: null, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('layer_1_manual_attempts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Supabase::fetchLayer1ManualAttemptForUser] Query warning:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECURE RPC: Layer 1 Manual — server-side session, answer checking, scoring
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start (or resume) a Layer 1 Manual session.
   * Server selects questions, starts 15-min timer, returns safe questions (no correct_answer).
   * @returns {{ attempt_id, expires_at, remaining_seconds, questions, batch, year_name, already_completed?, resumed? }}
   */
  async startLayer1ManualSession(userId, rollNumber) {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    if (!userId || !rollNumber) {
      return { data: null, error: { message: 'userId and rollNumber are required.' } };
    }

    try {
      // 1. Try RPC first if configured in Supabase
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_start_layer1_manual_session', {
        p_user_id:    userId,
        p_roll_number: rollNumber
      });

      if (!rpcError && rpcData && !rpcData.error) {
        return { data: rpcData, error: null };
      }

      // 2. Direct Table Fallback (Resilient Supabase Architecture)
      const batchValidation = validateRollNumber(rollNumber);
      if (!batchValidation.valid) {
        return { data: null, error: { message: batchValidation.error } };
      }

      // Check if attempt already exists in layer_1_manual_attempts
      const { data: existingAttempts, error: fetchErr } = await supabase
        .from('layer_1_manual_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!fetchErr && existingAttempts && existingAttempts.length > 0) {
        const attempt = existingAttempts[0];

        // If completed: return completed state
        if (attempt.status === 'completed') {
          return {
            data: {
              already_completed: true,
              score:          attempt.score || 0,
              correct_count:  attempt.correct_count || 0,
              total_questions: attempt.total_questions || 15
            },
            error: null
          };
        }

        // If in_progress: compute remaining seconds
        const startTime = new Date(attempt.started_at || attempt.created_at).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const remainingSeconds = Math.max(0, 900 - elapsedSeconds);

        if (remainingSeconds <= 0) {
          // Timer expired while away: auto-complete
          return this.completeLayer1ManualSession(attempt.id, userId);
        }

        return {
          data: {
            attempt_id:        attempt.id,
            expires_at:        new Date(startTime + 900 * 1000).toISOString(),
            remaining_seconds: remainingSeconds,
            questions:         attempt.questions_pool || [],
            batch:             attempt.batch || batchValidation.batch,
            year_name:         attempt.year || batchValidation.yearName,
            resumed:           true
          },
          error: null
        };
      }

      // 3. Create fresh new attempt
      const questionSet = generateRandomQuestionSet(rollNumber);
      if (!questionSet.valid) {
        return { data: null, error: { message: questionSet.error } };
      }

      // Get user's name
      const { data: userRec } = await supabase
        .from('users')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle();

      const expiresAt = new Date(Date.now() + 900 * 1000).toISOString();

      const newAttemptPayload = {
        user_id:          userId,
        username:         userRec?.name || 'Participant',
        roll_number:      rollNumber,
        year:             questionSet.yearName,
        batch:            questionSet.batch,
        questions_pool:   questionSet.questions,
        selected_answers: {},
        score:            0,
        total_questions:  15,
        correct_count:    0,
        status:           'in_progress',
        started_at:       new Date().toISOString()
      };

      const { data: createdAttempt, error: insertErr } = await supabase
        .from('layer_1_manual_attempts')
        .insert(newAttemptPayload)
        .select('*')
        .single();

      if (insertErr) {
        console.error('[Supabase::startLayer1ManualSession] Insert error:', insertErr);
        return { data: null, error: insertErr };
      }

      return {
        data: {
          attempt_id:        createdAttempt.id,
          expires_at:        expiresAt,
          remaining_seconds: 900,
          questions:         questionSet.questions,
          batch:             questionSet.batch,
          year_name:         questionSet.yearName
        },
        error: null
      };
    } catch (err) {
      console.error('[Supabase::startLayer1ManualSession] Exception:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Submit a single answer for a question. Server validates timer and computes correctness.
   * @returns {{ is_correct: boolean, correct_answer: 'A'|'B'|'C'|'D' }}
   */
  async submitLayer1ManualAnswer(attemptId, userId, questionId, selectedOption) {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    try {
      // 1. Try RPC first if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_submit_layer1_manual_answer', {
        p_attempt_id:      attemptId,
        p_user_id:         userId,
        p_question_id:     questionId,
        p_selected_option: selectedOption
      });

      if (!rpcError && rpcData && !rpcData.error) {
        return { data: rpcData, error: null };
      }

      // 2. Direct Table Fallback
      const evalRes = evaluateSingleAnswer(questionId, selectedOption);

      if (attemptId) {
        // Fetch current selected_answers
        const { data: attempt } = await supabase
          .from('layer_1_manual_attempts')
          .select('selected_answers')
          .eq('id', attemptId)
          .maybeSingle();

        const updatedAnswers = {
          ...(attempt?.selected_answers || {}),
          [questionId]: selectedOption
        };

        await supabase
          .from('layer_1_manual_attempts')
          .update({
            selected_answers: updatedAnswers,
            updated_at: new Date().toISOString()
          })
          .eq('id', attemptId);
      }

      return {
        data: {
          is_correct:     evalRes.is_correct,
          correct_answer: evalRes.correct_answer
        },
        error: null
      };
    } catch (err) {
      console.error('[Supabase::submitLayer1ManualAnswer] Exception:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Finalize the session. Recalculates authoritative score and syncs to layer_1 & users table.
   * @returns {{ score, correct_count, total_questions, max_score, accuracy }}
   */
  async completeLayer1ManualSession(attemptId, userId) {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }
    try {
      // 1. Try RPC first if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_complete_layer1_manual_session', {
        p_attempt_id: attemptId,
        p_user_id:    userId
      });

      if (!rpcError && rpcData && !rpcData.error) {
        return { data: rpcData, error: null };
      }

      // 2. Direct Table Fallback
      let attemptQuery = supabase.from('layer_1_manual_attempts').select('*');
      if (attemptId) {
        attemptQuery = attemptQuery.eq('id', attemptId);
      } else if (userId) {
        attemptQuery = attemptQuery.eq('user_id', userId).order('created_at', { ascending: false }).limit(1);
      }

      const { data: attemptRows, error: attErr } = await attemptQuery;
      const attempt = attemptRows && attemptRows.length > 0 ? (attemptRows[0] || attemptRows) : null;

      if (!attempt) {
        return {
          data: { score: 0, correct_count: 0, total_questions: 15, max_score: 150, accuracy: 0 },
          error: null
        };
      }

      const evalRes = evaluateManualAnswers(attempt.selected_answers || {});

      // 1. Update layer_1_manual_attempts
      await supabase
        .from('layer_1_manual_attempts')
        .update({
          score:          evalRes.score,
          correct_count:  evalRes.correctCount,
          total_questions: 15,
          status:         'completed',
          completed_at:   new Date().toISOString(),
          updated_at:     new Date().toISOString()
        })
        .eq('id', attempt.id);

      // 2. Sync to layer_1 table
      const { data: existingL1 } = await supabase
        .from('layer_1')
        .select('*')
        .eq('user_id', attempt.user_id)
        .maybeSingle();

      const genAiMarks = existingL1?.layer_1_gen_ai_marks !== undefined && existingL1?.layer_1_gen_ai_marks !== null
        ? parseFloat(existingL1.layer_1_gen_ai_marks)
        : 0;

      const newAverage = parseFloat(((genAiMarks + evalRes.score) / 2.0).toFixed(2));

      if (existingL1) {
        await supabase
          .from('layer_1')
          .update({
            layer_1_manual_marks: evalRes.score,
            average_marks:        newAverage,
            updated_at:           new Date().toISOString()
          })
          .eq('user_id', attempt.user_id);
      } else {
        await supabase
          .from('layer_1')
          .insert({
            user_id:              attempt.user_id,
            name:                 attempt.username || 'Participant',
            layer_1_gen_ai_marks: 0,
            layer_1_manual_marks: evalRes.score,
            average_marks:        newAverage,
            created_at:           new Date().toISOString(),
            updated_at:           new Date().toISOString()
          });
      }

      // 3. Sync to users table average_layer_1
      await supabase
        .from('users')
        .update({
          average_layer_1: newAverage,
          updated_at:      new Date().toISOString()
        })
        .eq('user_id', attempt.user_id);

      return {
        data: {
          score:           evalRes.score,
          correct_count:   evalRes.correctCount,
          total_questions: 15,
          max_score:       150,
          accuracy:        evalRes.accuracy
        },
        error: null
      };
    } catch (err) {
      console.error('[Supabase::completeLayer1ManualSession] Exception:', err);
      return { data: null, error: err };
    }
  },

  /**
   * Submits finished Manual Coding attempt and updates Layer 1 score.
   * @deprecated — kept for admin override and legacy fallback only.
   *              Student flow now uses startLayer1ManualSession / submitLayer1ManualAnswer /
   *              completeLayer1ManualSession RPC calls above.
   */
  async submitLayer1ManualAttempt({
    userId,
    username,
    rollNumber,
    year,
    batch,
    questionsPool,
    selectedAnswers,
    score,
    correctCount
  }) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    if (!userId) {
      return { error: { message: 'Participant session identity missing.' } };
    }

    try {
      const numericScore = Math.max(0, Math.min(150, parseFloat(score) || 0));

      const payload = {
        user_id: userId,
        username: username || 'Participant',
        roll_number: rollNumber || '',
        year: year || '',
        batch: batch || '',
        questions_pool: questionsPool || [],
        selected_answers: selectedAnswers || {},
        score: numericScore,
        total_questions: 15,
        correct_count: correctCount || 0,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Upsert attempt into layer_1_manual_attempts
      const { data: attemptData, error: attemptError } = await supabase
        .from('layer_1_manual_attempts')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (attemptError) {
        console.error('[Supabase::submitLayer1ManualAttempt] Error saving attempt:', attemptError);
        return { error: attemptError };
      }

      // 2. Fetch current GenAI marks from layer_1 table (if exists)
      const { data: l1Record } = await supabase
        .from('layer_1')
        .select('layer_1_gen_ai_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const genAiMarks = parseFloat(l1Record?.layer_1_gen_ai_marks) || 0;
      const userName = username || l1Record?.name || '';

      // 3. Update layer_1 table with the new Manual marks (auto recalculates average)
      await this.updateLayer1Marks(userId, genAiMarks, numericScore, userName);

      return { data: attemptData, error: null };
    } catch (err) {
      console.error('[Supabase::submitLayer1ManualAttempt] Exception:', err);
      return { error: err };
    }
  },

  /**
   * Admin Manual Override of Layer 1 Manual Marks
   */
  async updateLayer1ManualOverrideMarks(attemptId, userId, newMarks, name = '') {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const numericMarks = Math.max(0, Math.min(150, parseFloat(newMarks) || 0));

      // 1. Update attempt table if record exists
      if (attemptId) {
        await supabase
          .from('layer_1_manual_attempts')
          .update({
            score: numericMarks,
            updated_at: new Date().toISOString()
          })
          .eq('id', attemptId);
      }

      // 2. Fetch current GenAI marks
      const { data: l1Record } = await supabase
        .from('layer_1')
        .select('layer_1_gen_ai_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const genAiMarks = parseFloat(l1Record?.layer_1_gen_ai_marks) || 0;
      const userName = name || l1Record?.name || '';

      // 3. Update layer_1 table with the new Manual marks, triggering auto-sync
      await this.updateLayer1Marks(userId, genAiMarks, numericMarks, userName);

      return { error: null };
    } catch (err) {
      console.error('[Supabase::updateLayer1ManualOverrideMarks] Exception:', err);
      return { error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 4. LAYER 1 CRUD & AUTOMATIC CASCADE TO DUOS
  // ------------------------------------------------------------------------
  async fetchLayer1Results() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('layer_1')
        .select('*')
        .order('average_marks', { ascending: false });

      if (error) {
        console.error('[Supabase::fetchLayer1Results] Error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchLayer1Results] Exception:', err);
      return { data: [], error: err };
    }
  },

  async updateLayer1Marks(userId, genAiMarks, manualMarks, name = '') {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const genAi = Math.max(0, parseFloat(genAiMarks) || 0);
      const manual = Math.max(0, parseFloat(manualMarks) || 0);
      const average = parseFloat(((genAi + manual) / 2.0).toFixed(2));

      // 1. Upsert into layer_1
      const { data, error } = await supabase
        .from('layer_1')
        .upsert(
          {
            user_id: userId,
            name: name || undefined,
            layer_1_gen_ai_marks: genAi,
            layer_1_manual_marks: manual,
            average_marks: average
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[Supabase::updateLayer1Marks] Error:', error);
        return { data: null, error };
      }

      // 2. Sync average_layer_1 in users table
      const { data: userRow } = await supabase.from('users').select('average_layer_2').eq('user_id', userId).single();
      const avgL2 = parseFloat(userRow?.average_layer_2) || 0;
      const totalScore = parseFloat((average + avgL2).toFixed(2));

      await supabase
        .from('users')
        .update({
          average_layer_1: average,
          total_score: totalScore,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // 3. Cascade recalculate Layer 3 Combined Marks in all duos with this user
      await this.syncDuoScoresForUser(userId);

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::updateLayer1Marks] Exception:', err);
      return { data: null, error: err };
    }
  },

  async deleteLayer1Result(id) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data: existing } = await supabase.from('layer_1').select('user_id').eq('id', id).single();

      const { data, error } = await supabase
        .from('layer_1')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('[Supabase::deleteLayer1Result] Error:', error);
        return { error };
      }

      if (existing?.user_id) {
        const { data: u } = await supabase.from('users').select('average_layer_2').eq('user_id', existing.user_id).single();
        const avgL2 = parseFloat(u?.average_layer_2) || 0;
        await supabase.from('users').update({
          average_layer_1: 0,
          total_score: avgL2,
          updated_at: new Date().toISOString()
        }).eq('user_id', existing.user_id);

        await this.syncDuoScoresForUser(existing.user_id);
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::deleteLayer1Result] Exception:', err);
      return { error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 4. LAYER 2 CRUD & AUTOMATIC CASCADE TO DUOS
  // ------------------------------------------------------------------------
  async fetchLayer2Results() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('layer_2')
        .select('*')
        .order('average_marks', { ascending: false });

      if (error) {
        console.error('[Supabase::fetchLayer2Results] Error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchLayer2Results] Exception:', err);
      return { data: [], error: err };
    }
  },

  async updateLayer2Marks(userId, genAiMarks, manualMarks, name = '') {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const genAi = Math.max(0, parseFloat(genAiMarks) || 0);
      const manual = Math.max(0, parseFloat(manualMarks) || 0);
      const average = parseFloat(((genAi + manual) / 2.0).toFixed(2));

      // 1. Upsert into layer_2
      const { data, error } = await supabase
        .from('layer_2')
        .upsert(
          {
            user_id: userId,
            name: name || undefined,
            layer_2_gen_ai_marks: genAi,
            layer_2_manual_marks: manual,
            average_marks: average
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[Supabase::updateLayer2Marks] Error:', error);
        return { data: null, error };
      }

      // 2. Sync average_layer_2 in users table
      const { data: userRow } = await supabase.from('users').select('average_layer_1').eq('user_id', userId).single();
      const avgL1 = parseFloat(userRow?.average_layer_1) || 0;
      const totalScore = parseFloat((avgL1 + average).toFixed(2));

      await supabase
        .from('users')
        .update({
          average_layer_2: average,
          total_score: totalScore,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // 3. Cascade recalculate Layer 3 Combined Marks in all duos with this user
      await this.syncDuoScoresForUser(userId);

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::updateLayer2Marks] Exception:', err);
      return { data: null, error: err };
    }
  },

  async deleteLayer2Result(id) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data: existing } = await supabase.from('layer_2').select('user_id').eq('id', id).single();

      const { data, error } = await supabase
        .from('layer_2')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('[Supabase::deleteLayer2Result] Error:', error);
        return { error };
      }

      if (existing?.user_id) {
        const { data: u } = await supabase.from('users').select('average_layer_1').eq('user_id', existing.user_id).single();
        const avgL1 = parseFloat(u?.average_layer_1) || 0;
        await supabase.from('users').update({
          average_layer_2: 0,
          total_score: avgL1,
          updated_at: new Date().toISOString()
        }).eq('user_id', existing.user_id);

        await this.syncDuoScoresForUser(existing.user_id);
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::deleteLayer2Result] Exception:', err);
      return { error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 5. DUO MANAGEMENT (LAYER 3 COMBINED & SCORING)
  // Layer 3 Combined = ((P1_L1_Avg + P1_L2_Avg) + (P2_L1_Avg + P2_L2_Avg)) / 2
  // ------------------------------------------------------------------------
  async syncDuoScoresForUser(userId) {
    try {
      const { data: userDuos } = await supabase
        .from('duos')
        .select('*')
        .or(`player_1_id.eq.${userId},player_2_id.eq.${userId}`);

      if (!userDuos || userDuos.length === 0) return;

      for (const duo of userDuos) {
        const { data: p1 } = await supabase.from('users').select('average_layer_1, average_layer_2').eq('user_id', duo.player_1_id).single();
        const { data: p2 } = await supabase.from('users').select('average_layer_1, average_layer_2').eq('user_id', duo.player_2_id).single();

        const p1Combined = (parseFloat(p1?.average_layer_1) || 0) + (parseFloat(p1?.average_layer_2) || 0);
        const p2Combined = (parseFloat(p2?.average_layer_1) || 0) + (parseFloat(p2?.average_layer_2) || 0);
        const layer3Combined = parseFloat(((p1Combined + p2Combined) / 2.0).toFixed(2));

        const l3 = duo.layer_3_marks !== null ? parseFloat(duo.layer_3_marks) : 0;
        const l4 = duo.layer_4_marks !== null ? parseFloat(duo.layer_4_marks) : 0;
        const totalMarks = parseFloat((layer3Combined + l3 + l4).toFixed(2));

        await supabase
          .from('duos')
          .update({
            combined_layer_1_average: layer3Combined,
            total_marks: totalMarks,
            updated_at: new Date().toISOString()
          })
          .eq('duo_id', duo.duo_id);
      }
    } catch (e) {
      console.warn('[Supabase::syncDuoScoresForUser] Sync warning:', e);
    }
  },

  async fetchDuos() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: [], error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('duos')
        .select('*')
        .order('total_marks', { ascending: false });

      if (error) {
        console.error('[Supabase::fetchDuos] Error:', error);
        return { data: [], error };
      }
      return { data: data || [], error: null };
    } catch (err) {
      console.error('[Supabase::fetchDuos] Exception:', err);
      return { data: [], error: err };
    }
  },

  async createDuo(player1Id, player2Id) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    if (!player1Id || !player2Id) {
      return { error: { message: 'Both Player 1 and Player 2 are required.' } };
    }

    if (player1Id === player2Id) {
      return { error: { message: 'A player cannot be paired with themselves.' } };
    }

    try {
      // Check if this pair already exists (either order)
      const { data: exactPairExists } = await supabase
        .from('duos')
        .select('duo_id')
        .or(
          `and(player_1_id.eq.${player1Id},player_2_id.eq.${player2Id}),and(player_1_id.eq.${player2Id},player_2_id.eq.${player1Id})`
        )
        .maybeSingle();

      if (exactPairExists) {
        return { error: { message: 'These two players are already paired as a Duo.' } };
      }

      // Check if Player 1 is already in ANY existing duo
      const { data: p1AlreadyPaired } = await supabase
        .from('duos')
        .select('duo_id, player_1_name, player_2_name')
        .or(`player_1_id.eq.${player1Id},player_2_id.eq.${player1Id}`)
        .maybeSingle();

      if (p1AlreadyPaired) {
        return { error: { message: `Player 1 is already paired in an existing Duo. Delete that Duo first to make them available again.` } };
      }

      // Check if Player 2 is already in ANY existing duo
      const { data: p2AlreadyPaired } = await supabase
        .from('duos')
        .select('duo_id, player_1_name, player_2_name')
        .or(`player_1_id.eq.${player2Id},player_2_id.eq.${player2Id}`)
        .maybeSingle();

      if (p2AlreadyPaired) {
        return { error: { message: `Player 2 is already paired in an existing Duo. Delete that Duo first to make them available again.` } };
      }

      // Fetch both users to get names + current Layer 1 & Layer 2 averages
      const { data: p1 } = await supabase.from('users').select('*').eq('user_id', player1Id).single();
      const { data: p2 } = await supabase.from('users').select('*').eq('user_id', player2Id).single();

      if (!p1 || !p2) {
        return { error: { message: 'Could not fetch player data. Please try again.' } };
      }

      // Layer 3 Combined = ((P1_L1_Avg + P1_L2_Avg) + (P2_L1_Avg + P2_L2_Avg)) / 2
      const p1Combined = (parseFloat(p1.average_layer_1) || 0) + (parseFloat(p1.average_layer_2) || 0);
      const p2Combined = (parseFloat(p2.average_layer_1) || 0) + (parseFloat(p2.average_layer_2) || 0);
      const layer3Combined = parseFloat(((p1Combined + p2Combined) / 2.0).toFixed(2));

      const { data, error } = await supabase
        .from('duos')
        .insert([
          {
            player_1_id: player1Id,
            player_2_id: player2Id,
            player_1_name: p1.name || 'Player 1',
            player_2_name: p2.name || 'Player 2',
            combined_layer_1_average: layer3Combined,
            layer_3_marks: null,
            layer_4_marks: null,
            total_marks: layer3Combined
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('[Supabase::createDuo] Insert error:', error);
        if (error.code === '23514') {
          return { data: null, error: { message: `Database constraint error: the combined score value is out of the allowed range. Please run the latest fix_rls_policies.sql in Supabase to remove the old 0–10 cap constraint.` } };
        }
        if (error.code === '23505') {
          return { data: null, error: { message: 'These two players are already paired as a Duo.' } };
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::createDuo] Exception:', err);
      return { data: null, error: err };
    }
  },

  async updateDuoMarks(duoId, { layer_3_marks, layer_4_marks }) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data: currentDuo, error: fetchErr } = await supabase
        .from('duos')
        .select('*')
        .eq('duo_id', duoId)
        .single();

      if (fetchErr || !currentDuo) {
        return { error: { message: 'Duo record not found' } };
      }

      // Re-fetch both players' latest Layer 1 and Layer 2 averages for 100% precision
      const { data: p1 } = await supabase.from('users').select('average_layer_1, average_layer_2').eq('user_id', currentDuo.player_1_id).single();
      const { data: p2 } = await supabase.from('users').select('average_layer_1, average_layer_2').eq('user_id', currentDuo.player_2_id).single();

      const p1Combined = (parseFloat(p1?.average_layer_1) || 0) + (parseFloat(p1?.average_layer_2) || 0);
      const p2Combined = (parseFloat(p2?.average_layer_1) || 0) + (parseFloat(p2?.average_layer_2) || 0);
      const layer3Combined = parseFloat(((p1Combined + p2Combined) / 2.0).toFixed(2));

      const updatePayload = {
        combined_layer_1_average: layer3Combined
      };

      let l3 = currentDuo.layer_3_marks !== null ? parseFloat(currentDuo.layer_3_marks) : 0;
      let l4 = currentDuo.layer_4_marks !== null ? parseFloat(currentDuo.layer_4_marks) : 0;

      if (layer_3_marks !== undefined && layer_3_marks !== null && layer_3_marks !== '') {
        l3 = parseFloat(layer_3_marks);
        if (l3 < 0 || l3 > 10) return { error: { message: 'Layer 3 marks must be between 0.0 and 10.0' } };
        updatePayload.layer_3_marks = l3;
      }

      if (layer_4_marks !== undefined && layer_4_marks !== null && layer_4_marks !== '') {
        l4 = parseFloat(layer_4_marks);
        if (l4 < 0 || l4 > 10) return { error: { message: 'Layer 4 marks must be between 0.0 and 10.0' } };
        updatePayload.layer_4_marks = l4;
      }

      updatePayload.total_marks = parseFloat((layer3Combined + l3 + l4).toFixed(2));

      const { data, error } = await supabase
        .from('duos')
        .update(updatePayload)
        .eq('duo_id', duoId)
        .select()
        .single();

      if (error) {
        console.error('[Supabase::updateDuoMarks] Error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::updateDuoMarks] Exception:', err);
      return { data: null, error: err };
    }
  },

  async deleteDuo(duoId) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('duos')
        .delete()
        .eq('duo_id', duoId)
        .select();

      if (error) {
        console.error('[Supabase::deleteDuo] Error:', error);
        return { error };
      }
      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::deleteDuo] Exception:', err);
      return { data: null, error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 6. EVENT SETTINGS (LOCKS & TRACK ACTIVATIONS)
  // ------------------------------------------------------------------------
  async fetchEventSettings() {
    if (!isSupabaseConfigured() || !supabase) {
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.error('[Supabase::fetchEventSettings] Error:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::fetchEventSettings] Exception:', err);
      return { data: null, error: err };
    }
  },

  async updateEventSettings(newSettings) {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase
        .from('event_settings')
        .upsert(
          {
            id: 1,
            ...newSettings,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (error) {
        console.error('[Supabase::updateEventSettings] Error:', error);
        return { data: null, error };
      }
      return { data, error: null };
    } catch (err) {
      console.error('[Supabase::updateEventSettings] Exception:', err);
      return { data: null, error: err };
    }
  },

  // ------------------------------------------------------------------------
  // 7. REALTIME SUBSCRIPTION
  // ------------------------------------------------------------------------
  subscribeToChanges(table, onPayload) {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    try {
      const channelId = `realtime_${table}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            onPayload(payload);
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // Channel removal notice
        }
      };
    } catch (err) {
      console.warn('[Supabase::subscribeToChanges] Subscription error:', err);
      return () => {};
    }
  },

  // ------------------------------------------------------------------------
  // LAYER 2 MANUAL ATTEMPTS
  // ------------------------------------------------------------------------
  
  async fetchLayer2ManualAttemptForUser(userId) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: null };
    try {
      const { data, error } = await supabase
        .from('layer_2_manual_attempts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async fetchAllLayer2ManualAttempts() {
    if (!isSupabaseConfigured() || !supabase) return { data: [], error: null };
    try {
      const { data, error } = await supabase
        .from('layer_2_manual_attempts')
        .select('*')
        .order('final_marks', { ascending: false });
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  },

  async submitLayer2ManualAttempt(payload) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      const dbPayload = {
        user_id: payload.userId,
        username: payload.username,
        roll_number: payload.rollNumber,
        year: payload.year,
        language: payload.language,
        questions_pool: payload.questionsPool || [],
        question_states: payload.questionStates || {},
        automatic_marks: payload.automaticMarks || 0,
        status: payload.status || 'in_progress',
        completed_at: payload.status === 'completed' ? new Date().toISOString() : null
      };

      const { data, error } = await supabase
        .from('layer_2_manual_attempts')
        .upsert(dbPayload, { onConflict: 'user_id' })
        .select()
        .single();
      
      if (error) return { data: null, error };

      // Cascade to layer_2 and users table if completed
      if (payload.status === 'completed') {
        const { data: l2Record } = await supabase
          .from('layer_2')
          .select('layer_2_gen_ai_marks, name')
          .eq('user_id', payload.userId)
          .maybeSingle();

        const genAiMarks = parseFloat(l2Record?.layer_2_gen_ai_marks) || 0;
        const userName = payload.username || l2Record?.name || '';

        await this.updateLayer2Marks(payload.userId, genAiMarks, payload.automaticMarks, userName);
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },
  
  async overrideLayer2ManualScore(userId, newScore) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      const { data, error } = await supabase
        .from('layer_2_manual_attempts')
        .update({ admin_override_marks: newScore })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) return { data: null, error };

      // Re-fetch gen AI marks to recalculate layer 2 average
      const { data: l2Record } = await supabase
        .from('layer_2')
        .select('layer_2_gen_ai_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const genAiMarks = parseFloat(l2Record?.layer_2_gen_ai_marks) || 0;
      const userName = l2Record?.name || '';

      await this.updateLayer2Marks(userId, genAiMarks, newScore, userName);

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // ------------------------------------------------------------------------
  // LAYER 2 GEN AI ADMIN METHODS
  // ------------------------------------------------------------------------
  async fetchLayer2GenAiSubmissions() {
    if (!isSupabaseConfigured() || !supabase) return { data: [], error: { message: 'Supabase not configured' } };
    try {
      const { data, error } = await supabase
        .from('layer_2_genai_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err };
    }
  },

  async updateLayer2GenAiMarks(submissionId, userId, newMarks, remarks) {
    if (!isSupabaseConfigured() || !supabase) return { error: { message: 'Supabase not configured' } };
    try {
      // 1. Update the submission record
      const { error: subErr } = await supabase
        .from('layer_2_genai_submissions')
        .update({
          admin_marks: newMarks,
          admin_remarks: remarks,
          status: 'reviewed',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (subErr) return { error: subErr };

      // 2. Cascade marks to layer_2 table
      const { data: l2Record } = await supabase
        .from('layer_2')
        .select('layer_2_manual_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const manualMarks = parseFloat(l2Record?.layer_2_manual_marks) || 0;
      const userName = l2Record?.name || '';
      
      const { error: cascadeErr } = await this.updateLayer2Marks(userId, newMarks, manualMarks, userName);
      
      return { error: cascadeErr };
    } catch (err) {
      return { error: err };
    }
  },

  async overrideLayer2GenAiQuestion(userId, newQuestionId) {
    if (!isSupabaseConfigured() || !supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase
        .from('layer_2_genai_submissions')
        .update({
          question_id: newQuestionId,
          explanation: null,
          submitted: false,
          submitted_at: null,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      return { error };
    } catch (err) {
      return { error: err };
    }
  },
  
  async deleteLayer2GenAiSubmission(submissionId, userId) {
    if (!isSupabaseConfigured() || !supabase) return { error: { message: 'Supabase not configured' } };
    try {
      const { error } = await supabase
        .from('layer_2_genai_submissions')
        .delete()
        .eq('id', submissionId);
        
      if (error) return { error };
      
      // Also clear the marks from layer_2 table
      const { data: l2Record } = await supabase
        .from('layer_2')
        .select('layer_2_manual_marks, name')
        .eq('user_id', userId)
        .maybeSingle();

      const manualMarks = parseFloat(l2Record?.layer_2_manual_marks) || 0;
      const userName = l2Record?.name || '';
      
      await this.updateLayer2Marks(userId, null, manualMarks, userName);
      
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  }
};
