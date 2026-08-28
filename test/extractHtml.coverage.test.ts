import { describe, it, expect } from 'vitest';
import { extractHtmlContent, extractTagContent } from '../src/extractHtml';

describe('extractContentFromHtml', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta name="description" content="Test Description">
        <meta name="llms-optional" content="true">
      </head>
      <body>
        <h1>Headline</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <p>First paragraph.</p>
        <p>Second paragraph.</p>
      </body>
    </html>
  `;
  const url = '/blog/test.html';

  it('extracts all fields correctly', () => {
    const result = extractHtmlContent(html, url);
    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('Test Description');
    expect(result.h1).toBe('Headline');
    expect(result.h2).toEqual(['Section']);
    expect(result.h3).toEqual(['Subsection']);
    expect(result.isOptional).toBe(true);
    expect(result.headings).toEqual(['Headline', 'Section', 'Subsection']);
    expect(result.paragraphs).toEqual(['First paragraph.', 'Second paragraph.']);
    expect(result.section).toBe('blog');
    expect(result.url).toBe(url);
  });

  it('handles missing tags gracefully', () => {
    const emptyHtml = '<html><body></body></html>';
    const result = extractHtmlContent(emptyHtml, '/foo/bar.html');
    expect(result.title).toBe('');
    expect(result.description).toBe('');
    expect(result.h1).toBe('');
    expect(result.h2).toEqual([]);
    expect(result.h3).toEqual([]);
    expect(result.isOptional).toBe(false);
    expect(result.headings).toEqual([]);
    expect(result.paragraphs).toEqual([]);
    expect(result.section).toBe('foo');
  });
});

describe('extractTagContent', () => {
  it('returns trimmed inner HTML when tag is found', () => {
    const html = '<html><body><div>  <strong>hello</strong>  </div></body></html>';
    const result = extractTagContent(html, 'div');
    expect(result).toBe('<strong>hello</strong>');
  });

  it('returns empty string when tag is not found', () => {
    const html = '<html><body></body></html>';
    const result = extractTagContent(html, 'article');
    expect(result).toBe('');
  });

  it('returns empty string when tag is present but has no inner HTML', () => {
    const html = '<html><body><div></div></body></html>';
    const result = extractTagContent(html, 'div');
    expect(result).toBe('');
  });
});

describe('extractHtmlContent section matching', () => {
  it('returns empty section when URL has no sub-path segment', () => {
    const html = '<html><head><title>About</title></head><body></body></html>';
    const result = extractHtmlContent(html, '/about');
    expect(result.section).toBe('');
    expect(result.title).toBe('About');
  });
});
