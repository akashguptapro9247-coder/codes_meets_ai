import { supabase, isSupabaseConfigured } from '../../../shared/services/supabaseClient';
import genaiQuestionsData from '../data/layer2_genai_questions.json';

class GenAIService {
  constructor() {
    this.questions = genaiQuestionsData.questions || [];
  }

  getQuestions() {
    return this.questions;
  }

  getAllQuestions() {
    return this.questions;
  }

  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  async fetchParticipantSubmission(userId) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: null };
    try {
      const { data, error } = await supabase
        .from('layer_2_genai_submissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async assignRandomQuestion(participant) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      const activeUserId = participant.userId || participant.user_id;

      // 1. Check for existing assignment
      const { data: existing, error: fetchErr } = await supabase
        .from('layer_2_genai_submissions')
        .select('*')
        .eq('user_id', activeUserId)
        .maybeSingle();

      if (fetchErr) return { data: null, error: fetchErr };
      
      // If already assigned, cache assigned_at and return it
      if (existing) {
        if (typeof window !== 'undefined' && activeUserId && existing.assigned_at) {
          try {
            localStorage.setItem(`cma_l2_genai_assigned_at_${activeUserId}`, existing.assigned_at);
          } catch (e) {}
        }
        return { data: existing, error: null };
      }

      // 2. Randomly select a question
      const randomIndex = Math.floor(Math.random() * this.questions.length);
      const selectedQuestion = this.questions[randomIndex];

      // 3. Create new assignment with explicit assigned_at
      const nowIso = new Date().toISOString();
      const newAssignment = {
        user_id: activeUserId,
        username: participant.name || 'Participant',
        roll_number: participant.rollNumber || participant.roll_number || '',
        question_id: selectedQuestion.id,
        assigned_at: nowIso,
        status: 'in_progress',
        submitted: false
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('layer_2_genai_submissions')
        .insert([newAssignment])
        .select()
        .single();

      if (insertErr) return { data: null, error: insertErr };

      if (typeof window !== 'undefined' && activeUserId) {
        try {
          localStorage.setItem(`cma_l2_genai_assigned_at_${activeUserId}`, nowIso);
        } catch (e) {}
      }

      return { data: inserted, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async submitProject(userId, explanation) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
      // 1. Guard against duplicate submission: if already marked submitted in DB, return it
      const { data: existing } = await supabase
        .from('layer_2_genai_submissions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing && (existing.submitted || existing.status === 'completed' || existing.status === 'reviewed')) {
        if (typeof window !== 'undefined' && userId) {
          try {
            localStorage.setItem(`cma_l2_genai_submitted_${userId}`, 'true');
            localStorage.removeItem(`cma_l2_genai_expired_${userId}`);
          } catch (e) {}
        }
        return { data: existing, error: null };
      }

      // 2. Perform authoritative update
      const { data, error } = await supabase
        .from('layer_2_genai_submissions')
        .update({
          explanation: explanation,
          submitted: true,
          submitted_at: new Date().toISOString(),
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error };

      if (typeof window !== 'undefined' && userId) {
        try {
          localStorage.setItem(`cma_l2_genai_submitted_${userId}`, 'true');
          localStorage.removeItem(`cma_l2_genai_expired_${userId}`);
          localStorage.removeItem(`cma_l2_genai_prompt_${userId}`);
          localStorage.removeItem(`cma_l2_genai_folder_${userId}`);
        } catch (e) {}
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async recordTimeout(userId, explanation) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: null };
    try {
      if (typeof window !== 'undefined' && userId) {
        try {
          localStorage.setItem(`cma_l2_genai_expired_${userId}`, 'true');
          localStorage.removeItem(`cma_l2_genai_prompt_${userId}`);
          localStorage.removeItem(`cma_l2_genai_folder_${userId}`);
        } catch (e) {}
      }

      const promptText = (explanation || '').trim();
      const hasPrompt = promptText.length > 0;

      // Auto-submit prompt if one exists on deadline expiry
      const updatePayload = {
        explanation: promptText,
        submitted: hasPrompt,
        submitted_at: hasPrompt ? new Date().toISOString() : null,
        status: hasPrompt ? 'completed' : 'time_expired',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('layer_2_genai_submissions')
        .update(updatePayload)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

export const genaiService = new GenAIService();
