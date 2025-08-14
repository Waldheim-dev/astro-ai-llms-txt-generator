import { describe, it, expect } from 'vitest';
import llmsTxt from '../src/index';

describe('llmsTxt plugin', () => {
  it('exports a function', () => {
    expect(typeof llmsTxt).toBe('function');
  });

  it('returns an integration object', () => {
    const integration = llmsTxt();
    expect(integration).toHaveProperty('name', 'llms-txt');
    expect(integration).toHaveProperty('hooks');
    expect(typeof integration.hooks['astro:build:done']).toBe('function');
  });
});
