# NEXUS — Claude IDE Superpowers

## What is this project?
NEXUS is a multi-persona AI agent platform. See GEMINI.md for the full project brief.

## Quick Reference
| Layer    | Runtime | Framework | Port | Tests      |
|----------|---------|-----------|------|------------|
| Backend  | Bun     | Hono      | 3001 | `bun test` |
| Frontend | Node    | Vite+React| 5173 | `npm test` |

## Key Files
- `server/index.ts` — main Hono server entry
- `server/src/agents/` — one file per persona
- `server/src/services/` — openrouter, huggingface, websearch, vectorstore
- `client/src/App.jsx` — root component
- `client/src/personas/` — per-persona UI
- `client/src/stores/` — Zustand state

## TypeScript Rules (server)
- Always type `c.req.json<T>()` with explicit generic
- Use `err instanceof Error ? err.message : 'Unknown error'` pattern
- `process.env.X ?? 'default'` — never `process.env.X || 'default'` for type safety
- Export server as `export default { port, fetch: app.fetch }`

## When I ask you to add a feature
1. Write the implementation
2. Write/update the test
3. Run `bun test` or `npm test` and confirm passing
4. Report which files changed
