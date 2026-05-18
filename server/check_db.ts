import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  console.error('❌ Error: DB_URL is missing in server/.env');
  process.exit(1);
}

console.log('🔌 Connecting to Supabase database using:');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_DATABASE);
console.log('User:', process.env.DB_USER);
console.log('Connection URL:', DB_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in log

const sql = postgres(DB_URL, {
  ssl: 'require',
  connect_timeout: 5,
});

async function testConnection() {
  try {
    console.log('⏳ Sending test query (SELECT 1)...');
    const result = await sql`SELECT 1 as connected`;
    console.log('✅ Connection Successful!');
    console.log('Result:', result);
    
    console.log('⏳ Checking or creating memory table...');
    await sql`
      CREATE TABLE IF NOT EXISTS memory (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        role TEXT,
        content TEXT,
        persona TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Memory table verified/created successfully!');
    
  } catch (err) {
    console.error('❌ Database Connection Failed!');
    console.error(err);
  } finally {
    await sql.end();
  }
}

testConnection();
