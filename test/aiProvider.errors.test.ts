/**
 * Tests the error/catch paths of every AI provider function in aiProvider.ts.
 * Each provider mock is configured to throw so we exercise the catch branches.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOpenAISummary,
  getGeminiSummary,
  getClaudeSummary,
  getCLISummary,
  getOllamaSummary,
  generateAISummary,
  resetProviderFailures,
} from '../src/aiProvider';

// Shared mock reference so individual tests can override it with mockRejectedValueOnce
const mockGenerateContent = vi.fn().mockRejectedValue(new Error('Gemini quota exceeded'));

vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn().mockRejectedValue(new Error('OpenAI network error')),
      },
    };
  },
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: vi.fn().mockRejectedValue(new Error('Claude API error')),
    };
  },
}));

vi.mock('ollama', () => ({
  default: {
    chat: vi.fn().mockRejectedValue(new Error('Ollama connection refused')),
  },
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn().mockImplementation(() => {
    throw new Error('CLI command failed');
  }),
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

describe('aiProvider error paths', () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    resetProviderFailures();
    vi.clearAllMocks();
  });

  it('getOpenAISummary returns empty string when API throws', async () => {
    const result = await getOpenAISummary({
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('OpenAI network error'));
  });

  it('getGeminiSummary returns empty string when API throws', async () => {
    const result = await getGeminiSummary({
      apiKey: 'key',
      model: 'gemini',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Gemini quota exceeded'));
  });

  it('getClaudeSummary returns empty string when API throws', async () => {
    const result = await getClaudeSummary({
      apiKey: 'key',
      model: 'claude',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Claude API error'));
  });

  it('getCLISummary returns empty string when CLI throws', async () => {
    const result = await getCLISummary({
      command: 'failing-cmd',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('CLI command failed'));
  });

  it('getOllamaSummary returns empty string after all retries fail', async () => {
    // Ollama chat mock throws on every attempt — all 5 retries exhaust
    const result = await getOllamaSummary({
      model: 'llama3',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('No valid response'));
  }, 30000);

  it('generateAISummary with unknown provider logs warning and returns empty string', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'unknown-xyz',
      apiKey: 'key',
      model: '',
      prompt: '',
      text: '',
    });
    expect(result).toBe('');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown provider'));
  });

  it('generateAISummary with debug:true and no usable logger writes to console', async () => {
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    // loggerWithoutDebug triggers the console.debug fallback path in debugLog
    const loggerWithoutDebug = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as typeof logger;
    // Use openai provider — its implementation calls logger.debug before the (mocked-to-throw) API call
    const result = await generateAISummary({
      logger: loggerWithoutDebug,
      provider: 'openai',
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      debug: true,
    });
    expect(result).toBe('');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('generateAISummary logs permanent failure once and skips subsequent pages for gemini', async () => {
    const permanentError = new Error('API key not valid. Please pass a valid API key. [API_KEY_INVALID]');
    mockGenerateContent.mockRejectedValueOnce(permanentError);

    const opts = {
      logger,
      provider: 'gemini',
      apiKey: 'bad-key',
      model: 'gemini-2.0-flash',
      prompt: 'p',
      text: 't',
    };
    const result1 = await generateAISummary(opts);
    expect(result1).toBe('');
    // First call: error logged once + warning about skipping
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Skipping remaining pages'));

    vi.clearAllMocks();

    // Second call: silently skipped — no additional log output
    const result2 = await generateAISummary({ ...opts, text: 'different page' });
    expect(result2).toBe('');
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
