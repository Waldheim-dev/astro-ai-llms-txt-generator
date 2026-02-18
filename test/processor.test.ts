import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { processAllFiles } from '../src/processor';
import type { LlmsTxtOptions } from '../src/types';

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

// Mock aiProvider
vi.mock('../src/aiProvider', () => ({
  generateAISummary: vi.fn().mockResolvedValue('AI Summary Result'),
}));

describe('processor', () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  const options: LlmsTxtOptions = {
    site: 'https://example.com',
    aiProvider: 'ollama',
    concurrency: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes files and returns valid page info', async () => {
    const htmlFiles = ['/dist/index.html', '/dist/blog/post.html'];
    const resolvedDistPath = '/dist';

    (fs.readFileSync as any).mockReturnValue(
      '<html><title>Test</title><body><p>Content</p></body></html>'
    );

    const result = await processAllFiles(htmlFiles, resolvedDistPath, options, logger, '/cache');

    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com/');
    expect(result[1].url).toBe('https://example.com/blog/post');
    expect(result[0].summary).toBe('AI Summary Result');
    expect(logger.error).not.toHaveBeenCalled();
  });

  it('filters out pages with empty summaries', async () => {
    const { generateAISummary } = await import('../src/aiProvider');
    (generateAISummary as any).mockResolvedValueOnce(''); // First one fails/is empty
    (generateAISummary as any).mockResolvedValueOnce('Valid');

    const htmlFiles = ['/dist/fail.html', '/dist/success.html'];
    (fs.readFileSync as any).mockReturnValue('<html><body><p>Text</p></body></html>');

    const result = await processAllFiles(htmlFiles, '/dist', options, logger, '/cache');

    expect(result).toHaveLength(1);
    expect(result[0].summary).toBe('Valid');
  });

  it('handles read errors gracefully', async () => {
    (fs.readFileSync as any).mockImplementation(() => {
      throw new Error('Read error');
    });

    const result = await processAllFiles(['/dist/error.html'], '/dist', options, logger, '/cache');

    expect(result).toHaveLength(0);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to process'));
  });

  it('uses environment variables as fallback for API keys', async () => {
    const { generateAISummary } = await import('../src/aiProvider');
    const htmlFiles = ['/dist/test.html'];
    (fs.readFileSync as any).mockReturnValue('<html><title>Test</title></html>');

    // Test Gemini
    process.env.GEMINI_API_KEY = 'gemini-env-key';
    await processAllFiles(htmlFiles, '/dist', { aiProvider: 'gemini' }, logger, '/cache');
    expect(generateAISummary).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'gemini-env-key' })
    );

    // Test OpenAI
    process.env.OPENAI_API_KEY = 'openai-env-key';
    await processAllFiles(htmlFiles, '/dist', { aiProvider: 'openai' }, logger, '/cache');
    expect(generateAISummary).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'openai-env-key' })
    );

    // Test Claude
    process.env.ANTHROPIC_API_KEY = 'claude-env-key';
    await processAllFiles(htmlFiles, '/dist', { aiProvider: 'claude' }, logger, '/cache');
    expect(generateAISummary).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'claude-env-key' })
    );

    // Cleanup
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });
});
