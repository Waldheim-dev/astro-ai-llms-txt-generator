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

  it('getOllamaSummary returns summary on success', async () => {
    const result = await getOllamaSummary({ model: 'llama3', prompt: 'p', text: 't', logger });
    expect(result).toBe('ollama-summary');
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
});
