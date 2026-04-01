import type { PageInfo } from './formatter.js';

interface GeoLogger {
  warn: (...args: unknown[]) => void;
}

/**
 * GEO (Generative Engine Optimization) linter.
 * Emits build-time warnings when page content violates best practices for LLM consumption.
 * Rules:
 *  - fullContent word count must not exceed 400 words.
 *  - Code fences must have a language tag (``` ts, ```javascript, etc.).
 */
export function lintGEO(pages: PageInfo[], logger: GeoLogger): void {
  for (const page of pages) {
    if (!page.fullContent) continue;

    const content = page.fullContent;

    // Rule 1: content exceeds 400 words
    const words = content.trim().split(/\s+/).filter(Boolean);
    if (words.length > 400) {
      logger.warn(
        `[GEO Linter] ${page.relUrl}: Content exceeds 400 words (${words.length} words). Consider splitting into smaller sections for better LLM chunking.`
      );
    }

    // Rule 2: code fences without language tag
    // Walk line-by-line so we correctly distinguish opening fences (may have a language)
    // from closing fences (always bare ```).  Only opening fences without a language warn.
    let inCodeFence = false;
    let hasUntaggedFence = false;
    for (const line of content.split('\n')) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('```')) {
        const fenceMatch = /^`{3,}(.*)$/.exec(trimmed);
        /* v8 ignore next -- regex always matches when line starts with ``` */
        if (fenceMatch) {
          if (!inCodeFence) {
            inCodeFence = true;
            const lang = fenceMatch[1].trim();
            if (!lang) hasUntaggedFence = true;
          } else {
            // Closing fence
            inCodeFence = false;
          }
        }
      }
    }
    if (hasUntaggedFence) {
      logger.warn(
        `[GEO Linter] ${page.relUrl}: Found code fence without a language tag. Add a language identifier (e.g. \`\`\`typescript) so LLMs can interpret code blocks correctly.`
      );
    }
  }
}
