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
}
