import type { LlmsTxtOptions } from './types.js';

export interface PageInfo {
  url: string;
  title: string;
  summary: string;
  relUrl: string;
  fullContent?: string;
}

/**
 * Generates the Markdown content for llms.txt and optionally llms-full.txt.
 * @param pages - The list of processed pages.
 * @param options - The plugin configuration options.
 * @returns An object containing the generated content.
 */
export function generateLlmsTxtContent(
  pages: PageInfo[],
  options: LlmsTxtOptions
): { short: string; full?: string } {
  const {
    projectName = 'Projectname',
    description = 'Automatically generated overview for LLMs.',
  } = options;

  // Group pages by section
  const sectionMap = new Map<string, PageInfo[]>();
  pages.forEach((info) => {
    const sectionMatch = /^\/([^/]+)\//.exec(info.relUrl);
    const section = sectionMatch ? sectionMatch[1] : 'General';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(info);
  });

  // Generate llms.txt content
  let shortContent = `# ${projectName}\n\n`;
  shortContent += `> ${description}\n\n`;

  // Generate llms-full.txt content (if requested)
  let fullContent = options.llmsFull ? `# ${projectName} - Full Content\n\n` : undefined;

  // Build the content
  // Sort sections alphabetically for consistent output
  const sortedSections = Array.from(sectionMap.keys()).sort();

  sortedSections.forEach((section) => {
    const entries = sectionMap.get(section)!;

    // Add section header to short content
    shortContent += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;

    entries.forEach((info) => {
      shortContent += `- [${info.title}](${info.url}): ${info.summary}\n`;

      if (fullContent && info.fullContent) {
        fullContent += `## ${info.title}\n\nURL: ${info.url}\n\n${info.fullContent}\n\n---\n\n`;
      }
    });
    shortContent += '\n';
  });

  return { short: shortContent, full: fullContent };
}
