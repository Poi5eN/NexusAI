import { Database } from 'bun:sqlite';
import { join } from 'path';

// Initialize SQLite database
const DB_PATH = join(process.cwd(), 'nexus_memory.sqlite');
const db = new Database(DB_PATH);

// Setup schema
db.run(`
  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    role TEXT,
    content TEXT,
    persona TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * Memory Service
 * Provides long-term persistence for persona conversations.
 */
export const memoryService = {
  /**
   * Store a message in long-term memory
   */
  async store(userId: string, persona: string, role: string, content: string) {
    const query = db.prepare('INSERT INTO memory (user_id, persona, role, content) VALUES (?, ?, ?, ?)');
    query.run(userId, persona, role, content);
  },

  /**
   * Retrieve recent context for a persona
   */
  async getContext(userId: string, persona: string, limit: number = 10) {
    const query = db.prepare('SELECT role, content FROM memory WHERE user_id = ? AND persona = ? ORDER BY timestamp DESC LIMIT ?');
    const results = query.all(userId, persona, limit) as { role: string; content: string }[];
    return results.reverse();
  },

  /**
   * Search memory for specific keywords
   */
  async search(userId: string, persona: string, keyword: string) {
    const query = db.prepare('SELECT role, content FROM memory WHERE user_id = ? AND persona = ? AND content LIKE ? ORDER BY timestamp DESC LIMIT 5');
    return query.all(userId, persona, `%${keyword}%`) as { role: string; content: string }[];
  }
};
