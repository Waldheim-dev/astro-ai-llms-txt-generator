import type { LlmsTxtOptions } from './types.js';
import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { generateLlmsTxtContent } from './formatter.js';
import { processAllFiles, type ProcessorLogger } from './processor.js';

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
 * @param options - Plugin configuration.
 * @returns Integration object with build hook.
 */
export default function llmsTxt(options: LlmsTxtOptions = {}) {
  return {
    name: 'llms-txt',
    hooks: {
      'astro:build:done': async ({ dir, logger }: { dir: URL; logger: AstroLogger }) => {
        const distPath = fileURLToPath(dir);
        const resolvedDistPath = path.resolve(distPath);

        // 1. Find Files
        const htmlFiles = await fg('**/*.html', { cwd: resolvedDistPath, absolute: true });

        if (!htmlFiles.length) {
          logger.warn('No HTML files found. Skipping llms.txt generation.');
          return;
        }

        // 2. Setup Cache
        const cacheDir = path.join(resolvedDistPath, '.llms-txt-cache');
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }

        // 3. Process Files (Extract & AI Summarize)
        // Adapt AstroLogger to ProcessorLogger (compatible signatures)
        const processorLogger: ProcessorLogger = logger;
        const validPages = await processAllFiles(
          htmlFiles,
          resolvedDistPath,
          options,
          processorLogger,
          cacheDir
        );

        if (!validPages.length) {
          logger.warn('No valid summaries generated. llms.txt will be empty or not generated.');
          return;
        }

        // 4. Generate Content (Format)
        const { short, full } = generateLlmsTxtContent(validPages, options);

        // 5. Write Files
        const outPath = path.join(distPath, 'llms.txt');
        fs.writeFileSync(outPath, short, { encoding: 'utf8' });
        logger.info(`Generated llms.txt at ${outPath}`);

        if (full && options.llmsFull) {
          const fullOutPath = path.join(distPath, 'llms-full.txt');
          fs.writeFileSync(fullOutPath, full, { encoding: 'utf8' });
          logger.info(`Generated llms-full.txt at ${fullOutPath}`);
        }
      },
    },
  };
}
