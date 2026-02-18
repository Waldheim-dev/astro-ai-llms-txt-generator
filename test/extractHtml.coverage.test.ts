import { describe, it, expect } from 'vitest';
import { extractHtmlContent } from '../src/extractHtml';

describe('extractContentFromHtml', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta name="description" content="Test Description">
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
    expect(result.headings).toEqual([]);
    expect(result.paragraphs).toEqual([]);
    expect(result.section).toBe('foo');
  });
});
