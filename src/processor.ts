import fs from 'node:fs';
import path from 'node:path';
import pLimit from 'p-limit';
import type { LlmsTxtOptions } from './types.js';
import {
  getMainSummaryPrompt,
  getDetailsPrompt,
  getFileListPrompt,
  getFullLlmsTxtPrompt,
} from './prompt.js';
import { extractAllTagsText, extractMetaContent, extractTagText } from './extractHtml.js';
import { AISummaryOptions, generateAISummary } from './aiProvider.js';
import type { PageInfo } from './formatter.js';

export interface ProcessorLogger {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

/**
 * Processes a single HTML file to extract information and generate a summary.
 * @param file - The absolute path to the HTML file.
 * @param resolvedDistPath - The resolved path to the distribution directory.
 * @param options - The plugin configuration options.
 * @param logger - The logger instance.
 * @param cacheDir - The directory for caching AI responses.
 * @returns A promise resolving to the PageInfo or null if processing failed.
 */
async function processFile(
  file: string,
  resolvedDistPath: string,
  options: LlmsTxtOptions,
  logger: ProcessorLogger,
  cacheDir: string
): Promise<PageInfo | null> {
  const {
    site = '',
    maxInputLength = 8000,
    language = 'en',
    aiProvider,
    aiApiKey,
    aiModel,
    aiUrl,
    cliCommand,
  } = options;

  const baseUrl = site ? site.replace(/\/$/, '') : '';

  try {
    const html = fs.readFileSync(file, 'utf-8');
    let relUrl = path.relative(resolvedDistPath, file).replace(/\\/g, '/');
    if (!relUrl.startsWith('/')) relUrl = `/${relUrl}`;
    relUrl = relUrl.replace(/\.html$/, ''); // Remove .html extension
    relUrl = relUrl.replace(/\/index$/, '/'); // index.html -> /
    relUrl = relUrl.replace(/^\/dist\//, '/');
    relUrl = relUrl.replace(/\/+/g, '/');
    const fullUrl = baseUrl + relUrl;

    const title = extractTagText(html, 'title');
    const metaDescription = extractMetaContent(html, 'description');
    const h1 = extractTagText(html, 'h1');

    // Content extraction
    const h2s = extractAllTagsText(html, 'h2').join('\n');
    const h3s = extractAllTagsText(html, 'h3').join('\n');
    const allPs = extractAllTagsText(html, 'p').join(' ');

    const kiInput = [title, h1, h2s, h3s, allPs].filter(Boolean).join('\n');
    const kiInputShort =
      kiInput.length > maxInputLength ? kiInput.slice(0, maxInputLength) : kiInput;

    // Prompt selection logic
    let promptToUse = getFullLlmsTxtPrompt(language);
    if (title || h1) {
      promptToUse = getMainSummaryPrompt(language);
    } else if (h2s || h3s) {
      promptToUse = getFileListPrompt(language);
    } else if (allPs) {
      promptToUse = getDetailsPrompt(language);
    }

    let summary = metaDescription || '';

    if (aiProvider) {
      try {
        // Fallback to environment variables if no API key is provided in options
        let envKey = '';
        if (aiProvider === 'gemini') {
          envKey = process.env.GEMINI_API_KEY || '';
        } else if (aiProvider === 'openai') {
          envKey = process.env.OPENAI_API_KEY || '';
        } else if (aiProvider === 'claude') {
          envKey = process.env.ANTHROPIC_API_KEY || '';
        }

        const summaryOptions: AISummaryOptions = {
          logger,
          provider: aiProvider,
          apiKey: aiApiKey || envKey,
          model: aiModel || '',
          prompt: promptToUse,
          text: kiInputShort,
          aiUrl,
          cacheDir,
          debug: options.debug || false,
          cliCommand,
          geminiThinkingLevel: options.geminiThinkingLevel,
          geminiThinkingBudget: options.geminiThinkingBudget,
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
      fullContent: kiInput,
    };
  } catch (e) {
    logger.error(`Failed to process ${file}: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

/**
 * Batches and processes all HTML files.
 * @param files - List of file paths.
 * @param resolvedDistPath - Resolved dist path.
 * @param options - Plugin options.
 * @param logger - Logger.
 * @param cacheDir - Cache directory.
 * @returns Array of valid PageInfo objects.
 */
export async function processAllFiles(
  files: string[],
  resolvedDistPath: string,
  options: LlmsTxtOptions,
  logger: ProcessorLogger,
  cacheDir: string
): Promise<PageInfo[]> {
  const limit = pLimit(options.concurrency || 5);

  const results = await Promise.all(
    files.map((file) => limit(() => processFile(file, resolvedDistPath, options, logger, cacheDir)))
  );

  return results.filter((info): info is PageInfo => info !== null && info.summary.length > 0);
}
