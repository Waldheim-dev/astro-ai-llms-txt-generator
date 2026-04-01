import type { LlmsTxtOptions } from './types.js';
import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { fileURLToPath } from 'node:url';
import { generateLlmsTxtContent } from './formatter.js';
import { processAllFiles, type ProcessorLogger } from './processor.js';
import { chunkContent, formatChunkWithMetadata } from './chunker.js';
import { generateMcpManifests, createMcpSseHandler } from './mcp.js';
import type { PageInfo } from './formatter.js';

interface AstroLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

interface AstroDevServer {
  middlewares: {
    use: (
      path: string,
      handler: (req: unknown, res: unknown, next: (err?: unknown) => void) => void
    ) => void;
  };
}

/**
 * Astro Integration: llms.txt Generator
 *
 * This plugin generates an LLM-optimized llms.txt in the build output for every Astro build.
 * @param options - Plugin configuration.
 * @returns Integration object with build hook.
 */
export default function llmsTxt(options: LlmsTxtOptions = {}) {
  // Mutable state shared between hooks inside the closure
  let projectRoot = process.cwd();
  const cachedPages: PageInfo[] = [];

  return {
    name: 'llms-txt',
    hooks: {
      // Capture the project root early so MCP manifests can be written there
      'astro:config:done': ({ config }: { config: { root: URL } }) => {
        projectRoot = fileURLToPath(config.root);
      },

      // Register local MCP SSE server during `astro dev`
      'astro:server:setup': ({ server }: { server: AstroDevServer }) => {
        if (!options.mcp) return;
        const mcpOpts = typeof options.mcp === 'object' ? options.mcp : {};
        if (mcpOpts.devServer === false) return;
        const serverPath = mcpOpts.serverPath ?? '/__mcp/sse';
        server.middlewares.use(serverPath, (req, res, next) => {
          try {
            createMcpSseHandler(() => [...cachedPages])(req, res);
          } catch (e) {
            next(e);
          }
        });
      },

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

        // 3. Process Files (Extract & AI Summarize; GEO linter runs inside processAllFiles)
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

        // Cache pages for the MCP SSE server (used in dev mode)
        cachedPages.splice(0, cachedPages.length, ...validPages);

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

        // 6. Chunked export (optional)
        const chunkStrategy = options.chunking?.strategy;
        if (chunkStrategy && chunkStrategy !== 'none' && options.chunkExport === 'jsonl') {
          const pagesWithContent = validPages.filter((p) => p.fullContent);
          const chunkArrays = await Promise.all(
            pagesWithContent.map((page) =>
              chunkContent(page.fullContent!, page.title, page.relUrl, options.chunking)
            )
          );
          const allChunks = chunkArrays
            .flat()
            .map((chunk) =>
              JSON.stringify({ ...chunk, formatted: formatChunkWithMetadata(chunk) })
            );
          if (allChunks.length > 0) {
            const jsonlPath = path.join(distPath, 'llms-chunks.jsonl');
            fs.writeFileSync(jsonlPath, allChunks.join('\n'), { encoding: 'utf8' });
            logger.info(`Generated llms-chunks.jsonl (${allChunks.length} chunks) at ${jsonlPath}`);
          }
        }

        // 7. MCP manifests
        if (options.mcp) {
          const mcpOpts = typeof options.mcp === 'object' ? options.mcp : {};
          if (mcpOpts.manifests !== false) {
            generateMcpManifests(projectRoot, {
              siteUrl: options.site ?? '',
              serverPath: mcpOpts.serverPath,
              llmsFullPath: options.llmsFull ? 'llms-full.txt' : undefined,
            });
            logger.info('Generated MCP manifests (.cursor/mcp.json, .vscode/mcp.json, .mcp.json)');
          }
        }
      },
    },
  };
}
