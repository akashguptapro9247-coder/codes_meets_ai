import { createClient } from '@supabase/supabase-js';

const url = 'https://ufpinbvrokboymcndnyu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(url, anonKey);

async function checkGenAiSubmissions() {
  const { data, error } = await supabase.from('layer_1_genai_submissions').select('*').limit(3);
  console.log('GenAI Submissions sample:', JSON.stringify(data, null, 2));
  console.log('Error:', error);
}

async function checkTimeTakenColumn() {
  // Check if time_taken column exists by checking column list
  const { data, error } = await supabase
    .from('layer_1_genai_submissions')
    .select('id, time_taken, started_at, submitted_at, created_at, updated_at')
    .limit(1);
  console.log('time_taken column check:', data, error?.message);
}

async function checkEventSettings() {
  const { data, error } = await supabase.from('event_settings').select('*').limit(1);
  console.log('Event settings:', JSON.stringify(data, null, 2));
}

async function checkUsersPromotion() {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, name, roll_number, promoted_to_layer2, promoted_to_layer3, is_removed')
    .limit(10);
  console.log('Users promotion state:', JSON.stringify(data, null, 2));
}

checkGenAiSubmissions();
checkTimeTakenColumn();
checkEventSettings();
checkUsersPromotion();
