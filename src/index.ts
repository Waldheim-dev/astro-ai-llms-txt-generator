import type { LlmsTxtOptions } from './types.js';
import {
  getMainSummaryPrompt,
  getDetailsPrompt,
  getFileListPrompt,
  getFullLlmsTxtPrompt,
} from './prompt.js';
import { AISummaryOptions, generateAISummary } from './aiProvider.js';
import { extractMetaContent, extractTagText } from './extractHtml.js';
import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import pLimit from 'p-limit';

interface AstroLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Astro Integration: llms.txt Generator
 *
 * This plugin generates an LLM-optimized llms.txt in the build output for every Astro build.
 * It extracts relevant content from all rendered HTML pages, summarizes them via AI, and outputs them with fully qualified web URLs.
 * Entries are grouped by root sections (e.g. /blog/, /services/).
 * @param options - Plugin configuration.
 * @returns Integration object with build hook.
 */
export default function llmsTxt(options: LlmsTxtOptions = {}) {
  const {
    projectName = 'Projectname',
    description = 'Automatically generated overview for LLMs.',
    site = '',
    maxInputLength = 8000,
    language = 'en',
    aiProvider = 'ollama',
    aiApiKey = '',
    aiModel = 'llama3',
    aiUrl = '',
    concurrency = 5,
    llmsFull = false,
    cliCommand = '',
  } = options;

  return {
    name: 'llms-txt',
    hooks: {
      'astro:build:done': async ({ dir, logger }: { dir: URL; logger: AstroLogger }) => {
        const distPath = fileURLToPath(dir);
        const resolvedDistPath = path.resolve(distPath);
        const htmlFiles = await fg('**/*.html', { cwd: resolvedDistPath, absolute: true });

        if (!htmlFiles.length) {
          logger.warn('No HTML files found. Skipping llms.txt generation.');
          return;
        }

        const cacheDir = path.join(resolvedDistPath, '.llms-txt-cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        const baseUrl = site ? site.replace(/\/$/, '') : '';

        // Prompts
        const mainPrompt = getMainSummaryPrompt(language);
        const detailsPrompt = getDetailsPrompt(language);
        const fileListPrompt = getFileListPrompt(language);
        const fullPrompt = getFullLlmsTxtPrompt(language);

        const limit = pLimit(concurrency || 5);

        const pageInfos = await Promise.all(
          htmlFiles.map((file: string) =>
            limit(async () => {
              try {
                const html = fs.readFileSync(file, 'utf-8');
                let relUrl = path.relative(resolvedDistPath, file).replace(/\\/g, '/');
                if (!relUrl.startsWith('/')) relUrl = `/${relUrl}`;
                relUrl = relUrl.replace(/index\.html$/, '');
                relUrl = relUrl.replace(/^\/dist\//, '/');
                relUrl = relUrl.replace(/\/+/g, '/');
                const fullUrl = baseUrl + relUrl;

                const title = extractTagText(html, 'title');
                const metaDescription = extractMetaContent(html, 'description');
                const h1 = extractTagText(html, 'h1');

                // Content extraction with fallbacks
                const h2s = Array.from(html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi))
                  .map((m) => m[1].trim())
                  .join('\n');
                const h3s = Array.from(html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi))
                  .map((m) => m[1].trim())
                  .join('\n');
                const allPs = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
                  .map((m) => m[1].trim())
                  .join(' ');

                const kiInput = [title, h1, h2s, h3s, allPs].filter(Boolean).join('\n');
                const kiInputShort =
                  kiInput.length > maxInputLength ? kiInput.slice(0, maxInputLength) : kiInput;

                // Prompt selection logic
                let promptToUse = fullPrompt;
                if (title || h1) {
                  promptToUse = mainPrompt;
                } else if (h2s || h3s) {
                  promptToUse = fileListPrompt;
                } else if (allPs) {
                  promptToUse = detailsPrompt;
                }

                let summary = metaDescription || '';

                if (aiProvider) {
                  try {
                    const summaryOptions: AISummaryOptions = {
                      logger,
                      provider: aiProvider,
                      apiKey: aiApiKey,
                      model: aiModel,
                      prompt: promptToUse,
                      text: kiInputShort,
                      aiUrl,
                      cacheDir,
                      debug: options.debug || false,
                      cliCommand,
                    };
                    const aiSummary = await generateAISummary(summaryOptions);
                    if (aiSummary) {
                      summary = aiSummary;
                    }
                  } catch (e) {
                    logger.error(
                      `Error generating AI summary for ${relUrl}: ${e instanceof Error ? e.message : String(e)}`
                    );
                  }
                }

                return {
                  url: fullUrl,
                  title: title || h1 || relUrl,
                  summary: summary.trim(),
                  relUrl,
                  fullContent: kiInput, // Store full content for llms-full.txt
                };
              } catch (e) {
                logger.error(
                  `Failed to process ${file}: ${e instanceof Error ? e.message : String(e)}`
                );
                return null;
              }
            })
          )
        );

        const validPages = pageInfos.filter(
          (info): info is NonNullable<typeof info> => info !== null && info.summary.length > 0
        );

        if (!validPages.length) {
          logger.warn('No valid summaries generated. llms.txt will be empty or not generated.');
          return;
        }

        const sectionMap = new Map<string, typeof validPages>();
        validPages.forEach((info) => {
          const sectionMatch = /^\/([^/]+)\//.exec(info.relUrl);
          const section = sectionMatch ? sectionMatch[1] : 'General';
          if (!sectionMap.has(section)) {
            sectionMap.set(section, []);
          }
          sectionMap.get(section)!.push(info);
        });

        let llmsTxtContent = `# ${projectName}\n\n`;
        llmsTxtContent += `> ${description}\n\n`;

        let llmsFullContent = `# ${projectName} - Full Content\n\n`;

        sectionMap.forEach((entries, section) => {
          llmsTxtContent += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
          entries.forEach((info) => {
            llmsTxtContent += `- [${info.title}](${info.url}): ${info.summary}\n`;
            if (llmsFull) {
              llmsFullContent += `## ${info.title}\n\nURL: ${info.url}\n\n${info.fullContent}\n\n---\n\n`;
            }
          });
          llmsTxtContent += '\n';
        });

        const outPath = path.join(distPath, 'llms.txt');
        fs.writeFileSync(outPath, llmsTxtContent, { encoding: 'utf8' });
        logger.info(`Generated llms.txt at ${outPath}`);

        if (llmsFull) {
          const fullOutPath = path.join(distPath, 'llms-full.txt');
          fs.writeFileSync(fullOutPath, llmsFullContent, { encoding: 'utf8' });
          logger.info(`Generated llms-full.txt at ${fullOutPath}`);
        }
      },
    },
  };
}
