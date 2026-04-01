import type { LlmsTxtOptions } from './types.js';
import type { PageInfo } from './formatter.js';

/**
 * Minimal interface covering the Astro 5.0 DataStore entry shape.
 * Compatible with the entry objects returned by store.values() inside a Loader context.
 */
export interface DataEntry {
  id: string;
  /** Raw Markdown body (undefined when glob loader is configured with retainBody: false). */
  body?: string;
  /** Rendered output — available when body is not retained. */
  rendered?: {
    html?: string;
    metadata?: Record<string, unknown>;
  };
  /** Typed frontmatter data as defined by the collection schema. */
  data: Record<string, unknown>;
}

/**
 * Minimal interface for the Astro 5.0 DataStore.
 * Matches the store object available in Loader context and integration hooks.
 */
export interface DataStore {
  values(): Iterable<DataEntry>;
  entries(): Iterable<[string, DataEntry]>;
}

/**
 * Converts Astro 5.0 DataStore entries into PageInfo objects for llms.txt generation.
 *
 * Content priority order:
 *   1. entry.body  — raw Markdown (preferred, avoids HTML noise)
 *   2. entry.rendered.html — rendered HTML fallback (when retainBody: false)
 *
 * The `isOptional` flag is driven by `entry.data.llmsOptional === true` in the
 * content collection schema (e.g. `llmsOptional: z.boolean().optional()`).
 *
 * @param store - The Astro 5.0 DataStore instance.
 * @param options - Plugin options (site URL, etc.).
 * @returns Array of PageInfo objects ready for formatting.
 */
export function fetchFromDataStore(store: DataStore, options: LlmsTxtOptions): PageInfo[] {
  const { site = '' } = options;
  const baseUrl = site.replace(/\/$/, '');
  const pages: PageInfo[] = [];

  for (const entry of store.values()) {
    const slug = entry.id.replace(/\\/g, '/');
    const relUrl = slug.startsWith('/') ? slug : `/${slug}`;
    const fullUrl = baseUrl + relUrl;

    // Prefer raw Markdown body; fall back to rendered HTML
    const content = entry.body ?? entry.rendered?.html ?? '';

    const title = typeof entry.data['title'] === 'string' ? entry.data['title'] : slug;
    const summary = typeof entry.data['description'] === 'string' ? entry.data['description'] : '';
    const isOptional = entry.data['llmsOptional'] === true;

    pages.push({
      url: fullUrl,
      title,
      summary,
      relUrl,
      fullContent: content,
      isOptional,
    });
  }

  return pages;
}
