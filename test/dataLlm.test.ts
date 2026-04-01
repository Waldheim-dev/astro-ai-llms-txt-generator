import { describe, it, expect } from 'vitest';
import { extractDataLlmAttributes, formatDataLlmForLlm } from '../src/dataLlm';

describe('dataLlm', () => {
  describe('extractDataLlmAttributes', () => {
    it('extracts a single data-llm attribute', () => {
      const html = `<div data-llm='{"type":"pricing","product":"Pro","monthly_cost":29}'></div>`;
      const entries = extractDataLlmAttributes(html);
      expect(entries).toHaveLength(1);
      expect(entries[0].data).toEqual({ type: 'pricing', product: 'Pro', monthly_cost: 29 });
      expect(entries[0].elementType).toBe('div');
    });

    it('extracts multiple data-llm attributes', () => {
      const html = `
        <section data-llm='{"type":"hero","headline":"Welcome"}'></section>
        <table data-llm='{"type":"comparison","rows":3}'></table>
      `;
      const entries = extractDataLlmAttributes(html);
      expect(entries).toHaveLength(2);
      expect(entries[0].data['type']).toBe('hero');
      expect(entries[1].data['type']).toBe('comparison');
    });

    it('returns an empty array when no data-llm elements are present', () => {
      const html = '<div class="plain"><p>No metadata here.</p></div>';
      expect(extractDataLlmAttributes(html)).toHaveLength(0);
    });

    it('silently skips elements with malformed JSON', () => {
      const html = `<div data-llm='{bad json}'></div><span data-llm='{"ok":true}'></span>`;
      const entries = extractDataLlmAttributes(html);
      expect(entries).toHaveLength(1);
      expect(entries[0].data['ok']).toBe(true);
    });

    it('does not throw when all data-llm values are malformed', () => {
      const html = `<div data-llm='not json'></div>`;
      expect(() => extractDataLlmAttributes(html)).not.toThrow();
      expect(extractDataLlmAttributes(html)).toHaveLength(0);
    });

    it('skips elements whose data-llm attribute is empty / not present as value', () => {
      // <span data-llm> — Cheerio returns empty string, which is invalid JSON
      const html = `<span data-llm></span><div data-llm='"valid"'></div>`;
      const entries = extractDataLlmAttributes(html);
      // The span with no value is silently skipped; the div with a valid JSON string is included
      expect(entries.filter((e) => typeof e.data === 'string')).toHaveLength(1);
    });

    it('records the correct element type', () => {
      const html = `<article data-llm='{"type":"post"}'></article>`;
      const [entry] = extractDataLlmAttributes(html);
      expect(entry.elementType).toBe('article');
    });
  });

  describe('formatDataLlmForLlm', () => {
    it('returns empty string for an empty entries array', () => {
      expect(formatDataLlmForLlm([])).toBe('');
    });

    it('formats entries as LLM metadata comments', () => {
      const entries = [
        { elementType: 'div', data: { type: 'pricing', product: 'Pro' } },
      ];
      const result = formatDataLlmForLlm(entries);
      expect(result).toContain('<!-- LLM Metadata [div]:');
      expect(result).toContain('"type":"pricing"');
      expect(result).toContain('"product":"Pro"');
    });

    it('formats multiple entries as separate comment lines', () => {
      const entries = [
        { elementType: 'section', data: { a: 1 } },
        { elementType: 'table', data: { b: 2 } },
      ];
      const result = formatDataLlmForLlm(entries);
      const lines = result.trim().split('\n');
      expect(lines).toHaveLength(2);
    });

    it('starts with two newlines for clean appending', () => {
      const entries = [{ elementType: 'div', data: { x: 1 } }];
      const result = formatDataLlmForLlm(entries);
      expect(result.startsWith('\n\n')).toBe(true);
    });
  });
});
