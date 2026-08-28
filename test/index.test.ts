import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import fg from 'fast-glob';
import { processAllFiles } from '../src/processor';
import { generateLlmsTxtContent } from '../src/formatter';
import { generateMcpManifests, createMcpSseHandler } from '../src/mcp';
import { chunkContent, formatChunkWithMetadata } from '../src/chunker';
import type { PageInfo } from '../src/formatter';

vi.mock('fast-glob', () => ({ default: vi.fn() }));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

vi.mock('../src/processor', () => ({ processAllFiles: vi.fn() }));
vi.mock('../src/formatter', () => ({ generateLlmsTxtContent: vi.fn() }));
vi.mock('../src/mcp', () => ({
  generateMcpManifests: vi.fn(),
  createMcpSseHandler: vi.fn().mockReturnValue(vi.fn()),
}));
vi.mock('../src/chunker', () => ({
  chunkContent: vi.fn(),
  formatChunkWithMetadata: vi.fn().mockReturnValue('formatted chunk'),
}));

const DIR = new URL('file:///tmp/test-dist/');

const PAGES: PageInfo[] = [
  { url: 'https://example.com/', title: 'Home', summary: 'Home page', relUrl: '/', fullContent: 'Content' },
];

describe('llmsTxt plugin', () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (fg as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(['/tmp/test-dist/index.html']);
    (processAllFiles as ReturnType<typeof vi.fn>).mockResolvedValue(PAGES);
    (generateLlmsTxtContent as ReturnType<typeof vi.fn>).mockReturnValue({ short: 'SHORT', full: undefined });
  });

  it('exports a function', async () => {
    const { default: llmsTxt } = await import('../src/index');
    expect(typeof llmsTxt).toBe('function');
  });

  it('returns an integration object with all three hooks', async () => {
    const { default: llmsTxt } = await import('../src/index');
    const integration = llmsTxt();
    expect(integration).toHaveProperty('name', 'llms-txt');
    expect(typeof integration.hooks['astro:build:done']).toBe('function');
    expect(typeof integration.hooks['astro:config:done']).toBe('function');
    expect(typeof integration.hooks['astro:server:setup']).toBe('function');
  });

  describe('astro:config:done', () => {
    it('captures project root from config', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: true });
      // should not throw
      integration.hooks['astro:config:done']({
        config: { root: new URL('file:///my-project/') },
      });
    });
  });

  describe('astro:server:setup', () => {
    it('does nothing when mcp is not set', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt();
      const server = { middlewares: { use: vi.fn() } };
      integration.hooks['astro:server:setup']({ server });
      expect(server.middlewares.use).not.toHaveBeenCalled();
    });

    it('registers SSE middleware when mcp is true', async () => {
      const { default: llmsTxt } = await import('../src/index');
      // Make the mock invoke the pages getter so the arrow-function body is covered
      (createMcpSseHandler as ReturnType<typeof vi.fn>).mockImplementation(
        (getter: () => unknown[]) => { void getter(); return vi.fn(); }
      );
      const integration = llmsTxt({ mcp: true });
      const server = { middlewares: { use: vi.fn() } };
      integration.hooks['astro:server:setup']({ server });
      expect(server.middlewares.use).toHaveBeenCalledOnce();
    });

    it('registers SSE middleware when mcp is an object with devServer not false', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: { devServer: true, serverPath: '/custom/sse' } });
      const server = { middlewares: { use: vi.fn() } };
      integration.hooks['astro:server:setup']({ server });
      expect(server.middlewares.use).toHaveBeenCalledWith('/custom/sse', expect.any(Function));
    });

    it('skips middleware when mcp.devServer is false', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: { devServer: false } });
      const server = { middlewares: { use: vi.fn() } };
      integration.hooks['astro:server:setup']({ server });
      expect(server.middlewares.use).not.toHaveBeenCalled();
    });

    it('passes errors to next() when createMcpSseHandler throws', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (createMcpSseHandler as ReturnType<typeof vi.fn>).mockReturnValue(() => {
        throw new Error('handler error');
      });
      const integration = llmsTxt({ mcp: true });
      const server = { middlewares: { use: vi.fn() } };
      integration.hooks['astro:server:setup']({ server });

      // Extract and invoke the registered middleware
      const [, middleware] = (server.middlewares.use as ReturnType<typeof vi.fn>).mock.calls[0] as [string, (req: unknown, res: unknown, next: (e?: unknown) => void) => void];
      const next = vi.fn();
      middleware({}, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('astro:build:done', () => {
    it('warns and returns early when no HTML files are found', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (fg as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const integration = llmsTxt();
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('No HTML files found'));
      expect(processAllFiles).not.toHaveBeenCalled();
    });

    it('creates cache directory when it does not exist', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt();
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it('skips cache dir creation when it already exists', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const integration = llmsTxt();
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('writes a valid header when no valid pages are generated', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (processAllFiles as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const integration = llmsTxt();
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('No valid summaries'));
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('llms.txt'),
        'SHORT',
        { encoding: 'utf8' }
      );
    });

    it('writes llms.txt and logs success', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ site: 'https://example.com' });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('llms.txt'),
        'SHORT',
        { encoding: 'utf8' }
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('llms.txt'));
    });

    it('writes llms-full.txt when llmsFull is enabled', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (generateLlmsTxtContent as ReturnType<typeof vi.fn>).mockReturnValue({ short: 'SHORT', full: 'FULL' });
      const integration = llmsTxt({ llmsFull: true });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('llms-full.txt'),
        'FULL',
        { encoding: 'utf8' }
      );
    });

    it('does not write llms-full.txt when full is undefined', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (generateLlmsTxtContent as ReturnType<typeof vi.fn>).mockReturnValue({ short: 'SHORT', full: undefined });
      const integration = llmsTxt({ llmsFull: true });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      const writeCalls = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0] as string
      );
      expect(writeCalls.some((p) => p.includes('llms-full'))).toBe(false);
    });

    it('writes llms-chunks.jsonl when chunking + chunkExport are configured', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (chunkContent as ReturnType<typeof vi.fn>).mockResolvedValue([
        { text: 'chunk', metadata: { title: 'Home', filePath: '/', topic: 'Home', index: 0 } },
      ]);
      const integration = llmsTxt({
        chunking: { strategy: 'structure' },
        chunkExport: 'jsonl',
      });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('llms-chunks.jsonl'),
        expect.any(String),
        { encoding: 'utf8' }
      );
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('llms-chunks.jsonl'));
    });

    it('skips JSONL export when chunking strategy is none', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ chunking: { strategy: 'none' }, chunkExport: 'jsonl' });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(chunkContent).not.toHaveBeenCalled();
    });

    it('skips JSONL export when pages have no fullContent', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (processAllFiles as ReturnType<typeof vi.fn>).mockResolvedValue([
        { url: 'https://example.com/', title: 'Home', summary: 'S', relUrl: '/' },
      ]);
      const integration = llmsTxt({ chunking: { strategy: 'structure' }, chunkExport: 'jsonl' });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(chunkContent).not.toHaveBeenCalled();
    });

    it('generates MCP manifests when mcp is true', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: true, site: 'https://example.com' });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(generateMcpManifests).toHaveBeenCalledOnce();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('MCP manifests'));
    });

    it('generates MCP manifests with empty siteUrl when site option is omitted', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: true });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      const [, opts] = (generateMcpManifests as ReturnType<typeof vi.fn>).mock.calls[0] as [string, { siteUrl: string }];
      expect(opts.siteUrl).toBe('');
    });

    it('generates MCP manifests with llmsFullPath when llmsFull is set', async () => {
      const { default: llmsTxt } = await import('../src/index');
      (generateLlmsTxtContent as ReturnType<typeof vi.fn>).mockReturnValue({ short: 'S', full: 'F' });
      const integration = llmsTxt({ mcp: true, llmsFull: true, site: 'https://example.com' });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      const [, opts] = (generateMcpManifests as ReturnType<typeof vi.fn>).mock.calls[0] as [string, { llmsFullPath?: string }];
      expect(opts.llmsFullPath).toBe('llms-full.txt');
    });

    it('skips MCP manifests when mcp.manifests is false', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt({ mcp: { manifests: false } });
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(generateMcpManifests).not.toHaveBeenCalled();
    });

    it('does not generate MCP manifests when mcp is not set', async () => {
      const { default: llmsTxt } = await import('../src/index');
      const integration = llmsTxt();
      await integration.hooks['astro:build:done']({ dir: DIR, logger });
      expect(generateMcpManifests).not.toHaveBeenCalled();
    });
  });
});
