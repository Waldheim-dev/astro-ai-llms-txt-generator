import fs from 'node:fs';
import path from 'node:path';
import ollama from 'ollama';
import OpenAI from 'openai';
import { GoogleGenAI, type ThinkingLevel } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

interface AstroLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Options for generating an AI summary.
 */
export interface AISummaryOptions {
  logger: AstroLogger;
  provider: string;
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
  aiUrl?: string;
  cacheDir?: string;
  debug?: boolean;
  cliCommand?: string;
  geminiThinkingLevel?: string;
  geminiThinkingBudget?: number;
}

/**
 * Generates a summary using Anthropic Claude API.
 * @param root0 - The parameters for the Claude summary.
 * @param root0.apiKey - The API key for Anthropic.
 * @param root0.model - The model to use.
 * @param root0.prompt - The system prompt.
 * @param root0.text - The text to summarize.
 * @param root0.logger - The logger instance.
 * @returns The generated summary.
 */
export async function getClaudeSummary({
  apiKey,
  model,
  prompt,
  text,
  logger,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
  logger: AstroLogger;
}): Promise<string> {
  try {
    const usedModel = model || 'claude-4-6-opus';
    logger.debug(`[CLAUDE-DEBUG] Using Anthropic API with model: ${usedModel}`);
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: usedModel,
      max_tokens: 1024,
      system: prompt,
      messages: [{ role: 'user', content: text }],
    });
    // @ts-expect-error - SDK type definitions might be inconsistent with the version
    const result = response.content[0]?.text?.trim() || '';
    logger.debug(`[CLAUDE-DEBUG] Result: ${result.substring(0, 100)}...`);
    return result;
  } catch (e) {
    logger.error(`[CLAUDE-ERROR] ${e instanceof Error ? e.message : String(e)}`);
    return '';
  }
}

/**
 * Generates a summary using a CLI tool.
 * @param root0 - The parameters for the CLI summary.
 * @param root0.command - The CLI command to execute.
 * @param root0.prompt - The prompt to prepend to the text.
 * @param root0.text - The text to summarize.
 * @param root0.logger - The logger instance.
 * @returns The generated summary.
 */
export async function getCLISummary({
  command,
  prompt,
  text,
  logger,
}: {
  command: string;
  prompt: string;
  text: string;
  logger: AstroLogger;
}): Promise<string> {
  try {
    logger.debug(`[CLI-DEBUG] Using CLI command: ${command}`);
    // Pipe text to the command
    const fullInput = `${prompt}\n\n${text}`;
    const result = execSync(command, { input: fullInput, encoding: 'utf-8' });
    return result.trim();
  } catch (e) {
    logger.error(`[CLI-ERROR] ${e instanceof Error ? e.message : String(e)}`);
    return '';
  }
}

/**
 * Generates a summary using OpenAI API.
 * @param params - The parameters for the OpenAI summary.
 * @param params.apiKey - The API key for OpenAI.
 * @param params.model - The model to use.
 * @param params.prompt - The system prompt.
 * @param params.text - The text to summarize.
 * @param params.logger - The logger instance.
 * @returns The generated summary.
 */
export async function getOpenAISummary({
  apiKey,
  model,
  prompt,
  text,
  logger,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
  logger: AstroLogger;
}): Promise<string> {
  try {
    const usedModel = model || 'gpt-5.3';
    logger.debug(`[OPENAI-DEBUG] Using OpenAI API with model: ${usedModel}`);
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: usedModel,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
      temperature: 0.5,
    });
    const result = completion.choices[0]?.message?.content?.trim() || '';
    logger.debug(`[OPENAI-DEBUG] Result: ${result.substring(0, 100)}...`);
    return result;
  } catch (e) {
    logger.error(`[OPENAI-ERROR] ${e instanceof Error ? e.message : String(e)}`);
    return '';
  }
}

/**
 * Generates a summary using Google Gemini API.
 * @param params - The parameters for the Gemini summary.
 * @param params.apiKey - The API key for Google Gemini.
 * @param params.model - The model to use.
 * @param params.prompt - The prompt.
 * @param params.text - The text to summarize.
 * @param params.logger - The logger instance.
 * @param params.thinkingLevel - The thinking level (optional).
 * @param params.thinkingBudget - The thinking budget (optional).
 * @returns The generated summary.
 */
export async function getGeminiSummary({
  apiKey,
  model,
  prompt,
  text,
  logger,
  thinkingLevel,
  thinkingBudget,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
  logger: AstroLogger;
  thinkingLevel?: string;
  thinkingBudget?: number;
}): Promise<string> {
  try {
    const usedModel = model || 'gemini-2.5-flash';
    logger.debug(`[GENAI-DEBUG] Using Google Gemini API with model: ${usedModel}`);
    const ai = new GoogleGenAI({ apiKey });

    const config: {
      thinkingConfig?: {
        includeThoughts: boolean;
        thinkingLevel?: ThinkingLevel;
        thinkingBudget?: number;
      };
    } = {};
    if (thinkingLevel || thinkingBudget) {
      config.thinkingConfig = {
        includeThoughts: false,
      };
      if (thinkingLevel) config.thinkingConfig.thinkingLevel = thinkingLevel as ThinkingLevel;
      if (thinkingBudget) config.thinkingConfig.thinkingBudget = thinkingBudget;
    }

    logger.debug(`[GENAI-DEBUG] Calling generateContent with model: ${usedModel}`);
    const result = await ai.models.generateContent({
      model: usedModel,
      contents: `${prompt}\n\n${text}`,
      config,
    });
    // Handle both property (getter) and method for 'text' to be compatible with different SDK versions
    // Use type assertion to unknown first to avoid linting/build conflicts
    const resUnknown = result as unknown as { text: string | (() => string) };
    const response =
      (typeof resUnknown.text === 'function' ? resUnknown.text() : resUnknown.text) || '';
    logger.debug(`[GENAI-DEBUG] Result: ${response.substring(0, 100)}...`);
    return response;
  } catch (e) {
    logger.error(`[GENAI-ERROR] ${e instanceof Error ? e.message : String(e)}`);
    return '';
  }
}

/**
 * Generates a summary using Ollama API.
 * @param params - The parameters for the Ollama summary.
 * @param params.model - The model to use.
 * @param params.prompt - The prompt.
 * @param params.text - The text to summarize.
 * @param params.logger - The logger instance.
 * @returns Summary string.
 */
export async function getOllamaSummary({
  model,
  prompt,
  text,
  logger,
}: {
  model: string;
  prompt: string;
  text: string;
  logger: AstroLogger;
}): Promise<string> {
  const maxRetries = 5;
  const delayMs = 2000;
  async function attemptRequest(attempt: number): Promise<string> {
    try {
      logger.debug(`[OLLAMA-DEBUG] Attempt ${attempt}/${maxRetries}`);
      logger.debug(`[OLLAMA-DEBUG] Model: ${model || 'llama3'}`);
      logger.debug(`[OLLAMA-DEBUG] Prompt: ${prompt}`);
      logger.debug(
        `[OLLAMA-DEBUG] Input (first part): ${text.substring(0, 500)}... (Length: ${text.length})`
      );
      if (process.env.OLLAMA_HOST) {
        logger.debug(`[OLLAMA-DEBUG] OLLAMA_HOST: ${process.env.OLLAMA_HOST}`);
      }
      const requestObj = {
        model: model || 'llama3',
        messages: [{ role: 'user', content: `${prompt}\n${text}` }],
      };
      logger.debug(`[OLLAMA-DEBUG] Request object: ${JSON.stringify(requestObj)}`);
      const response = await ollama.chat(requestObj);
      logger.debug(`[OLLAMA-DEBUG] RAW response: ${JSON.stringify(response)}`);
      if (!response.message?.content?.trim()) {
        logger.debug(`[OLLAMA-DEBUG] Response is empty (attempt ${attempt})!`);
        if (attempt < maxRetries) {
          logger.debug(`[OLLAMA-DEBUG] Waiting ${delayMs / 1000}s before retry...`);
          await new Promise((resolve) => {
            setTimeout(resolve, delayMs);
            resolve(undefined);
          });
          return await attemptRequest(attempt + 1);
        }
        logger.error(`[OLLAMA-DEBUG] No valid response after ${maxRetries} attempts.`);
        return '';
      }
      return response.message.content.trim();
    } catch (e) {
      logger.debug(
        `[OLLAMA-DEBUG] Request failed (attempt ${attempt}): ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
      if (attempt < maxRetries) {
        logger.debug(`[OLLAMA-DEBUG] Waiting ${delayMs / 1000}s before retry...`);
        await new Promise((resolve) => {
          setTimeout(resolve, delayMs);
          resolve(undefined);
        });
        return attemptRequest(attempt + 1);
      }
      logger.error(
        `[OLLAMA-DEBUG] No valid response after ${maxRetries} attempts. Last error: ${e instanceof Error ? e.stack || e.message : String(e)}`
      );
      return '';
    }
  }
  return attemptRequest(1);
}

/**
 * Generates an AI summary for the given text using the selected provider and caching.
 * @param options - Options for summary generation.
 * @returns AI summary as string (Promise).
 */
export async function generateAISummary(options: AISummaryOptions): Promise<string> {
  const { logger, provider, apiKey, model, prompt, text, cacheDir, debug } = options;
  /**
   * Internal debug logger.
   * @param args - Arguments to log.
   */
  function debugLog(...args: unknown[]) {
    if ((!logger || typeof logger.debug !== 'function') && debug) {
      // Schreibe Debug-Ausgaben immer auf die Konsole, unabhängig vom Astro-Logger
      console.debug('[LLMS-TXT-DEBUG]', ...args);
      return;
    }
    if (logger && typeof logger.debug === 'function') {
      logger.debug(...args);
    }
  }

  const wrappedLogger: AstroLogger = {
    info: (...args: unknown[]) => logger.info(...args),
    warn: (...args: unknown[]) => logger.warn(...args),
    error: (...args: unknown[]) => logger.error(...args),
    debug: debugLog,
  };

  if (!provider || (provider !== 'ollama' && !apiKey)) {
    wrappedLogger.warn(
      '[DEBUG] No AI provider specified or API key missing! No AI summary will be generated.'
    );
    return '';
  }
  const hash = crypto
    .createHash('sha256')
    .update([provider, model, prompt, text].join('||'))
    .digest('hex');
  const cachePath = cacheDir ? path.join(cacheDir, `${hash}.json`) : '';

  /**
   * Reads from cache.
   * @returns Cached summary or null.
   */
  function readCache(): string | null {
    if (cacheDir && fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        if (cached && typeof cached.summary === 'string') {
          wrappedLogger.debug(`AI cache hit for hash ${hash}`);
          return cached.summary;
        }
      } catch (e) {
        wrappedLogger.warn(`Error reading AI cache: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return null;
  }

  /**
   * Gets summary from selected provider.
   * @returns Summary string.
   */
  async function getProviderSummary(): Promise<string> {
    switch (provider) {
      case 'openai':
        return getOpenAISummary({
          apiKey,
          model,
          prompt,
          text,
          logger: wrappedLogger,
        });
      case 'gemini':
        return getGeminiSummary({
          apiKey,
          model,
          prompt,
          text,
          logger: wrappedLogger,
          thinkingLevel: options.geminiThinkingLevel,
          thinkingBudget: options.geminiThinkingBudget,
        });
      case 'claude':
        return getClaudeSummary({
          apiKey,
          model,
          prompt,
          text,
          logger: wrappedLogger,
        });
      case 'ollama':
        return getOllamaSummary({ model, prompt, text, logger: wrappedLogger });
      case 'cli':
        return getCLISummary({
          command: options.cliCommand || 'cat',
          prompt,
          text,
          logger: wrappedLogger,
        });
      default:
        wrappedLogger.warn('Unknown provider.');
        return '';
    }
  }

  const cachedSummary = readCache();
  if (cachedSummary) {
    return cachedSummary;
  }
  const summary = await getProviderSummary();
  if (cacheDir && summary) {
    try {
      fs.writeFileSync(cachePath, JSON.stringify({ summary }), 'utf-8');
      wrappedLogger.debug(`AI response cached at ${cachePath}`);
    } catch (e) {
      wrappedLogger.warn(`Error writing AI cache: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return summary;
}
