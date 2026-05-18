import postgres from 'postgres';

// Initialize Postgres database
const DB_URL = process.env.DB_URL;
if (!DB_URL) {
  throw new Error('DB_URL is missing in .env');
}

let sql: postgres.Sql | null = null;
let isFallbackMode = false;

// Simple in-memory storage as a fail-safe fallback
interface MemoryItem {
  role: string;
  content: string;
  timestamp: Date;
}
const localMemory = new Map<string, MemoryItem[]>();

// Initialize connection safely
try {
  sql = postgres(DB_URL, {
    ssl: 'require',
    connect_timeout: 5, // Timeout after 5 seconds to avoid hanging
  });
} catch (err) {
  console.warn('⚠️ [memory] Could not connect to Supabase PostgreSQL. Falling back to local memory storage.', err instanceof Error ? err.message : err);
  isFallbackMode = true;
}

// Setup schema
async function initDb() {
  if (isFallbackMode || !sql) return;
  try {
    // Run a quick check to see if we can reach the DB host
    await sql`SELECT 1`;
    
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
    console.log('✅ [memory] Supabase PostgreSQL database initialized successfully.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
      console.warn(`⚠️ [memory] Supabase PostgreSQL unreachable during init: ${msg}. Switching to safe local in-memory fallback.`);
    } else {
      console.warn('⚠️ [memory] Supabase PostgreSQL initialization failed:', err);
    }
    isFallbackMode = true;
  }
}

// Start DB initialization
initDb();

/**
 * Memory Service
 * Provides long-term persistence for persona conversations.
 * Automatically falls back to high-performance in-memory storage if Supabase is offline.
 */
export const memoryService = {
  /**
   * Store a message in long-term memory
   */
  async store(userId: string, persona: string, role: string, content: string) {
    if (isFallbackMode || !sql) {
      const key = `${userId}:${persona}`;
      if (!localMemory.has(key)) {
        localMemory.set(key, []);
      }
      localMemory.get(key)!.push({ role, content, timestamp: new Date() });
      return;
    }

    try {
      await sql`
        INSERT INTO memory (user_id, persona, role, content)
        VALUES (${userId}, ${persona}, ${role}, ${content})
      `;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
        console.warn(`⚠️ [memory] Supabase PostgreSQL unreachable during store: ${msg}. Saving to local fallback.`);
      } else {
        console.error('Failed to store memory to Supabase:', err);
      }
      isFallbackMode = true;
      
      // Save locally as a secondary fail-safe
      const key = `${userId}:${persona}`;
      if (!localMemory.has(key)) {
        localMemory.set(key, []);
      }
      localMemory.get(key)!.push({ role, content, timestamp: new Date() });
    }
  },

  /**
   * Retrieve recent context for a persona
   */
  async getContext(userId: string, persona: string, limit: number = 10) {
    if (isFallbackMode || !sql) {
      const key = `${userId}:${persona}`;
      const items = localMemory.get(key) ?? [];
      // Return recent items up to limit
      return items.slice(-limit).map(item => ({ role: item.role, content: item.content }));
    }

    try {
      const results = await sql`
        SELECT role, content FROM memory
        WHERE user_id = ${userId} AND persona = ${persona}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `;
      return [...results].reverse() as { role: string; content: string }[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
        console.warn(`⚠️ [memory] Supabase PostgreSQL unreachable during getContext: ${msg}. Pulling from local fallback.`);
      } else {
        console.warn('Failed to get context from Supabase, pulling from local fallback:', err);
      }
      isFallbackMode = true;

      const key = `${userId}:${persona}`;
      const items = localMemory.get(key) ?? [];
      return items.slice(-limit).map(item => ({ role: item.role, content: item.content }));
    }
  },

  /**
   * Search memory for specific keywords
   */
  async search(userId: string, persona: string, keyword: string) {
    const lowercaseKeyword = keyword.toLowerCase();
    const localResults = (localMemory.get(`${userId}:${persona}`) ?? [])
      .filter(item => item.content.toLowerCase().includes(lowercaseKeyword))
      .slice(-5)
      .map(item => ({ role: item.role, content: item.content }));

    if (isFallbackMode || !sql) {
      return localResults;
    }

    try {
      const searchPattern = `%${keyword}%`;
      const results = await sql`
        SELECT role, content FROM memory
        WHERE user_id = ${userId} AND persona = ${persona} AND content LIKE ${searchPattern}
        ORDER BY timestamp DESC
        LIMIT 5
      `;
      return results as { role: string; content: string }[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
        console.warn(`⚠️ [memory] Supabase PostgreSQL unreachable during search: ${msg}. Using local fallback.`);
      } else {
        console.warn('Failed to search memory in Supabase:', err);
      }
      isFallbackMode = true;
      
      return localResults;
    }
  }
};
