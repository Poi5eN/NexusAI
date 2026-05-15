import { webSearch } from '../services/websearch.ts';
import { memoryService } from '../services/memory.ts';

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

export const generateResearchReportTool: ToolDefinition = {
  schema: {
    name: "generate_research_report",
    description: "Synthesize research findings into a structured report. Use this after performing web searches.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        executive_summary: { type: "string" },
        key_findings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              point: { type: "string" },
              details: { type: "string" },
              sources: { type: "array", items: { type: "string" } }
            }
          }
        },
        conclusion: { type: "string" }
      },
      required: ["title", "executive_summary", "key_findings"]
    }
  },
  execute: async (args) => {
    return JSON.stringify(args);
  }
};

export const recallMemoryTool: ToolDefinition = {
  schema: {
    name: "recall_memory",
    description: "Recall information from previous conversations. Use this when the user refers to something they mentioned before.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The keyword or topic to search for in past memories." }
      },
      required: ["query"]
    }
  },
  execute: async ({ query }) => {
    // In a real app, we'd get the actual user_id from auth
    const results = await memoryService.search("default_user", "chatbot", query);
    return JSON.stringify(results);
  }
};

export const buildItineraryTool: ToolDefinition = {
  schema: {
    name: "build_itinerary",
    description: "Generate a structured travel itinerary. Use this when the user asks for a trip plan or itinerary.",
    parameters: {
      type: "object",
      properties: {
        destination: { type: "string" },
        duration_days: { type: "number" },
        budget_level: { type: "string", enum: ["budget", "moderate", "luxury"] },
        days: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              theme: { type: "string" },
              activities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: { type: "string" },
                    activity: { type: "string" },
                    location: { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      required: ["destination", "duration_days", "days"]
    }
  },
  execute: async (args) => {
    // This tool is primarily for structured output. 
    // We just return the args as the "result" so the frontend can catch it.
    return JSON.stringify(args);
  }
};

export const TOOLS_BY_PERSONA: Record<string, ToolDefinition[]> = {
  travel: [webSearchTool, buildItineraryTool],
  chatbot: [webSearchTool, recallMemoryTool],
  research: [webSearchTool, generateResearchReportTool],
  support: [], 
  image: [],   
  tutor: [webSearchTool],
  medical: [webSearchTool],
  legal: [webSearchTool],
  movies: [webSearchTool],
};
