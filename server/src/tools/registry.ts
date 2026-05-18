import { webSearch } from '../services/websearch.ts';
import { memoryService } from '../services/memory.ts';
import { getStockPrice } from './stockPrice.ts';

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
        price_summary: {
          type: "object",
          properties: {
            estimated_total: { type: "string" },
            currency: { type: "string" }
          }
        },
        hotels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              rating: { type: "string" },
              price_per_night: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              date: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        nearby_gems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" }
            }
          }
        },
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
                    location: { type: "string" },
                    price_estimate: { type: "string" }
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

export const codeExecutorTool: ToolDefinition = {
  schema: {
    name: "execute_code",
    description: "Execute Python or JavaScript code and return the output. Use this for math, data analysis, or code testing.",
    parameters: {
      type: "object",
      properties: {
        code: { type: "string", description: "The source code to execute." },
        language: { type: "string", enum: ["python", "javascript"], description: "The programming language." }
      },
      required: ["code", "language"]
    }
  },
  execute: async ({ code, language }) => {
    try {
      const cmd = language === 'python' ? ['python3', '-c', code] : ['bun', 'eval', code];
      const proc = Bun.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' });
      
      const stdout = await new Response(proc.stdout).text();
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;

      if (exitCode !== 0) {
        return `Error (Exit ${exitCode}): ${stderr || stdout}`;
      }
      return stdout || (stderr ? `Warnings: ${stderr}` : 'Code executed successfully (no output).');
    } catch (err) {
      return `Failed to execute ${language} code: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
};export const stockPriceTool: ToolDefinition = {
  schema: {
    name: "get_stock_price",
    description: "Get live real-time stock prices and daily market data.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "The stock ticker symbol (e.g., AAPL, NVDA, TSLA)." }
      },
      required: ["symbol"]
    }
  },
  execute: async ({ symbol }) => {
    return await getStockPrice(symbol);
  }
};

export const marketNewsTool: ToolDefinition = {
  schema: {
    name: "get_market_news",
    description: "Get the latest financial and market news for a specific sector or company.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string", description: "The sector or company to get news for (e.g., technology, AI, NVIDIA)." }
      },
      required: ["category"]
    }
  },
  execute: async ({ category }) => {
    const response = await webSearch(`${category} latest financial market news and earnings`, 5);
    return response.results.map(r => `[${r.title}](${r.url})\n${r.content}`).join('\n\n');
  }
};

export const TOOLS_BY_PERSONA: Record<string, ToolDefinition[]> = {
  travel: [webSearchTool, buildItineraryTool],
  chatbot: [webSearchTool, codeExecutorTool, stockPriceTool, recallMemoryTool],
  research: [webSearchTool, generateResearchReportTool],
  support: [], 
  image: [],   
  tutor: [webSearchTool, codeExecutorTool],
  medical: [webSearchTool],
  legal: [webSearchTool],
  movies: [webSearchTool],
  broker: [webSearchTool, stockPriceTool, codeExecutorTool, marketNewsTool],
};
