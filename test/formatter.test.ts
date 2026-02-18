import { describe, it, expect } from 'vitest';
import { generateLlmsTxtContent, type PageInfo } from '../src/formatter';
import type { LlmsTxtOptions } from '../src/types';

describe('formatter', () => {
  const pages: PageInfo[] = [
    {
      url: 'https://example.com/blog/post1',
      title: 'Blog Post 1',
      summary: 'Summary 1',
      relUrl: '/blog/post1',
      fullContent: 'Full content of post 1',
    },
    {
      url: 'https://example.com/docs/guide',
      title: 'User Guide',
      summary: 'Summary Guide',
      relUrl: '/docs/guide',
      fullContent: 'Full content of guide',
    },
  ];

  const options: LlmsTxtOptions = {
    projectName: 'Test Project',
    description: 'Test Description',
    llmsFull: true,
  };

  it('generates correct llms.txt content', () => {
    const { short } = generateLlmsTxtContent(pages, options);

    expect(short).toContain('# Test Project');
    expect(short).toContain('> Test Description');

    // Check Sections
    expect(short).toContain('## Blog');
    expect(short).toContain('- [Blog Post 1](https://example.com/blog/post1): Summary 1');

    expect(short).toContain('## Docs');
    expect(short).toContain('- [User Guide](https://example.com/docs/guide): Summary Guide');
  });

  it('generates correct llms-full.txt content when enabled', () => {
    const { full } = generateLlmsTxtContent(pages, options);

    expect(full).toBeDefined();
    expect(full).toContain('# Test Project - Full Content');

    expect(full).toContain('## Blog Post 1');
    expect(full).toContain('URL: https://example.com/blog/post1');
    expect(full).toContain('Full content of post 1');

    expect(full).toContain('## User Guide');
    expect(full).toContain('Full content of guide');
  });

  it('does not generate full content if disabled', () => {
    const { full } = generateLlmsTxtContent(pages, { ...options, llmsFull: false });
    expect(full).toBeUndefined();
  });
});
