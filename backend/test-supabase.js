const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

console.log('--- Supabase Auth Test ---');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing auth.signInWithPassword for staff@pharmaassist.com...');
  try {
    const start = Date.now();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'staff@pharmaassist.com',
      password: 'staff123'
    });
    console.log(`Request completed in ${Date.now() - start}ms`);
    if (error) {
      console.error('Supabase Auth error:', error.message);
    } else {
      console.log('Supabase Auth success!');
      console.log('User ID:', data.user.id);
    }
  } catch (err) {
    console.error('Supabase Auth exception:', err.message);
  }
}

async function testDB() {
  console.log('--- PostgreSQL Direct DB Connection Test ---');
  const databaseUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL:', databaseUrl ? 'Present' : 'Missing');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const start = Date.now();
    await client.connect();
    console.log(`Connected to database in ${Date.now() - start}ms`);
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

async function run() {
  await testAuth();
  await testDB();
}

run();
