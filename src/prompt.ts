/**
 * Optimized prompts for llms.txt generation, following the standard at https://llmstxt.org/
 */

export function getMainSummaryPrompt(language: string = 'en'): string {
  const base = "Act as an expert technical writer. Create a high-quality Markdown H1 and a blockquote for an 'llms.txt' file. " +
    "The H1 should be the project name. The blockquote must be a concise (max 3 sentences) but information-dense summary " +
    "of the project's purpose, target audience, and key features. Target LLMs specifically, so they can quickly grasp the context. " +
    "Avoid marketing fluff.";

  switch (language) {
    case 'de':
      return `${base} Antworte auf Deutsch.`;
    case 'fr':
      return `${base} Répondez en français.`;
    default:
      return base;
  }
}

export function getDetailsPrompt(language: string = 'en'): string {
  const base = "Provide a detailed but concise Markdown section (no heading) for an 'llms.txt' file. " +
    "Describe the key technical components, architecture, or usage patterns that an LLM should know to help a developer. " +
    "Focus on what's unique or critical for understanding the codebase or site structure.";

  switch (language) {
    case 'de':
      return `${base} Antworte auf Deutsch.`;
    case 'fr':
      return `${base} Répondez en français.`;
    default:
      return base;
  }
}

export function getFileListPrompt(language: string = 'en', section: string = 'Docs'): string {
  const base = `Create a Markdown H2 named '${section}' followed by a list of links. ` +
    "For each link provided, write a very brief, one-sentence description explaining its technical relevance or content. " +
    "The goal is to help an LLM decide which pages are most relevant for a specific query.";

  switch (language) {
    case 'de':
      return `${base} Antworte auf Deutsch.`;
    case 'fr':
      return `${base} Répondez en français.`;
    default:
      return base;
  }
}

export function getFullLlmsTxtPrompt(language: string = 'en'): string {
  const base = "Generate a complete 'llms.txt' following the standard. Include an H1 title, a blockquote summary, " +
    "a details section, and categorized lists of links (H2 sections). " +
    "Prioritize clarity, technical depth, and density of information for Large Language Models.";

  switch (language) {
    case 'de':
      return `${base} Antworte auf Deutsch.`;
    case 'fr':
      return `${base} Répondez en français.`;
    default:
      return base;
  }
}
