import { createClient } from '@supabase/supabase-js';

const url = 'https://ufpinbvrokboymcndnyu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(url, anonKey);

async function testColumns() {
  // Test if we can read columns of layer_1_genai_submissions
  const { data: sample, error } = await supabase.from('layer_1_genai_submissions').select('*').limit(1);
  console.log('Sample row keys:', sample ? Object.keys(sample[0]) : 'None', error);

  // Let's test if there are other columns or if time_taken is in another format
  // Or test updating a non-existent column to see error
  const { data: testUp, error: upErr } = await supabase
    .from('layer_1_genai_submissions')
    .update({ test_column: 123 })
    .eq('id', 'non-existent');
  console.log('Test update non-existent column error:', upErr?.message);
}

testColumns();
