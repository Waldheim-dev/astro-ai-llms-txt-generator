export interface LlmsTxtOptions {
  projectName?: string;
  description?: string;
  sectionTitle?: string;
  aiProvider?: 'openai' | 'gemini' | 'ollama';
  aiApiKey?: string;
  aiModel?: string;
  aiUrl?: string;
  site?: string;
  maxInputLength?: number;
  language?: string; // z.B. 'de', 'en', 'fr', Default: 'en'
  debug?: boolean;
}
