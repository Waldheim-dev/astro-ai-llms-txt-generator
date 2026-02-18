# Copilot Instructions for astro-llms-txt

## Project Overview

- **Purpose:** Astro integration that generates a KI-optimized `llms.txt` file during every build.
- **Main Features:**
  - Extracts title, description, H1, H2, H3, and all `<p>` texts from HTML files in the build output.
  - Summarizes content using configurable AI providers (Ollama, OpenAI, Gemini).
  - Caches AI responses using SHA256 hashes in `.llms-txt-cache` (inside `dist`).
  - Groups entries by root web section (e.g., `/blog/`, `/services/`).
  - Robust path normalization for OS independence.
  - Debug logging, error handling, and build abort on critical failures.

## Architecture & Key Files

- **src/index.ts**: Main Astro integration, orchestrates build hook, HTML extraction, section grouping, and file output.
- **src/aiProvider.ts**: Handles AI provider selection, summary generation, caching, and retry logic.
- **src/extractHtml.ts**: HTML parsing helpers for extracting tags and meta content.
- **src/prompt.ts**: Language-specific prompt templates for AI summarization.
- **src/utils.ts**: Utility functions (e.g., path cleaning, hashing).
- **test/**: Vitest-based unit tests for all major modules.

## Developer Workflows

- **Build:**
  - Standard Astro build triggers plugin logic.
  - Output: `dist/llms.txt` and `.llms-txt-cache/`.
- **Test:**
  - Run all tests: `npm test` (uses Vitest, coverage enabled)
  - Coverage: Check for low coverage in `src/aiProvider.ts` and integration logic.
- **Lint:**
  - Run: `npm run lint` and `npm run lint:fix` (ESLint + Prettier)
  - Strict JSDoc and type rules enforced.
- **Package:**
  - Build package: `npm pack` (outputs `.tgz` with `dist/`, `LICENSE`, `README.md`, etc.)
  - Only `dist/` and essential files are included (see `package.json` `files` field).

## Patterns & Conventions

- **Sequential AI requests:** KI summaries are generated one after another for reliability and caching.
- **Section grouping:** Use root path segment for grouping in `llms.txt`.
- **Error handling:** Any missing HTML files or empty AI responses abort the build.
- **Logging:** Use the provided logger (Astro or custom) for all debug/info/warn/error output.
- **Caching:** Always check `.llms-txt-cache` before making an AI request.
- **Extensibility:** New AI providers can be added by extending `src/aiProvider.ts`.

## Integration Points

- **Astro Build Hook:** Registered in `src/index.ts` via `astro:build:done`.
- **External Dependencies:**
  - `ollama`, `openai`, `@google/genai` for AI providers
  - `fast-glob` for file discovery
  - `crypto` for hashing

## Example: Adding a New AI Provider

- Extend `src/aiProvider.ts` with a new async summary function.
- Update provider selection logic in `generateAISummary`.
- Add tests in `test/aiProvider.test.ts`.

---

**Feedback:**

- Are any workflows, conventions, or integration points unclear or missing?
- Is there project-specific logic you want more deeply documented for AI agents?
