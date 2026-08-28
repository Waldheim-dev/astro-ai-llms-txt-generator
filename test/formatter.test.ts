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

  describe('dataLlmMetadata in llms-full.txt', () => {
    it('appends dataLlmMetadata to the full content body', () => {
      const pageWithMeta: PageInfo = {
        url: 'https://example.com/pricing',
        title: 'Pricing',
        summary: 'Pricing page',
        relUrl: '/pricing',
        fullContent: 'Plan details here.',
        dataLlmMetadata: '\n\n<!-- LLM Metadata [div]: {"type":"pricing"} -->',
      };
      const { full } = generateLlmsTxtContent([pageWithMeta], options);
      expect(full).toContain('Plan details here.');
      expect(full).toContain('<!-- LLM Metadata [div]');
    });

    it('includes dataLlmMetadata correctly in XML output', () => {
      const pageWithMeta: PageInfo = {
        url: 'https://example.com/pricing',
        title: 'Pricing',
        summary: 'Pricing page',
        relUrl: '/pricing',
        fullContent: 'Plan details.',
        dataLlmMetadata: '\n\n<!-- LLM Metadata [div]: {"type":"pricing"} -->',
      };
      const { full } = generateLlmsTxtContent([pageWithMeta], { ...options, llmsFullFormat: 'xml' });
      expect(full).toContain('<content>');
      expect(full).toContain('<!-- LLM Metadata');
    });
  });

  describe('Optional section', () => {
    const optionalPage: PageInfo = {
      url: 'https://example.com/legal/privacy',
      title: 'Privacy Policy',
      summary: 'Our privacy policy',
      relUrl: '/legal/privacy',
      fullContent: 'Privacy policy content.',
      isOptional: true,
    };

    it('places isOptional pages under ## Optional, not in regular sections', () => {
      const { short } = generateLlmsTxtContent([...pages, optionalPage], options);

      expect(short).toContain('## Optional');
      expect(short).toContain('- [Privacy Policy](https://example.com/legal/privacy)');
      // Optional page must NOT appear under a "legal" section heading
      expect(short).not.toContain('## Legal');
    });

    it('regular pages are unaffected by the presence of optional pages', () => {
      const { short } = generateLlmsTxtContent([...pages, optionalPage], options);
      expect(short).toContain('## Blog');
      expect(short).toContain('## Docs');
    });

    it('omits ## Optional when there are no optional pages', () => {
      const { short } = generateLlmsTxtContent(pages, options);
      expect(short).not.toContain('## Optional');
    });

    it('includes optional page full content in llms-full.txt', () => {
      const { full } = generateLlmsTxtContent([...pages, optionalPage], options);
      expect(full).toContain('Privacy policy content.');
    });
  });

  describe('XML output format', () => {
    const xmlOptions: LlmsTxtOptions = { ...options, llmsFullFormat: 'xml' };

    it('wraps each page in <document> tags when llmsFullFormat is xml', () => {
      const { full } = generateLlmsTxtContent(pages, xmlOptions);
      expect(full).toContain('<documents>');
      expect(full).toContain('</documents>');
      expect(full).toContain('<document index="1">');
      expect(full).toContain('<document index="2">');
    });

    it('includes title, source and content elements per document', () => {
      const { full } = generateLlmsTxtContent(pages, xmlOptions);
      expect(full).toContain('<title>Blog Post 1</title>');
      expect(full).toContain('<source>https://example.com/blog/post1</source>');
      expect(full).toContain('<content>');
      expect(full).toContain('Full content of post 1');
    });

    it('generates a valid XML prolog', () => {
      const { full } = generateLlmsTxtContent(pages, xmlOptions);
      expect(full).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('short llms.txt content is unaffected by llmsFullFormat: xml', () => {
      const { short } = generateLlmsTxtContent(pages, xmlOptions);
      expect(short).toContain('# Test Project');
      expect(short).not.toContain('<document');
    });

    it('escapes XML special characters in titles and URLs', () => {
      const specialPage: PageInfo = {
        url: 'https://example.com/q?a=1&b=2',
        title: 'Title with <Tags> & "Quotes"',
        summary: 'Special chars',
        relUrl: '/q',
        fullContent: 'Content.',
      };
      const { full } = generateLlmsTxtContent([specialPage], xmlOptions);
      expect(full).toContain('&lt;Tags&gt;');
      expect(full).toContain('&amp;');
    });
  });

  it('groups pages with no sub-section URL into the General section', () => {
    const topLevelPage: PageInfo = {
      url: 'https://example.com/about',
      title: 'About',
      summary: 'About us',
      relUrl: '/about',
      fullContent: 'About page content.',
    };
    const { short } = generateLlmsTxtContent([topLevelPage], options);
    expect(short).toContain('## General');
    expect(short).toContain('About');
  });

  it('keeps dynamic metadata safe in Markdown link lists', () => {
    const page: PageInfo = {
      url: 'https://example.com/safe',
      title: 'A ] title',
      summary: 'A summary\nwith a new line',
      relUrl: '/safe',
    };
    const { short } = generateLlmsTxtContent([page], {
      projectName: 'Project\nName',
      description: 'Description\ntext',
    });
    expect(short).toContain('# Project Name');
    expect(short).toContain('> Description text');
    expect(short).toContain('- [A \\] title](https://example.com/safe): A summary with a new line');
  });
});
