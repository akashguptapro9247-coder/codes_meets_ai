import { createClient } from '@supabase/supabase-js';
import { uploadToImageKit } from '../server/imagekitApi.js';

const SUPABASE_URL = 'https://ufpinbvrokboymcndnyu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPipeline() {
  console.log('--- 1. Testing ImageKit Upload via Secure Server Handler ---');
  
  // 1x1 transparent PNG sample
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  const uploadResult = await uploadToImageKit({
    base64Data: sampleBase64,
    fileName: `test_${Date.now()}.png`,
    folder: '/code-meets-ai/layer-1/gen-ai/test_user/'
  });

  console.log('ImageKit Upload SUCCESS:', uploadResult);

  console.log('\n--- 2. Testing Supabase Submission Insertion ---');
  // Check if test user exists
  const { data: users } = await supabase.from('users').select('user_id, name, roll_number').limit(1);
  if (!users || users.length === 0) {
    console.log('No user found in DB to test foreign key.');
    return;
  }

  const testUser = users[0];
  console.log('Using existing test user:', testUser.name, testUser.user_id);

  const subPayload = {
    user_id: testUser.user_id,
    username: testUser.name,
    roll_number: testUser.roll_number,
    prompt: 'A futuristic cybernetic metropolis illuminated by neon volumetric fog with chromatic aberration and raymarched reflections.',
    image_urls: [uploadResult.url],
    image_file_ids: [uploadResult.fileId],
    image_paths: [uploadResult.filePath],
    status: 'pending',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: subData, error: subError } = await supabase
    .from('layer_1_genai_submissions')
    .upsert(subPayload, { onConflict: 'user_id' })
    .select()
    .single();

  if (subError) {
    console.error('Supabase submission upsert error (Make sure SQL table is created):', subError);
  } else {
    console.log('Supabase submission SUCCESS:', subData);
  }
}

testPipeline().catch(console.error);
