import type { LlmsTxtOptions } from './types.js';

export interface PageInfo {
  url: string;
  title: string;
  summary: string;
  relUrl: string;
  fullContent?: string;
  /** When true the page is placed under the llms.txt '## Optional' section. */
  isOptional?: boolean;
  /** Structured metadata extracted from data-llm attributes on the page. */
  dataLlmMetadata?: string;
}

/**
 * Generates the Markdown content for llms.txt and optionally llms-full.txt.
 * Spec-compliant structure:
 *   # Project Name
 *   > Description
 *   ## Section
 *   - [Title](url): summary
 *   ## Optional
 *   - [Title](url): summary   ← pages with isOptional: true
 *
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
    llmsFullFormat = 'markdown',
  } = options;

  // Separate optional pages from regular pages
  const regularPages = pages.filter((p) => !p.isOptional);
  const optionalPages = pages.filter((p) => p.isOptional);

  // Group regular pages by URL section
  const sectionMap = new Map<string, PageInfo[]>();
  regularPages.forEach((info) => {
    const sectionMatch = /^\/([^/]+)\//.exec(info.relUrl);
    const section = sectionMatch ? sectionMatch[1] : 'General';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(info);
  });

  // Generate llms.txt — spec-compliant header
  let shortContent = `# ${projectName}\n\n`;
  shortContent += `> ${description}\n\n`;

  // Generate llms-full.txt header (if requested)
  let fullContent: string | undefined;
  if (options.llmsFull) {
    fullContent =
      llmsFullFormat === 'xml'
        ? `<?xml version="1.0" encoding="UTF-8"?>\n<documents>\n`
        : `# ${projectName} - Full Content\n\n`;
  }

  let xmlDocIndex = 1;

  const appendFull = (info: PageInfo): void => {
    if (!fullContent || !info.fullContent) return;
    const body = info.dataLlmMetadata
      ? `${info.fullContent}\n${info.dataLlmMetadata}`
      : info.fullContent;

    if (llmsFullFormat === 'xml') {
      fullContent += `  <document index="${xmlDocIndex++}">\n`;
      fullContent += `    <title>${escapeXml(info.title)}</title>\n`;
      fullContent += `    <source>${escapeXml(info.url)}</source>\n`;
      fullContent += `    <content>\n${body}\n    </content>\n`;
      fullContent += `  </document>\n`;
    } else {
      fullContent += `## ${info.title}\n\nURL: ${info.url}\n\n${body}\n\n---\n\n`;
    }
  };

  // Regular sections — sorted alphabetically for stable output
  const sortedSections = Array.from(sectionMap.keys()).sort();
  sortedSections.forEach((section) => {
    const entries = sectionMap.get(section)!;
    shortContent += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
    entries.forEach((info) => {
      shortContent += `- [${info.title}](${info.url}): ${info.summary}\n`;
      appendFull(info);
    });
    shortContent += '\n';
  });

  // Optional section — per llms.txt spec LLMs with limited context may skip this
  if (optionalPages.length > 0) {
    shortContent += `## Optional\n\n`;
    optionalPages.forEach((info) => {
      shortContent += `- [${info.title}](${info.url}): ${info.summary}\n`;
      appendFull(info);
    });
    shortContent += '\n';
  }

  // Close XML wrapper
  if (fullContent && llmsFullFormat === 'xml') {
    fullContent += `</documents>\n`;
  }

  return { short: shortContent, full: fullContent };
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
