import * as cheerio from 'cheerio';

export interface DataLlmEntry {
  elementType: string;
  data: Record<string, unknown>;
}

/**
 * Extracts and parses all `data-llm` attributes from an HTML string.
 * Elements with malformed JSON values are silently skipped.
 *
 * Usage in Astro templates:
 *   <div data-llm='{"type":"pricing","product":"Pro","monthly_cost":29}'>…</div>
 * @param html - Raw HTML string.
 * @returns Array of extracted data-llm entries.
 */
export function extractDataLlmAttributes(html: string): DataLlmEntry[] {
  const $ = cheerio.load(html);
  const entries: DataLlmEntry[] = [];

  $('[data-llm]').each((_, el) => {
    const raw = $(el).attr('data-llm') ?? '';
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      entries.push({
        /* v8 ignore next -- Cheerio always provides tagName for real elements */
        elementType: (el as { tagName?: string }).tagName ?? 'unknown',
        data: parsed,
      });
    } catch {
      // Silently skip malformed JSON — do not throw
    }
  });

  return entries;
}

/**
 * Formats extracted data-llm entries as LLM-readable metadata blocks
 * to be appended to the full-content section of a page.
 * @param entries - Parsed data-llm entries.
 * @returns A markdown string with structured metadata comments, or empty string.
 */
export function formatDataLlmForLlm(entries: DataLlmEntry[]): string {
  if (entries.length === 0) return '';
  const lines = entries.map(
    (e) => `<!-- LLM Metadata [${e.elementType}]: ${JSON.stringify(e.data)} -->`
  );
  return `\n\n${lines.join('\n')}`;
}
