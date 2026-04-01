# @waldheimdev/astro-ai-llms-txt

[![npm version](https://img.shields.io/npm/v/@waldheimdev/astro-ai-llms-txt.svg)](https://www.npmjs.com/package/@waldheimdev/astro-ai-llms-txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Waldheim-dev/astro-ai-llms-txt-generator/actions/workflows/release.yml/badge.svg)](https://github.com/Waldheim-dev/astro-ai-llms-txt-generator/actions)

An Astro integration that automatically generates LLM-optimized `llms.txt` and `llms-full.txt` files in your build output. It uses AI to summarize your pages, making them perfectly digestible for Large Language Models.

Follows the [llms.txt](https://llmstxt.org/) standard.

## 🚀 Features

- 🤖 **AI-Powered Summarization**: Uses OpenAI, Google Gemini, Anthropic Claude, or local Ollama models.
- 💻 **CLI Provider**: Use any CLI tool (e.g., `gemini-cli`, `copilot-cli`, `claude-code`) as a provider.
- 📂 **Automatic Sectioning**: Groups pages by their root directories (e.g., `/blog/`, `/docs/`).
- ⚡ **Concurrency Control**: Limit simultaneous AI requests to avoid rate limits.
- 📜 **Full Content Support**: Optionally generate `llms-full.txt` — in Markdown or XML (`<document>`) format.
- 💾 **Caching**: AI responses are cached locally (`.llms-txt-cache/`) to speed up subsequent builds.
- 🌍 **Multi-language Support**: Customize prompts based on your site's language (`en`, `de`, `fr`).
- 🔍 **GEO Linter**: Build-time warnings for content that may be hard for LLMs to interpret (word count, untagged code fences).
- 🗄️ **Astro 5 DataStore Adapter**: Pull content directly from an Astro 5 DataStore instead of HTML files.
- 🔪 **Chunking Pipeline**: Split full-content output into fixed, recursive, structure-aware, or semantic chunks — exportable as JSONL.
- 🔌 **MCP Integration**: Auto-generate `.cursor/mcp.json`, `.vscode/mcp.json`, and `.mcp.json` at build time, and serve a live Model Context Protocol SSE endpoint during `astro dev`.
- 🏷️ **`data-llm` Metadata**: Embed structured JSON metadata on any HTML element for LLM consumption.
- 🛠️ **Robust & Fast**: Optimized for Astro 5+ and Node 24+.

## 📋 Requirements

- **Node.js**: 24.x or higher
- **Astro**: 5.0.0 or higher, including Astro 6.x

## 📦 Installation

```bash
npm install @waldheimdev/astro-ai-llms-txt
```

## 🛠️ Usage

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import llmsTxt from '@waldheimdev/astro-ai-llms-txt';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    llmsTxt({
      projectName: 'My Awesome Project',
      description: 'A deep dive into awesome things.',
      aiProvider: 'openai',
      aiApiKey: process.env.OPENAI_API_KEY,
      aiModel: 'gpt-4o-mini',
      llmsFull: true,
    }),
  ],
});
```

### 🧠 AI Provider Examples

#### Anthropic Claude

```javascript
llmsTxt({
  aiProvider: 'claude',
  aiApiKey: process.env.ANTHROPIC_API_KEY,
  aiModel: 'claude-3-5-sonnet-latest',
});
```

#### Google Gemini

```javascript
llmsTxt({
  aiProvider: 'gemini',
  aiApiKey: process.env.GEMINI_API_KEY,
  aiModel: 'gemini-2.5-flash',
  // Optional: enable extended thinking
  geminiThinkingLevel: 'low', // 'low' | 'medium' | 'high' | 'minimal'
  geminiThinkingBudget: 1024,
});
```

#### Local LLM (Ollama)

```javascript
llmsTxt({
  aiProvider: 'ollama',
  aiModel: 'llama3', // ensure this model is pulled in Ollama
});
```

#### CLI Tool Provider

Use any CLI tool that accepts a prompt + text via stdin and returns the summary on stdout.

```javascript
llmsTxt({
  aiProvider: 'cli',
  cliCommand: 'gemini summarize',
});
```

---

## ✅ GEO Linter

The GEO (Generative Engine Optimization) linter runs automatically during every build and emits warnings for pages that may be difficult for LLMs to consume:

- Content exceeding 400 words — consider splitting into smaller sections.
- Code fences without a language tag — add a language identifier (e.g., ` ```typescript`).

To disable the linter:

```javascript
llmsTxt({ geoLinter: false });
```

---

## 📄 Full Content Formats

### Markdown (default)

```javascript
llmsTxt({ llmsFull: true }); // generates llms-full.txt in Markdown
```

### XML (`<document>` tags, compatible with Anthropic prompt format)

```javascript
llmsTxt({ llmsFull: true, llmsFullFormat: 'xml' });
```

---

## 🗄️ Astro 5 DataStore Adapter

Pull content from an Astro 5 DataStore instead of scanning HTML output files. Useful for content-collection-heavy sites.

```javascript
llmsTxt({ contentSource: 'datastore' }); // use DataStore only
llmsTxt({ contentSource: 'auto' });      // prefer DataStore, fall back to HTML
llmsTxt({ contentSource: 'html' });      // default: scan HTML build output
```

DataStore entries may include the following data fields:

| Field           | Type      | Description                                      |
| :-------------- | :-------- | :----------------------------------------------- |
| `title`         | `string`  | Page title                                       |
| `description`   | `string`  | Page summary / meta description                  |
| `llmsOptional`  | `boolean` | When `true`, page is placed in `## Optional`     |

---

## 🔪 Chunking Pipeline

Generate semantically segmented output alongside `llms-full.txt`. Useful for embedding pipelines and RAG systems.

```javascript
llmsTxt({
  llmsFull: true,
  chunking: {
    strategy: 'structure', // 'none' | 'fixed' | 'recursive' | 'structure' | 'semantic'
    chunkSize: 1500,        // characters per chunk (for fixed/recursive)
    chunkOverlap: 200,      // overlap between adjacent chunks
  },
  chunkExport: 'jsonl',     // writes llms-chunks.jsonl to the build output
});
```

### Chunking Strategies

| Strategy    | Description                                                                   |
| :---------- | :---------------------------------------------------------------------------- |
| `none`      | No chunking (default)                                                         |
| `fixed`     | Split at exact character boundaries                                           |
| `recursive` | Split at sentence/paragraph boundaries with overlap                           |
| `structure` | Split on Markdown headings and blank-line separated blocks                    |
| `semantic`  | Embedding-based semantic similarity split (requires `@xenova/transformers`)   |

> **Note:** The `semantic` strategy requires the optional peer dependency `@xenova/transformers`:
> ```bash
> npm install @xenova/transformers
> ```

### JSONL Export Format

Each line in `llms-chunks.jsonl` is a JSON object:

```json
{
  "text": "chunk content...",
  "metadata": { "title": "Page Title", "filePath": "/docs/guide", "topic": "guide", "index": 0 },
  "formatted": "# Page Title\n\nchunk content..."
}
```

---

## 🔌 MCP Integration (Model Context Protocol)

Enable the MCP integration to make your site's content available to AI coding assistants (Cursor, VS Code, etc.).

```javascript
llmsTxt({ mcp: true }); // enable with defaults
```

Or with fine-grained control:

```javascript
llmsTxt({
  mcp: {
    manifests: true,          // write .cursor/mcp.json, .vscode/mcp.json, .mcp.json at build
    devServer: true,          // serve a live SSE endpoint during `astro dev`
    serverPath: '/__mcp/sse', // custom endpoint path
  },
});
```

### Generated Files

At build time the following manifest files are written to your project root:

- `.cursor/mcp.json`
- `.vscode/mcp.json`
- `.mcp.json`

Each manifest registers:
- `astro-docs` — SSE server pointing to `<siteUrl><serverPath>`
- `astro-docs-full` — direct URL to `llms-full.txt` (when `llmsFull: true`)

### Dev Server SSE Endpoint

During `astro dev`, a live SSE endpoint is available at `/__mcp/sse` (or your custom `serverPath`). It responds with a JSON-RPC 2.0 `resources/list` message containing all pages processed in the last build.

---

## 🏷️ `data-llm` Metadata

Embed structured JSON metadata directly on any HTML element to include it in `llms-full.txt`:

```html
<div data-llm='{"type":"pricing","product":"Pro","monthly_cost":29}'>
  Pro Plan — $29/month
</div>
```

The metadata is extracted at build time and appended as LLM-readable comments to the full-content section of that page:

```
<!-- LLM Metadata [div]: {"type":"pricing","product":"Pro","monthly_cost":29} -->
```

---

## 🔖 `llms-optional` Meta Tag

Mark pages as optional in the `llms.txt` spec by adding:

```html
<meta name="llms-optional" content="true" />
```

Optional pages are grouped under a separate `## Optional` section in `llms.txt`.

---

## ⚙️ Configuration Options

| Option                  | Type                          | Default          | Description                                                                       |
| :---------------------- | :---------------------------- | :--------------- | :-------------------------------------------------------------------------------- |
| `projectName`           | `string`                      | `'Projectname'`  | H1 title in `llms.txt`                                                            |
| `description`           | `string`                      | `'Auto-generated...'` | Blockquote description in `llms.txt`                                         |
| `aiProvider`            | `string`                      | `'ollama'`       | `openai`, `gemini`, `claude`, `ollama`, or `cli`                                  |
| `aiApiKey`              | `string`                      | `''`             | API key for the selected provider                                                 |
| `aiModel`               | `string`                      | `'llama3'`       | Model name                                                                        |
| `cliCommand`            | `string`                      | `'cat'`          | CLI command when `aiProvider` is `cli`                                            |
| `llmsFull`              | `boolean`                     | `false`          | Generate `llms-full.txt`                                                          |
| `llmsFullFormat`        | `'markdown' \| 'xml'`         | `'markdown'`     | Output format for `llms-full.txt`                                                 |
| `concurrency`           | `number`                      | `5`              | Max simultaneous AI requests                                                      |
| `language`              | `string`                      | `'en'`           | Prompt language (`en`, `de`, `fr`)                                                |
| `maxInputLength`        | `number`                      | `8000`           | Max characters sent to AI per page                                                |
| `debug`                 | `boolean`                     | `false`          | Verbose logging                                                                   |
| `geoLinter`             | `boolean`                     | `true`           | Run GEO linter during build                                                       |
| `contentSource`         | `'html' \| 'datastore' \| 'auto'` | `'html'`     | Content source for extraction                                                     |
| `chunking`              | `ChunkingOptions`             | `undefined`      | Chunking configuration (see [Chunking Pipeline](#-chunking-pipeline))             |
| `chunkExport`           | `'none' \| 'jsonl'`           | `'none'`         | Export chunked output as `llms-chunks.jsonl`                                      |
| `mcp`                   | `McpOptions \| boolean`       | `undefined`      | MCP integration (see [MCP Integration](#-mcp-integration-model-context-protocol)) |
| `geminiThinkingLevel`   | `'low' \| 'medium' \| 'high' \| 'minimal'` | `undefined` | Gemini thinking level                                                  |
| `geminiThinkingBudget`  | `number`                      | `undefined`      | Gemini thinking token budget                                                      |
| `site`                  | `string`                      | `''`             | Base URL (usually set via Astro's `site` config)                                  |

### `ChunkingOptions`

| Option               | Type      | Default | Description                                               |
| :------------------- | :-------- | :------ | :-------------------------------------------------------- |
| `strategy`           | `string`  | `'none'`| Chunking strategy (see Chunking Strategies table)         |
| `chunkSize`          | `number`  | `1500`  | Target chunk size in characters                           |
| `chunkOverlap`       | `number`  | `200`   | Character overlap between adjacent chunks                 |
| `similarityThreshold`| `number`  | `0.5`   | Cosine similarity threshold for semantic chunking         |

### `McpOptions`

| Option       | Type      | Default        | Description                                               |
| :----------- | :-------- | :------------- | :-------------------------------------------------------- |
| `manifests`  | `boolean` | `true`         | Write MCP manifest files during build                     |
| `devServer`  | `boolean` | `true`         | Serve SSE endpoint during `astro dev`                     |
| `serverPath` | `string`  | `'/__mcp/sse'` | SSE endpoint path                                         |

---

## 📄 License

MIT © [Waldheim-dev](https://github.com/Waldheim-dev)
