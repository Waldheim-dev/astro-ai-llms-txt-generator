import { describe, it, expect } from 'vitest';
import { fetchFromDataStore, type DataStore, type DataEntry } from '../src/datastore';
import type { LlmsTxtOptions } from '../src/types';

function makeStore(entries: DataEntry[]): DataStore {
  return {
    values() {
      return entries[Symbol.iterator]();
    },
    entries() {
      return entries
        .map((e): [string, DataEntry] => [e.id, e])
        [Symbol.iterator]();
    },
  };
}

const options: LlmsTxtOptions = { site: 'https://example.com' };

describe('datastore', () => {
  it('converts DataEntry objects to PageInfo', () => {
    const store = makeStore([
      {
        id: 'docs/intro',
        body: '# Introduction\nWelcome.',
        data: { title: 'Introduction', description: 'The intro page' },
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages).toHaveLength(1);
    expect(pages[0].title).toBe('Introduction');
    expect(pages[0].summary).toBe('The intro page');
    expect(pages[0].url).toBe('https://example.com/docs/intro');
    expect(pages[0].relUrl).toBe('/docs/intro');
    expect(pages[0].fullContent).toBe('# Introduction\nWelcome.');
    expect(pages[0].isOptional).toBe(false);
  });

  it('falls back to rendered.html when body is undefined', () => {
    const store = makeStore([
      {
        id: 'blog/post',
        rendered: { html: '<h1>Post</h1><p>Content</p>' },
        data: { title: 'Post', description: 'A blog post' },
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages[0].fullContent).toBe('<h1>Post</h1><p>Content</p>');
  });

  it('sets isOptional: true for entries with llmsOptional: true', () => {
    const store = makeStore([
      {
        id: 'legal/privacy',
        body: 'Privacy policy content.',
        data: { title: 'Privacy', description: 'Privacy policy', llmsOptional: true },
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages[0].isOptional).toBe(true);
  });

  it('sets isOptional: false for entries without the flag', () => {
    const store = makeStore([
      {
        id: 'docs/api',
        body: 'API docs.',
        data: { title: 'API', description: 'API reference' },
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages[0].isOptional).toBe(false);
  });

  it('uses entry.id as title fallback when data.title is missing', () => {
    const store = makeStore([
      {
        id: 'docs/unknown',
        body: 'Some content.',
        data: {},
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages[0].title).toBe('docs/unknown');
  });

  it('handles empty store gracefully', () => {
    const store = makeStore([]);
    const pages = fetchFromDataStore(store, options);
    expect(pages).toHaveLength(0);
  });

  it('normalises Windows-style backslash IDs to forward-slash URLs', () => {
    const store = makeStore([
      {
        id: 'docs\\windows',
        body: 'Win content.',
        data: { title: 'Win', description: 'Windows path' },
      },
    ]);

    const pages = fetchFromDataStore(store, options);
    expect(pages[0].relUrl).toBe('/docs/windows');
    expect(pages[0].url).toBe('https://example.com/docs/windows');
  });

  it('strips trailing slash from site URL', () => {
    const store = makeStore([
      { id: 'page', body: 'body', data: { title: 'P', description: 'D' } },
    ]);
    const pages = fetchFromDataStore(store, { site: 'https://example.com/' });
    expect(pages[0].url).toBe('https://example.com/page');
  });

  it('returns empty fullContent when both body and rendered are undefined', () => {
    const store = makeStore([
      { id: 'empty', data: { title: 'Empty', description: 'No content' } },
    ]);
    const pages = fetchFromDataStore(store, options);
    expect(pages[0].fullContent).toBe('');
  });

  it('returns empty summary when data.description is not a string', () => {
    const store = makeStore([
      { id: 'typed', body: 'body', data: { title: 'T', description: 42 } },
    ]);
    const pages = fetchFromDataStore(store, options);
    expect(pages[0].summary).toBe('');
  });

  it('prepends slash when entry id does not start with one', () => {
    const store = makeStore([
      { id: 'no-leading-slash', body: 'content', data: { title: 'Page' } },
    ]);
    const pages = fetchFromDataStore(store, options);
    expect(pages[0].relUrl).toBe('/no-leading-slash');
    expect(pages[0].url).toBe('https://example.com/no-leading-slash');
  });
});
