import { describe, it, expect } from 'vitest';
import {
  extractTagText,
  extractMetaContent,
  extractHtmlContent,
  extractTagContent,
  extractAllTagsText,
} from '../src/extractHtml';

describe('extractHtml', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta name="description" content="Test Description">
      </head>
      <body>
        <h1>Main Heading</h1>
        <h2>Sub 1</h2>
        <h2>Sub 2</h2>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <div><span>Inner</span></div>
      </body>
    </html>
  `;

  it('extractTagText returns trimmed text', () => {
    expect(extractTagText(html, 'title')).toBe('Test Title');
    expect(extractTagText(html, 'h1')).toBe('Main Heading');
    expect(extractTagText(html, 'unknown')).toBe('');
  });

  it('extractAllTagsText returns all occurrences', () => {
    expect(extractAllTagsText(html, 'h2')).toEqual(['Sub 1', 'Sub 2']);
    expect(extractAllTagsText(html, 'p')).toEqual(['Paragraph 1', 'Paragraph 2']);
  });

  it('extractMetaContent returns content attribute', () => {
    expect(extractMetaContent(html, 'description')).toBe('Test Description');
    expect(extractMetaContent(html, 'keywords')).toBe('');
  });

  it('extractHtmlContent returns full object', () => {
    const result = extractHtmlContent(html, '/blog/test');
    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('Test Description');
    expect(result.headings).toContain('Main Heading');
    expect(result.headings).toContain('Sub 1');
    expect(result.paragraphs).toContain('Paragraph 1');
    expect(result.section).toBe('blog');
  });

  it('extractTagContent returns inner HTML', () => {
    expect(extractTagContent(html, 'div')).toBe('<span>Inner</span>');
  });
});
