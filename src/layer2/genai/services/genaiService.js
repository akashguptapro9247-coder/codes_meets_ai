import { supabase, isSupabaseConfigured } from '../../../shared/services/supabaseClient';
import genaiQuestionsData from '../data/layer2_genai_questions.json';

class GenAIService {
  constructor() {
    this.questions = genaiQuestionsData.questions || [];
  }

  getQuestions() {
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
      // 1. Check for existing assignment
      const { data: existing, error: fetchErr } = await supabase
        .from('layer_2_genai_submissions')
        .select('*')
        .eq('user_id', participant.userId || participant.user_id)
        .maybeSingle();

      if (fetchErr) return { data: null, error: fetchErr };
      
      // If already assigned, return it
      if (existing) return { data: existing, error: null };

      // 2. Randomly select a question
      const randomIndex = Math.floor(Math.random() * this.questions.length);
      const selectedQuestion = this.questions[randomIndex];

      // 3. Create new assignment
      const newAssignment = {
        user_id: participant.userId || participant.user_id,
        username: participant.name || 'Participant',
        roll_number: participant.rollNumber || participant.roll_number || '',
        question_id: selectedQuestion.id,
        status: 'in_progress',
        submitted: false
      };

      const { data: inserted, error: insertErr } = await supabase
        .from('layer_2_genai_submissions')
        .insert([newAssignment])
        .select()
        .single();

      if (insertErr) return { data: null, error: insertErr };
      return { data: inserted, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async submitProject(userId, explanation) {
    if (!isSupabaseConfigured() || !supabase) return { data: null, error: { message: 'Supabase not configured' } };
    try {
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
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }
}

export const genaiService = new GenAIService();
