# @waldheimdev/astro-ai-llms-txt-generator

An Astro integration that automatically generates an LLM-optimized `llms.txt` file in your build output. It uses AI (OpenAI, Google Gemini, or Ollama) to summarize your pages, making them perfectly digestible for Large Language Models.

Follows the [llms.txt](https://llmstxt.org/) standard.

## Features

- 🤖 **AI-Powered Summarization**: Uses OpenAI, Google Gemini, or local Ollama models.
- 📂 **Automatic Sectioning**: Groups pages by their root directories (e.g., `/blog/`, `/docs/`).
- ⚡ **Concurrency Control**: Limit simultaneous AI requests to avoid rate limits.
- 💾 **Caching**: AI responses are cached locally to speed up subsequent builds and save costs.
- 🌍 **Multi-language Support**: Customize prompts based on your site's language.
- 🛠️ **Robust & Fast**: Built with TypeScript and optimized for Astro 5+.

## Installation

```bash
npm install @waldheimdev/astro-ai-llms-txt-generator
```

## Usage

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import llmsTxt from '@waldheimdev/astro-ai-llms-txt-generator';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    llmsTxt({
      projectName: 'My Awesome Project',
      description: 'A deep dive into awesome things.',
      aiProvider: 'openai', // 'openai', 'gemini', or 'ollama'
      aiApiKey: process.env.OPENAI_API_KEY,
      aiModel: 'gpt-4o-mini',
      concurrency: 5,
    }),
  ],
});
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `projectName` | `string` | `'Projectname'` | The H1 title of your llms.txt. |
| `description` | `string` | `'Automatically generated...'` | The blockquote description. |
| `site` | `string` | `''` | Your site's base URL (inherited from Astro config). |
| `aiProvider` | `string` | `'ollama'` | `openai`, `gemini`, or `ollama`. |
| `aiApiKey` | `string` | `''` | API key for the selected provider. |
| `aiModel` | `string` | `'llama3'` | Model name to use for summarization. |
| `concurrency` | `number` | `5` | Max simultaneous AI requests. |
| `language` | `string` | `'en'` | Prompt language (`en`, `de`, etc.). |
| `maxInputLength`| `number` | `8000` | Max characters sent to the AI per page. |
| `debug` | `boolean` | `false` | Enable verbose logging. |

## CI/CD

This repository includes GitHub Actions for:
- **Linting & Testing**: Runs on every PR and push to main.
- **Automated Releases**: Uses `semantic-release` to publish to npm and GitHub.

## License

MIT © [Waldheim-dev](https://github.com/Waldheim-dev)
