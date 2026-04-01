import fs from 'node:fs';
import path from 'node:path';
import type { PageInfo } from './formatter.js';

export interface McpManifestOptions {
  /** Base URL of the deployed site (used to register llms-full.txt as a resource). */
  siteUrl: string;
  /** SSE endpoint path (default: '/__mcp/sse'). */
  serverPath?: string;
  /** When provided, registers llms-full.txt as an MCP resource in the manifest. */
  llmsFullPath?: string;
}

interface McpServer {
  type: string;
  url: string;
}

interface McpManifest {
  mcpServers: Record<string, McpServer>;
}

/**
 * Writes MCP manifests to the project root so IDEs can auto-discover the local
 * MCP server.  Three files are created:
 *   .cursor/mcp.json
 *   .vscode/mcp.json
 *   .mcp.json
 *
 * Each manifest registers the local SSE endpoint and, optionally, the
 * llms-full.txt resource for direct context injection.
 *
 * @param projectRoot - Absolute path to the Astro project root.
 * @param options - Manifest generation options.
 */
export function generateMcpManifests(projectRoot: string, options: McpManifestOptions): void {
  const { siteUrl, serverPath = '/__mcp/sse', llmsFullPath } = options;

  const localSseUrl = `http://localhost:4321${serverPath}`;

  const manifest: McpManifest = {
    mcpServers: {
      'astro-docs': {
        type: 'sse',
        url: localSseUrl,
      },
    },
  };

  if (llmsFullPath) {
    const base = siteUrl.replace(/\/$/, '');
    manifest.mcpServers['astro-docs-full'] = {
      type: 'sse',
      url: `${base}/llms-full.txt`,
    };
  }

  const manifestJson = JSON.stringify(manifest, null, 2);

  const targets: string[] = [
    path.join(projectRoot, '.cursor', 'mcp.json'),
    path.join(projectRoot, '.vscode', 'mcp.json'),
    path.join(projectRoot, '.mcp.json'),
  ];

  for (const target of targets) {
    const dir = path.dirname(target);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(target, manifestJson, { encoding: 'utf8' });
  }
}

/**
 * Creates an HTTP handler that implements a minimal MCP SSE endpoint.
 *
 * The handler responds to GET requests with:
 *   Content-Type: text/event-stream
 *   A JSON-RPC 2.0 resources/list response containing all current pages.
 *
 * Designed to be registered as a Vite/Connect middleware:
 *   server.middlewares.use('/__mcp/sse', createMcpSseHandler(getPages))
 *
 * @param getPages - A function that returns the current list of pages.
 */
export function createMcpSseHandler(
  getPages: () => PageInfo[]
): (req: unknown, res: unknown) => void {
  return (_req: unknown, res: unknown) => {
    const response = res as {
      setHeader: (key: string, val: string) => void;
      write: (data: string) => void;
      end: () => void;
    };

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.setHeader('Access-Control-Allow-Origin', '*');

    const pages = getPages();
    const resources = pages.map((p) => ({
      uri: p.url,
      name: p.title,
      description: p.summary,
      mimeType: 'text/markdown',
    }));

    const jsonRpcResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: { resources },
    };

    response.write(`data: ${JSON.stringify(jsonRpcResponse)}\n\n`);
    response.end();
  };
}
