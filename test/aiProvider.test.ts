import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateAISummary, AISummaryOptions } from '../src/aiProvider';

describe('generateAISummary', () => {
  const cacheDir = path.join(__dirname, '.cache-test');
  const cacheFile = path.join(cacheDir, 'dummy.json');
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
  });

  it('returns cached summary if present', async () => {
    fs.writeFileSync(cacheFile, JSON.stringify({ summary: 'cached summary' }), 'utf-8');
    const opts: AISummaryOptions = {
      logger,
      provider: 'ollama',
      apiKey: '',
      model: 'llama3',
      prompt: 'prompt',
      text: 'text',
      cacheDir,
    };
    // Patch hash to match cacheFile
    vi.spyOn(path, 'join').mockReturnValue(cacheFile);
    const result = await generateAISummary(opts);
    expect(result).toBe('cached summary');
    vi.restoreAllMocks();
  });

  it('returns empty string for unknown provider', async () => {
    const opts: AISummaryOptions = {
      logger,
      provider: 'unknown',
      apiKey: '',
      model: '',
      prompt: '',
      text: '',
      cacheDir,
    };
    const result = await generateAISummary(opts);
    expect(result).toBe('');
  });

  it('returns empty string if no provider/apiKey', async () => {
    const opts: AISummaryOptions = {
      logger,
      provider: '',
      apiKey: '',
      model: '',
      prompt: '',
      text: '',
      cacheDir,
    };
    const result = await generateAISummary(opts);
    expect(result).toBe('');
  });
  afterAll(() => {
    if (fs.existsSync(cacheFile)) fs.unlinkSync(cacheFile);
    if (fs.existsSync(cacheDir)) fs.rmdirSync(cacheDir);
  });
});
