# @waldheimdev/astro-ai-llms-txt-generator

An Astro integration that automatically generates an LLM-optimized `llms.txt` file in your build output. It uses AI to summarize your pages, making them perfectly digestible for Large Language Models.

Follows the [llms.txt](https://llmstxt.org/) standard.

## Features

- 🤖 **AI-Powered Summarization**: Uses OpenAI, Google Gemini, Anthropic Claude, or local Ollama models.
- 💻 **CLI Provider**: Use your favorite CLI tools (like `gemini-cli` or `copilot-cli`) as a provider.
- 📂 **Automatic Sectioning**: Groups pages by their root directories (e.g., `/blog/`, `/docs/`).
- ⚡ **Concurrency Control**: Limit simultaneous AI requests to avoid rate limits.
- 📜 **llms-full.txt**: Optionally generate a full-content version of your site for LLMs.
- 💾 **Caching**: AI responses are cached locally to speed up subsequent builds and save costs.
- 🌍 **Multi-language Support**: Customize prompts based on your site's language.

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
      aiProvider: 'claude', // 'openai', 'gemini', 'claude', 'ollama', or 'cli'
      aiApiKey: process.env.ANTHROPIC_API_KEY,
      aiModel: 'claude-3-5-sonnet-latest',
      llmsFull: true, // Also generate llms-full.txt
    }),
  ],
});
```

### Using a CLI tool as a provider

If you have a CLI tool that can take a prompt and text via stdin and return a summary, you can use the `cli` provider:

```javascript
llmsTxt({
  aiProvider: 'cli',
  cliCommand: 'gemini-cli summarize', // The tool should accept input via stdin
})
```

## Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `projectName` | `string` | `'Projectname'` | The H1 title of your llms.txt. |
| `description` | `string` | `'Automatically generated...'` | The blockquote description. |
| `aiProvider` | `string` | `'ollama'` | `openai`, `gemini`, `claude`, `ollama`, or `cli`. |
| `aiApiKey` | `string` | `''` | API key for the selected provider. |
| `aiModel` | `string` | `'llama3'` | Model name to use for summarization. |
| `cliCommand` | `string` | `''` | Command to run if `aiProvider` is `cli`. |
| `llmsFull` | `boolean` | `false` | Whether to generate `llms-full.txt`. |
| `concurrency` | `number` | `5` | Max simultaneous AI requests. |
| `language` | `string` | `'en'` | Prompt language (`en`, `de`, `fr`). |
| `maxInputLength`| `number` | `8000` | Max characters sent to the AI per page. |
| `debug` | `boolean` | `false` | Enable verbose logging. |

## CI/CD

This repository includes GitHub Actions for:
- **Linting & Testing**: Runs on every PR and push to main.
- **Automated Releases**: Uses `semantic-release` to publish to npm and GitHub.

## License

MIT © [Waldheim-dev](https://github.com/Waldheim-dev)
