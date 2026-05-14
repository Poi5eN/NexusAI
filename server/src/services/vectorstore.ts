/**
 * Supabase Vector Store Service (for Support Persona RAG)
 * Uses pgvector via @supabase/supabase-js
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Setup Supabase Client
function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key needed for insertions
  
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env');
  }
  return createClient(url, key);
}

export interface Document {
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Searches Supabase pgvector for similar documents.
 * Ensure you have created the `match_documents` Postgres function.
 */
export async function searchSimilarDocuments(queryEmbedding: number[], matchCount = 3): Promise<Document[]> {
  const supabase = getSupabase();
  
  // match_documents is a custom Postgres function you must create in Supabase
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7, // configurable
    match_count: matchCount,
  });

  if (error) {
    throw new Error(`Supabase search error: ${error.message}`);
  }

  return data as Document[];
}

/**
 * Inserts a document and its embedding into the `documents` table.
 */
export async function addDocument(content: string, embedding: number[], metadata: Record<string, any> = {}): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('documents').insert({
    content,
    embedding,
    metadata,
  });

  if (error) {
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}
