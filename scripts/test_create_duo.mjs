import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ufpinbvrokboymcndnyu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDuoCreation() {
  console.log('Fetching existing users to test duo creation...');
  const { data: users, error: userErr } = await supabase.from('users').select('*').limit(2);
  if (userErr || !users || users.length < 2) {
    console.error('Not enough users to create a duo:', userErr || 'Only ' + (users?.length || 0) + ' users exist');
    return;
  }

  const p1 = users[0];
  const p2 = users[1];
  console.log(`Trying to pair Player 1 (${p1.name}, id: ${p1.user_id}) with Player 2 (${p2.name}, id: ${p2.user_id})...`);

  const p1Score = (parseFloat(p1.average_layer_1) || 0) + (parseFloat(p1.average_layer_2) || 0);
  const p2Score = (parseFloat(p2.average_layer_1) || 0) + (parseFloat(p2.average_layer_2) || 0);
  const layer3Combined = parseFloat(((p1Score + p2Score) / 2.0).toFixed(2));

  console.log('Sending insert into duos table...');
  const { data, error } = await supabase
    .from('duos')
    .insert([
      {
        player_1_id: p1.user_id,
        player_2_id: p2.user_id,
        player_1_name: p1.name || 'Player 1',
        player_2_name: p2.name || 'Player 2',
        combined_layer_1_average: layer3Combined,
        total_marks: layer3Combined
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('ERROR RESPONSE FROM SUPABASE ON DUO INSERT:', JSON.stringify(error, null, 2));
  } else {
    console.log('SUCCESS! Duo created:', data);
  }
}

testDuoCreation().catch(console.error);
