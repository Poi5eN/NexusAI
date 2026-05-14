/**
 * Web Search Service — Tavily API (free tier: 1000 req/month)
 * Get your key at: https://app.tavily.com (sign up free, no card)
 *
 * Used by: Travel Planner, Research Analyst personas
 * Falls back gracefully if key is not set.
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export async function webSearch(query: string, maxResults = 5): Promise<SearchResponse> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const sgaiKey = process.env.SGAI_API_KEY;

  // Try Tavily First
  if (tavilyKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query,
          max_results: maxResults,
          search_depth: 'basic',
        }),
      });

      if (res.ok) {
        const data = await res.json() as SearchResponse;
        return data;
      }
      console.warn(`[webSearch] Tavily failed (${res.status}). Falling back to SGAI.`);
    } catch (e) {
      console.warn(`[webSearch] Tavily error: ${e instanceof Error ? e.message : String(e)}. Falling back to SGAI.`);
    }
  }

  // Fallback to ScrapeGraphAI
  if (sgaiKey) {
    try {
      const res = await fetch('https://v2-api.scrapegraphai.com/api/search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'SGAI-APIKEY': sgaiKey
        },
        body: JSON.stringify({
          query,
          max_results: maxResults,
        }),
      });

      if (res.ok) {
        const data = await res.json() as any;
        // Map SGAI results to our standard SearchResponse format
        const results = (data.result || data.results || []).map((r: any) => ({
          title: r.title || r.url,
          url: r.url || r.link,
          content: r.content || r.snippet || '',
          score: 1.0
        }));
        return { query, results };
      }
      console.warn(`[webSearch] SGAI failed (${res.status}).`);
    } catch (e) {
      console.warn(`[webSearch] SGAI error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Graceful fallback — agents can still work without web search
  console.warn('[webSearch] No web search providers available or all failed, returning empty results');
  return { query, results: [] };
}
