# @waldheimdev/astro-ai-llms-txt

[![npm version](https://img.shields.io/npm/v/@waldheimdev/astro-ai-llms-txt.svg)](https://www.npmjs.com/package/@waldheimdev/astro-ai-llms-txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/Waldheim-dev/astro-ai-llms-txt-generator/actions/workflows/release.yml/badge.svg)](https://github.com/Waldheim-dev/astro-ai-llms-txt-generator/actions)

An Astro integration that automatically generates LLM-optimized `llms.txt` and `llms-full.txt` files in your build output. It uses AI to summarize your pages, making them perfectly digestible for Large Language Models.

Follows the [llms.txt](https://llmstxt.org/) standard.

## 🚀 Features

- 🤖 **AI-Powered Summarization**: Uses OpenAI, Google Gemini, Anthropic Claude, or local Ollama models.
- 💻 **CLI Provider**: Use your favorite CLI tools (like `gemini-cli`, `copilot-cli`, or `claude-code`) as a provider.
- 📂 **Automatic Sectioning**: Groups pages by their root directories (e.g., `/blog/`, `/docs/`).
- ⚡ **Concurrency Control**: Limit simultaneous AI requests to avoid rate limits.
- 📜 **Full Content Support**: Optionally generate `llms-full.txt` containing all page contents.
- 💾 **Caching**: AI responses are cached locally (`.llms-txt-cache/`) to speed up subsequent builds and save costs.
- 🌍 **Multi-language Support**: Customize prompts based on your site's language (`en`, `de`, `fr`).
- 🛠️ **Robust & Fast**: Optimized for Astro 5+ and Node 24+.

## 📋 Requirements

- **Node.js**: 24.x or higher
- **Astro**: 5.0.0 or higher

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
      aiProvider: 'openai', // 'openai', 'gemini', 'claude', 'ollama', or 'cli'
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
  aiModel: 'gemini-1.5-flash',
});
```

#### Local LLM (Ollama)

```javascript
llmsTxt({
  aiProvider: 'ollama',
  aiModel: 'llama3', // Ensure this model is pulled in Ollama
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

## ⚙️ Configuration Options

| Option           | Type      | Default                        | Description                                       |
| :--------------- | :-------- | :----------------------------- | :------------------------------------------------ |
| `projectName`    | `string`  | `'Projectname'`                | The H1 title of your llms.txt.                    |
| `description`    | `string`  | `'Automatically generated...'` | The blockquote description.                       |
| `aiProvider`     | `string`  | `'ollama'`                     | `openai`, `gemini`, `claude`, `ollama`, or `cli`. |
| `aiApiKey`       | `string`  | `''`                           | API key for the selected provider.                |
| `aiModel`        | `string`  | `'llama3'`                     | Model name to use for summarization.              |
| `cliCommand`     | `string`  | `''`                           | Command to run if `aiProvider` is `cli`.          |
| `llmsFull`       | `boolean` | `false`                        | Whether to generate `llms-full.txt`.              |
| `concurrency`    | `number`  | `5`                            | Max simultaneous AI requests.                     |
| `language`       | `string`  | `'en'`                         | Prompt language (`en`, `de`, `fr`).               |
| `maxInputLength` | `number`  | `8000`                         | Max characters sent to the AI per page.           |
| `debug`          | `boolean` | `false`                        | Enable verbose logging.                           |

## 📄 License

MIT © [Waldheim-dev](https://github.com/Waldheim-dev)
