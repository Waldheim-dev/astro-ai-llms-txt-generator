import { describe, it, expect } from 'vitest';
import { extractTagText, extractMetaContent } from '../src/extractHtml';

describe('extractHtml helpers', () => {
  const html = `
    <html>
      <head>
        <title>Test Title</title>
        <meta name="description" content="Test Description">
      </head>
      <body>
        <h1>Headline</h1>
        <p>First paragraph.</p>
        <h2>Section</h2>
        <h3>Subsection</h3>
        <p>Second paragraph.</p>
      </body>
    </html>
  `;

  it('extracts title tag', () => {
  expect(extractTagText(html, 'title')).toBe('Test Title');
  });

  it('extracts meta description', () => {
    expect(extractMetaContent(html, 'description')).toBe('Test Description');
  });

  it('extracts h1 tag', () => {
  expect(extractTagText(html, 'h1')).toBe('Headline');
  });

  it('extracts first p tag', () => {
  expect(extractTagText(html, 'p')).toBe('First paragraph.');
  });
});
