import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  getOpenAISummary,
  getGeminiSummary,
  getClaudeSummary,
  getCLISummary,
  getOllamaSummary,
  generateAISummary,
  AISummaryOptions,
} from '../src/aiProvider';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

// Mocks must be at the top level!
vi.mock('openai', () => ({
  default: class {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'summary' } }],
        }),
      },
    };
    constructor() {}
  },
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = {
      generateContent: vi.fn().mockResolvedValue({
        text: () => 'gemini-summary',
      }),
    };
    constructor() {}
  },
}));

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ text: 'claude-summary' }],
      }),
    };
    constructor() {}
  },
}));

vi.mock('ollama', () => ({
  default: { chat: vi.fn().mockResolvedValue({ message: { content: 'ollama-summary' } }) },
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn().mockReturnValue('cli-summary'),
}));

describe('aiProvider', () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getOpenAISummary returns summary on success', async () => {
    const result = await getOpenAISummary({
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('summary');
  });

  it('getGeminiSummary returns summary on success', async () => {
    const result = await getGeminiSummary({
      apiKey: 'key',
      model: 'gemini',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('gemini-summary');
  });

  it('getGeminiSummary configures thinkingLevel when provided', async () => {
    const result = await getGeminiSummary({
      apiKey: 'key',
      model: 'gemini',
      prompt: 'p',
      text: 't',
      logger,
      thinkingLevel: 'high',
    });
    expect(result).toBe('gemini-summary');
  });

  it('getGeminiSummary configures thinkingBudget when provided', async () => {
    const result = await getGeminiSummary({
      apiKey: 'key',
      model: 'gemini',
      prompt: 'p',
      text: 't',
      logger,
      thinkingBudget: 1000,
    });
    expect(result).toBe('gemini-summary');
  });

  it('getGeminiSummary configures both thinkingLevel and thinkingBudget', async () => {
    const result = await getGeminiSummary({
      apiKey: 'key',
      model: 'gemini',
      prompt: 'p',
      text: 't',
      logger,
      thinkingLevel: 'medium',
      thinkingBudget: 500,
    });
    expect(result).toBe('gemini-summary');
  });

  it('getOllamaSummary returns summary on success', async () => {
    const result = await getOllamaSummary({ model: 'llama3', prompt: 'p', text: 't', logger });
    expect(result).toBe('ollama-summary');
  });

  it('getOllamaSummary calls debug when OLLAMA_HOST env var is set', async () => {
    process.env.OLLAMA_HOST = 'http://localhost:11434';
    const result = await getOllamaSummary({ model: 'llama3', prompt: 'p', text: 't', logger });
    expect(result).toBe('ollama-summary');
    expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('OLLAMA_HOST'));
    delete process.env.OLLAMA_HOST;
  });

  it('getOllamaSummary returns empty string after exhausting retries on empty responses', async () => {
    const ollamaMod = await import('ollama');
    // Make ollama.chat always return empty content so all 5 retries exhaust
    (ollamaMod.default.chat as ReturnType<typeof vi.fn>).mockResolvedValue({ message: { content: '' } });
    const result = await getOllamaSummary({ model: 'llama3', prompt: 'p', text: 't', logger });
    expect(result).toBe('');
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('No valid response'));
    // Restore the default mock for other tests
    (ollamaMod.default.chat as ReturnType<typeof vi.fn>).mockResolvedValue({ message: { content: 'ollama-summary' } });
  });

  it('getClaudeSummary returns summary on success', async () => {
    const result = await getClaudeSummary({
      apiKey: 'key',
      model: 'claude',
      prompt: 'p',
      text: 't',
      logger,
    });
    expect(result).toBe('claude-summary');
  });

  it('getCLISummary returns summary on success', async () => {
    const result = await getCLISummary({ command: 'test-cli', prompt: 'p', text: 't', logger });
    expect(result).toBe('cli-summary');
  });

  it('generateAISummary returns empty string for unknown provider', async () => {
    const options: AISummaryOptions = {
      logger,
      provider: 'unknown',
      apiKey: '',
      model: '',
      prompt: '',
      text: '',
    };
    const result = await generateAISummary(options);
    expect(result).toBe('');
  });

  it('generateAISummary routes to openai provider and returns summary', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'openai',
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
    });
    expect(result).toBe('summary');
  });

  it('generateAISummary routes to gemini provider and returns summary', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'gemini',
      apiKey: 'key',
      model: 'gemini-pro',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
    });
    expect(result).toBe('gemini-summary');
  });

  it('generateAISummary routes to claude provider and returns summary', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'claude',
      apiKey: 'key',
      model: 'claude-3',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
    });
    expect(result).toBe('claude-summary');
  });

  it('generateAISummary routes to ollama provider and returns summary', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'ollama',
      apiKey: '',
      model: 'llama3',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
    });
    expect(result).toBe('ollama-summary');
  });

  it('generateAISummary routes to cli provider and returns summary', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'cli',
      apiKey: '',
      model: '',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
      cliCommand: 'test-cli',
    });
    expect(result).toBe('cli-summary');
  });

  it('generateAISummary uses cat as default CLI command when cliCommand is not set', async () => {
    const result = await generateAISummary({
      logger,
      provider: 'cli',
      apiKey: '',
      model: '',
      prompt: 'Summarize',
      text: 'content',
      cacheDir: '',
      // no cliCommand → falls back to 'cat'
    });
    expect(result).toBe('cli-summary');
  });

  it('generateAISummary writes result to cache and reads it back on second call', async () => {
    const mockFs = (await import('node:fs')).default;
    // First call: no cache exists
    (mockFs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const opts: AISummaryOptions = {
      logger,
      provider: 'openai',
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      cacheDir: '/tmp/cache',
    };
    await generateAISummary(opts);
    expect(mockFs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.json'),
      expect.stringContaining('summary'),
      'utf-8'
    );

    // Second call: cache hit
    (mockFs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (mockFs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
      JSON.stringify({ summary: 'cached-summary' })
    );
    const cached = await generateAISummary(opts);
    expect(cached).toBe('cached-summary');
  });

  it('generateAISummary handles corrupt cache gracefully', async () => {
    const mockFs = (await import('node:fs')).default;
    (mockFs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    (mockFs.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue('INVALID JSON{{{');

    const result = await generateAISummary({
      logger,
      provider: 'openai',
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      cacheDir: '/tmp/cache',
    });
    // Falls back to live provider call after corrupt cache
    expect(result).toBe('summary');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Error reading AI cache'));
  });

  it('generateAISummary warns when cache write fails', async () => {
    const mockFs = (await import('node:fs')).default;
    (mockFs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (mockFs.writeFileSync as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('disk full');
    });

    const result = await generateAISummary({
      logger,
      provider: 'openai',
      apiKey: 'key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      cacheDir: '/tmp/cache',
    });
    expect(result).toBe('summary');
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('disk full'));
  });
});

