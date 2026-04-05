// @ts-check
import { defineConfig } from 'astro/config';
import llmsTxt from '../src/index.ts';

// https://astro.build/config
export default defineConfig({
  integrations: [
    llmsTxt({
      projectName: '🚀 My Project',
      description: 'KI-optimized overview for LLMs. 🧠',
      aiProvider: 'gemini',
      aiModel: 'gemini-2.5-flash',
      site: 'https://my-domain.com', // Base URL for links
      llmsFull: true,
      maxInputLength: 8000, // Optional: max length for AI input
      debug: true, // Optional: enable debug mode for detailed logs
      
      // --- New v1.3 Features ---
      mcp: true, // Auto-generate Model Context Protocol integration and serve SSE endpoint
      llmsFullFormat: 'xml', // Format llms-full.txt as XML for Anthropic compatibility
      contentSource: 'auto', // Support pulling from Astro 5 DataStore or HTML files
    }),
  ],
});
