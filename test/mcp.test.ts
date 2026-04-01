import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { generateMcpManifests, createMcpSseHandler } from '../src/mcp';
import type { PageInfo } from '../src/formatter';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

const PROJECT_ROOT = '/fake/project';

describe('mcp', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('generateMcpManifests', () => {
    it('writes manifests to .cursor/mcp.json, .vscode/mcp.json, and .mcp.json', () => {
      generateMcpManifests(PROJECT_ROOT, { siteUrl: 'https://docs.example.com' });

      const written = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls.map(
        (c: unknown[]) => c[0] as string
      );
      expect(written).toContain(path.join(PROJECT_ROOT, '.cursor', 'mcp.json'));
      expect(written).toContain(path.join(PROJECT_ROOT, '.vscode', 'mcp.json'));
      expect(written).toContain(path.join(PROJECT_ROOT, '.mcp.json'));
    });

    it('writes valid JSON with mcpServers containing the SSE server', () => {
      generateMcpManifests(PROJECT_ROOT, { siteUrl: 'https://docs.example.com' });

      const [, content] = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
      const manifest = JSON.parse(content) as { mcpServers: Record<string, { type: string; url: string }> };

      expect(manifest).toHaveProperty('mcpServers');
      expect(manifest.mcpServers['astro-docs']).toBeDefined();
      expect(manifest.mcpServers['astro-docs'].type).toBe('sse');
      expect(manifest.mcpServers['astro-docs'].url).toContain('/__mcp/sse');
    });

    it('uses custom serverPath when provided', () => {
      generateMcpManifests(PROJECT_ROOT, {
        siteUrl: 'https://example.com',
        serverPath: '/custom/mcp',
      });

      const [, content] = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
      const manifest = JSON.parse(content) as { mcpServers: Record<string, { url: string }> };
      expect(manifest.mcpServers['astro-docs'].url).toContain('/custom/mcp');
    });

    it('registers llms-full.txt as an additional resource when llmsFullPath is set', () => {
      generateMcpManifests(PROJECT_ROOT, {
        siteUrl: 'https://example.com',
        llmsFullPath: 'llms-full.txt',
      });

      const [, content] = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0] as [string, string];
      const manifest = JSON.parse(content) as { mcpServers: Record<string, { url: string }> };
      expect(manifest.mcpServers['astro-docs-full']).toBeDefined();
      expect(manifest.mcpServers['astro-docs-full'].url).toContain('llms-full.txt');
    });

    it('creates directories if they do not exist', () => {
      generateMcpManifests(PROJECT_ROOT, { siteUrl: 'https://example.com' });
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(PROJECT_ROOT, '.cursor'),
        { recursive: true }
      );
      expect(fs.mkdirSync).toHaveBeenCalledWith(
        path.join(PROJECT_ROOT, '.vscode'),
        { recursive: true }
      );
    });

    it('skips mkdirSync when directory already exists', () => {
      (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      generateMcpManifests(PROJECT_ROOT, { siteUrl: 'https://example.com' });
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('createMcpSseHandler', () => {
    const mockPages: PageInfo[] = [
      { url: 'https://example.com/docs', title: 'Docs', summary: 'Documentation', relUrl: '/docs' },
    ];

    function makeMockRes() {
      return {
        setHeader: vi.fn(),
        write: vi.fn(),
        end: vi.fn(),
      };
    }

    it('sets Content-Type to text/event-stream', () => {
      const handler = createMcpSseHandler(() => mockPages);
      const res = makeMockRes();
      handler({}, res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    });

    it('calls res.end after writing the response', () => {
      const handler = createMcpSseHandler(() => mockPages);
      const res = makeMockRes();
      handler({}, res);
      expect(res.end).toHaveBeenCalled();
    });

    it('writes a JSON-RPC 2.0 resources/list response', () => {
      const handler = createMcpSseHandler(() => mockPages);
      const res = makeMockRes();
      handler({}, res);

      const written = (res.write.mock.calls[0] as string[])[0];
      expect(written).toMatch(/^data: /);
      const json = JSON.parse(written.slice('data: '.length).trim()) as {
        jsonrpc: string;
        result: { resources: { uri: string; name: string }[] };
      };
      expect(json.jsonrpc).toBe('2.0');
      expect(json.result.resources).toHaveLength(1);
      expect(json.result.resources[0].name).toBe('Docs');
      expect(json.result.resources[0].uri).toBe('https://example.com/docs');
    });

    it('returns CORS header', () => {
      const handler = createMcpSseHandler(() => []);
      const res = makeMockRes();
      handler({}, res);
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    });
  });
});
