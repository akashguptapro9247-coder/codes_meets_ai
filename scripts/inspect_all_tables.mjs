import { createClient } from '@supabase/supabase-js';

const url = 'https://ufpinbvrokboymcndnyu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcGluYnZyb2tib3ltY25kbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODU0MzEsImV4cCI6MjEwMjI2MTQzMX0.-CVLjCL1rm1aOYvzFQ3WQhPTWrZgbWLDEmcb4WPTlL0';

const supabase = createClient(url, anonKey);

async function inspectAllTables() {
  const tables = ['users', 'layer_1', 'layer_1_genai_submissions', 'layer_1_manual_attempts', 'event_settings'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`[${table}] ERROR:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`[${table}] Sample columns:`, Object.keys(data[0]).join(', '));
    } else {
      console.log(`[${table}] Empty table (0 rows)`);
    }
  }
}

inspectAllTables();
