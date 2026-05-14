import { webSearch } from '../services/websearch.ts';

export interface ToolDefinition {
  schema: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
  execute: (args: any) => Promise<any>;
}

export const webSearchTool: ToolDefinition = {
  schema: {
    name: "web_search",
    description: "Search the web for real-time information, news, or technical data.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to look up."
        }
      },
      required: ["query"]
    }
  },
  execute: async ({ query }) => {
    const results = await webSearch(query);
    return JSON.stringify(results);
  }
};

export const TOOLS_BY_PERSONA: Record<string, ToolDefinition[]> = {
  travel: [webSearchTool],
  chatbot: [webSearchTool],
  research: [webSearchTool],
  support: [], // RAG will be implemented later
  image: [],   // Prompt enhancement tools will be implemented later
  tutor: [webSearchTool],
  medical: [webSearchTool],
  legal: [webSearchTool],
  movies: [webSearchTool],
};
