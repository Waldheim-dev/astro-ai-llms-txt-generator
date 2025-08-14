# 🚀 astro-ai-llms-txt

✨ Astro Integration: llms.txt Generator ✨

This plugin magically creates a KI-optimized `llms.txt` in your build output on every Astro build!  
Perfect for SEO, AI crawlers, and anyone who loves content. 🦾📈

## 🌟 Features

- 🏷️ Extracts title, description, H1, H2, H3, and all `<p>` texts from HTML
- 🤖 AI-powered summarization via Ollama, OpenAI, or Gemini (provider/model/key/endpoint configurable)
- 🗄️ AI response caching (SHA256, `.llms-txt-cache` in `dist`)
- 🗂️ Groups entries by root web section (e.g. `/blog/`, `/services/`)
- 🛡️ Robust path normalization (OS-independent)
- 🪲 Debug logging, error detection, build abort on errors

## ⚡ Installation

```bash
npm install astro-ai-llms-txt
```

## 🎉 Usage

Add the plugin to your `astro.config.mjs` and let the magic begin:

```js
import llmsTxt from 'astro-ai-llms-txt';

export default {
  integrations: [
    llmsTxt({
      projectName: '🚀 My Project',
      description: 'KI-optimized overview for LLMs. 🧠',
      aiProvider: 'ollama', // 'openai' | 'gemini' | 'ollama'
      aiApiKey: '', // API key for OpenAI/Gemini
      aiModel: 'llama3', // Model name for provider
      site: 'https://my-domain.com', // Base URL for links
      maxInputLength: 8000, // Optional: max length for AI input
    }),
  ],
};
```

### All Options

| Option           | Type   | Default                           | Description                                          |
| ---------------- | ------ | --------------------------------- | ---------------------------------------------------- |
| `projectName`    | string | 'My Project'                      | Name for the llms.txt header                         |
| `description`    | string | 'KI-optimized overview for LLMs.' | Description for llms.txt header                      |
| `aiProvider`     | string | 'ollama'                          | AI provider: 'ollama', 'openai', or 'gemini'         |
| `aiApiKey`       | string | ''                                | API key for OpenAI or Gemini (not needed for Ollama) |
| `aiModel`        | string | 'llama3'                          | Model name for the selected provider                 |
| `aiUrl`          | string | ''                                | Custom endpoint for Ollama (optional)                |
| `site`           | string | ''                                | Base URL for links in llms.txt                       |
| `maxInputLength` | number | 8000                              | Maximum input length for AI summarization            |

## 📦 Output

After every Astro build you'll find in `dist/`:

- `llms.txt` – Your KI-optimized overview of all pages ✨
- `.llms-txt-cache/` – Cache for AI responses 🗄️

## 🛠️ Extending

- Want more AI providers? Just add them in `src/aiProvider.ts`! 🧩
- Tests & coverage: `npm test` ✅
- Linting: `npm run lint` 🧹

## 📝 Example llms.txt

```
# 🚀 My Project

> KI-optimized overview for LLMs. 🧠

## Blog

- [/blog/post-1]: Post title summary...
- [/blog/post-2]: Post title summary...

## Services

- [/services/web]: Web service summary...
```

---

Made with ❤️ for Astro & AI enthusiasts!
