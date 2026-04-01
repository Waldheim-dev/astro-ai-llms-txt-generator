export interface ChunkingOptions {
  /** Chunking strategy (default: 'none'). 'semantic' requires optional peer @xenova/transformers. */
  strategy?: 'none' | 'fixed' | 'recursive' | 'structure' | 'semantic';
  /** Target chunk size in characters for fixed/recursive strategies (default: 1500). */
  chunkSize?: number;
  /** Character overlap between adjacent chunks (default: 200). */
  chunkOverlap?: number;
  /** Cosine similarity threshold below which a new chunk begins for semantic strategy (default: 0.5). */
  similarityThreshold?: number;
}

export interface McpOptions {
  /** Generate .cursor/mcp.json, .vscode/mcp.json and .mcp.json during build (default: true). */
  manifests?: boolean;
  /** Enable local SSE MCP server during `astro dev` (default: true). */
  devServer?: boolean;
  /** Custom path for the SSE endpoint (default: '/__mcp/sse'). */
  serverPath?: string;
}

export interface LlmsTxtOptions {
  projectName?: string;
  description?: string;
  sectionTitle?: string;
  aiProvider?: 'openai' | 'gemini' | 'ollama' | 'claude' | 'cli';
  aiApiKey?: string;
  aiModel?: string;
  aiUrl?: string;
  site?: string;
  maxInputLength?: number;
  language?: string; // z.B. 'de', 'en', 'fr', Default: 'en'
  debug?: boolean;
  concurrency?: number;
  llmsFull?: boolean; // Generate llms-full.txt as well
  cliCommand?: string; // Command for 'cli' provider, e.g., 'gemini summarize'
  geminiThinkingLevel?: 'low' | 'medium' | 'high' | 'minimal';
  geminiThinkingBudget?: number;
  // Phase 1 — Spec compliance & GEO linting
  /** Run GEO linter during build and warn about content quality issues (default: true). */
  geoLinter?: boolean;
  /** Output format for llms-full.txt (default: 'markdown'). 'xml' wraps each page in <document> tags. */
  llmsFullFormat?: 'markdown' | 'xml';
  // Phase 2 — Content source
  /** Data source for content extraction. 'html': scan HTML build output (default). 'datastore': use Astro 5 DataStore. 'auto': prefer DataStore, fall back to HTML. */
  contentSource?: 'html' | 'datastore' | 'auto';
  // Phase 3 — Chunking pipeline
  /** Chunking configuration for generating semantically segmented output. */
  chunking?: ChunkingOptions;
  /** Export format for chunked output alongside llms-full.txt (default: 'none'). */
  chunkExport?: 'none' | 'jsonl';
  // Phase 4 — MCP integration
  /** Enable MCP (Model Context Protocol) integration. Pass true for defaults or an object for fine-grained control. */
  mcp?: McpOptions | boolean;
}
