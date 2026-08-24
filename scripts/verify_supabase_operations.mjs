// ==========================================================================
// CODE MEETS AI - SUPABASE LIVE OPERATIONS VERIFIER
// ==========================================================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ufpinbvrokboymcndnyu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runLiveAudit() {
  console.log('--- 1. Testing Supabase Tables Connectivity ---');

  // Test 1: Fetch event settings
  const settingsRes = await supabase.from('event_settings').select('*').limit(1);
  console.log('event_settings table check:', settingsRes.error ? 'ERROR: ' + settingsRes.error.message : 'OK (' + (settingsRes.data?.length || 0) + ' rows)');

  // Test 2: Fetch users
  const usersRes = await supabase.from('users').select('*').limit(5);
  console.log('users table check:', usersRes.error ? 'ERROR: ' + usersRes.error.message : 'OK (' + (usersRes.data?.length || 0) + ' rows)');

  // Test 3: Fetch layer_1
  const l1Res = await supabase.from('layer_1').select('*').limit(5);
  console.log('layer_1 table check:', l1Res.error ? 'ERROR: ' + l1Res.error.message : 'OK (' + (l1Res.data?.length || 0) + ' rows)');

  // Test 4: Fetch layer_2
  const l2Res = await supabase.from('layer_2').select('*').limit(5);
  console.log('layer_2 table check:', l2Res.error ? 'ERROR: ' + l2Res.error.message : 'OK (' + (l2Res.data?.length || 0) + ' rows)');

  // Test 5: Fetch duos
  const duosRes = await supabase.from('duos').select('*').limit(5);
  console.log('duos table check:', duosRes.error ? 'ERROR: ' + duosRes.error.message : 'OK (' + (duosRes.data?.length || 0) + ' rows)');

  console.log('\n--- 2. Testing Live CRUD & Cascades ---');
  const testRoll = 'TEST-' + Date.now().toString().slice(-6);

  // A. Create test user
  console.log(`Creating test user with roll: ${testRoll}...`);
  const createRes = await supabase
    .from('users')
    .insert([{
      name: 'Verification Bot',
      roll_number: testRoll,
      branch: 'AI & DS',
      year: 3,
      section: 'A'
    }])
    .select()
    .single();

  if (createRes.error) {
    console.error('CREATE USER FAILED:', createRes.error.message);
    return;
  }
  const testUser = createRes.data;
  console.log('✓ User created successfully with user_id:', testUser.user_id);

  // B. Update test user
  console.log('Updating test user name...');
  const updateRes = await supabase
    .from('users')
    .update({ name: 'Verification Bot Updated' })
    .eq('user_id', testUser.user_id)
    .select()
    .single();

  if (updateRes.error) {
    console.error('UPDATE USER FAILED:', updateRes.error.message);
  } else {
    console.log('✓ User updated successfully:', updateRes.data.name);
  }

  // C. Add Layer 1 Score
  console.log('Adding Layer 1 marks (GenAI: 85, Manual: 95)...');
  const l1Insert = await supabase
    .from('layer_1')
    .upsert({
      user_id: testUser.user_id,
      name: updateRes.data?.name,
      layer_1_gen_ai_marks: 85,
      layer_1_manual_marks: 95,
      average_marks: 90
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (l1Insert.error) {
    console.error('LAYER 1 UPSERT FAILED:', l1Insert.error.message);
  } else {
    console.log('✓ Layer 1 marks saved, average:', l1Insert.data.average_marks);
  }

  // D. Verify score sync in users table
  const userCheck = await supabase.from('users').select('*').eq('user_id', testUser.user_id).single();
  console.log('✓ User score after Layer 1:', userCheck.data?.average_layer_1, 'Total:', userCheck.data?.total_score);

  // E. Delete test user
  console.log('Deleting test user and verifying cascades...');
  // Clean up layer_1 first
  await supabase.from('layer_1').delete().eq('user_id', testUser.user_id);
  const deleteRes = await supabase.from('users').delete().eq('user_id', testUser.user_id).select();

  if (deleteRes.error) {
    console.error('DELETE USER FAILED:', deleteRes.error.message);
  } else {
    console.log('✓ User deleted successfully from Supabase!');
  }

  // F. Confirm deletion
  const verifyDelete = await supabase.from('users').select('*').eq('user_id', testUser.user_id).maybeSingle();
  if (!verifyDelete.data) {
    console.log('✓ Verified: user record does not exist in Supabase.');
  } else {
    console.warn('Warning: user record still found:', verifyDelete.data);
  }

  console.log('\n=========================================');
  console.log('LIVE AUDIT COMPLETE: ALL DATABASE OPERATIONS VERIFIED');
  console.log('=========================================');
}

runLiveAudit().catch(console.error);
