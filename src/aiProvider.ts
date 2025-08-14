import fs from 'fs';
import path from 'path';
import ollama from 'ollama';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export interface AISummaryOptions {
  logger: Logger;
  provider: string;
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
  aiUrl?: string;
  cacheDir?: string;
  debug?: boolean;
}

/**
 * Generates a summary using OpenAI API.
 * @param params Parameter object: apiKey, model, prompt, text
 * @param params.apiKey OpenAI API key
 * @param params.model Model name
 * @param params.prompt Prompt for the summary
 * @param params.text Text to summarize
 * @returns Summary string
 */
export async function getOpenAISummary({
  apiKey,
  model,
  prompt,
  text,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
}): Promise<string> {
  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.responses.create({
      model: model || 'gpt-4o',
      instructions: prompt,
      input: text,
      temperature: 0.5,
    });
    return completion.output_text?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Generates a summary using Google Gemini API.
 * @param params Parameter object: apiKey, model, prompt, text
 * @param params.apiKey Gemini API key
 * @param params.model Model name
 * @param params.prompt Prompt for the summary
 * @param params.text Text to summarize
 * @returns Summary string
 */
export async function getGeminiSummary({
  apiKey,
  model,
  prompt,
  text,
}: {
  apiKey: string;
  model: string;
  prompt: string;
  text: string;
}): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash-light',
      contents: `${prompt}\n${text}`,
    });
    return response.text?.trim() || '';
  } catch {
    return '';
  }
}

/**
 * Generates a summary using Ollama API.
 * @param params Parameter object: model, prompt, text, logger
 * @param params.model Model name
 * @param params.prompt Prompt for the summary
 * @param params.text Text to summarize
 * @param params.logger Logger instance
 * @returns Summary string
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
  logger: Logger;
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
 * @param options Options for summary generation
 * @returns AI summary as string (Promise)
 */
export async function generateAISummary(options: AISummaryOptions): Promise<string> {
  const { logger, provider, apiKey, model, prompt, text, cacheDir } = options;
  if (!provider || (provider !== 'ollama' && !apiKey)) {
    logger.warn(
      '[DEBUG] No AI provider specified or API key missing! No AI summary will be generated.'
    );
    return '';
  }
  const crypto = await import('crypto');
  const hash = crypto
    .createHash('sha256')
    .update([provider, model, prompt, text].join('||'))
    .digest('hex');
  const cachePath = cacheDir ? path.join(cacheDir, `${hash}.json`) : '';

  function readCache(): string | null {
    if (cacheDir && fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        if (cached && typeof cached.summary === 'string') {
          logger.info(`AI cache hit for hash ${hash}`);
          return cached.summary;
        }
      } catch (e) {
        logger.warn(`Error reading AI cache: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return null;
  }

  async function getProviderSummary(): Promise<string> {
    switch (provider) {
      case 'openai':
        return getOpenAISummary({ apiKey, model, prompt, text });
      case 'gemini':
        return getGeminiSummary({ apiKey, model, prompt, text });
      case 'ollama':
        return getOllamaSummary({ model, prompt, text, logger });
      default:
        logger.warn('Unknown provider.');
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
      logger.info(`AI response cached at ${cachePath}`);
    } catch (e) {
      logger.warn(`Error writing AI cache: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return summary;
}
