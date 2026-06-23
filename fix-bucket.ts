import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n').filter(line => line && !line.startsWith('#')).map(line => {
    const [key, ...rest] = line.split('=');
    return [key.trim(), rest.join('=').trim()];
  })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseKey);

async function fixBucket() {
  console.log("Updating winner-proofs bucket to public...");
  
  // Update the bucket to be public
  const { data, error } = await adminClient.storage.updateBucket('winner-proofs', {
    public: true,
    allowedMimeTypes: ['image/*'],
  });

  if (error) {
    console.error("Failed to update bucket:", error.message);
  } else {
    console.log("Success! Bucket is now public.");
  }
}

fixBucket();
