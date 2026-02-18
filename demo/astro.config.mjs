// @ts-check
import { defineConfig } from 'astro/config';
import llmsTxt from '../src/index.ts'; // Adjusted import to include file extension

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
    }),
  ],
});
