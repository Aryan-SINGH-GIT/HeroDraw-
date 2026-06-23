const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  if (line && line.includes('=')) {
    const [key, val] = line.split('=');
    acc[key.trim()] = val.trim();
  }
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });
    
  console.log('Subscriptions:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

check();
