import type { LlmsTxtOptions } from './types';
import { getPrompt } from './prompt';
import { AISummaryOptions, generateAISummary } from './aiProvider';
import { extractMetaContent, extractTagText } from './extractHtml';
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';

/**
 * Astro Integration: llms.txt Generator
 *
 * This plugin generates an LLM-optimized llms.txt in the build output for every Astro build.
 * It extracts relevant content from all rendered HTML pages, summarizes them via AI, and outputs them with fully qualified web URLs.
 * Entries are grouped by root sections (e.g. /blog/, /services/).
 * @param options Plugin configuration
 * @returns Integration object with build hook
 */
export default function llmsTxt(options: LlmsTxtOptions = {}) {
  const logger = {
    info: (...args: unknown[]) => console.info(...args),
    warn: (...args: unknown[]) => console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
    debug: (...args: unknown[]) => console.debug(...args),
  };
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
  } = options;

  return {
    name: 'llms-txt',
    hooks: {
      'astro:build:done': async ({ dir }: { dir: string }) => {
        const distPath = fileURLToPath(dir);
        const resolvedDistPath = path.resolve(distPath);
        const htmlFiles = await fg('**/*.html', { cwd: resolvedDistPath, absolute: true });
        if (!htmlFiles.length) throw new Error('Build aborted: No HTML files found.');

        const cacheDir = path.join(resolvedDistPath, '.llms-txt-cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const baseUrl = site ? site.replace(/\/$/, '') : '';
        const aiPrompt = getPrompt(language);
        const pageInfos = await Promise.all(
          htmlFiles.map(async (file: string) => {
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
            const debug = options.debug || false;
            let summary = metaDescription || extractTagText(html, 'p');
            if (aiProvider && summary) {
              try {
                const summaryOptions: AISummaryOptions = {
                  logger: console,
                  provider: aiProvider,
                  apiKey: aiApiKey,
                  model: aiModel,
                  prompt: aiPrompt,
                  text: kiInputShort,
                  aiUrl,
                  cacheDir,
                  debug,
                };
                summary = await generateAISummary(summaryOptions);
              } catch (e) {
                // Fehlerbehandlung
                logger.error(
                  `Error generating AI summary: ${e instanceof Error ? e.message : String(e)}`
                );
              }
            }
            return { url: fullUrl, title: title || h1, summary };
          })
        );

        const validPages = pageInfos.filter(
          (info: { summary?: string }) => info.summary && info.summary.trim().length > 0
        );
        if (!validPages.length)
          throw new Error('Build aborted: No AI responses/summaries received.');

        const sectionMap = new Map();
        pageInfos.forEach((info) => {
          const execResult = /^\/([^/]+)\//.exec(
            (info as { url: string }).url.replace(baseUrl, '')
          );
          const section = execResult ? execResult[1] : 'Allgemein';
          if (!sectionMap.has(section)) sectionMap.set(section, []);
          sectionMap.get(section).push(info);
        });

        let llmsTxtContent = `# ${projectName}\n\n`;
        llmsTxtContent += `> ${description}\n\n`;
        Array.from(sectionMap.entries()).forEach(([section, entries]) => {
          llmsTxtContent += `## ${section.charAt(0).toUpperCase() + section.slice(1)}\n\n`;
          entries.forEach((info: { url: string; title: string; summary: string }) => {
            llmsTxtContent += `- [${info.url}](${info.url}): ${info.title} ${info.summary}\n`;
          });
          llmsTxtContent += '\n';
        });
        const outPath = path.join(distPath, 'llms.txt');
        fs.writeFileSync(outPath, llmsTxtContent, { encoding: 'utf8' });
      },
    },
  };
}
