import { describe, it, expect } from 'vitest';
import type { LlmsTxtOptions } from '../src/types';

describe('LlmsTxtOptions type', () => {
  it('accepts all optional fields', () => {
    const opts: LlmsTxtOptions = {
      projectName: 'Test',
      description: 'desc',
      sectionTitle: 'Section',
      aiProvider: 'openai',
      aiApiKey: 'key',
      aiModel: 'gpt-4',
      aiUrl: 'http://api',
      site: 'https://site',
      maxInputLength: 1234,
      language: 'en',
      debug: true,
    };
    expect(opts.projectName).toBe('Test');
    expect(opts.aiProvider).toBe('openai');
    expect(opts.debug).toBe(true);
  });

  it('accepts minimal config', () => {
    const opts: LlmsTxtOptions = {};
    expect(opts).toBeDefined();
  });

  it('enforces aiProvider values', () => {
    const valid: LlmsTxtOptions = { aiProvider: 'ollama' };
    expect(valid.aiProvider).toBe('ollama');
    // @ts-expect-error
    const invalid: LlmsTxtOptions = { aiProvider: 'foo' };
  });
});
