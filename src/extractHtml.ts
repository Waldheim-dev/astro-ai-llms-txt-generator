import * as cheerio from 'cheerio';

/**
 * Extracted content from HTML.
 */
export interface ExtractedContent {
  url: string;
  title?: string;
  description?: string;
  headings: string[];
  paragraphs: string[];
  section?: string;
}

/**
 * Extracts the text of the first occurrence of an HTML tag.
 * @param html - The HTML string.
 * @param tag - The tag name (e.g. 'h1').
 * @returns The extracted text or an empty string.
 */
export function extractTagText(html: string, tag: string): string {
  const $ = cheerio.load(html);
  const el = $(tag).first();
  return el.length ? el.text().trim() : '';
}

/**
 * Extracts the text of all occurrences of an HTML tag.
 * @param html - The HTML string.
 * @param tag - The tag name (e.g. 'h2').
 * @returns An array of extracted strings.
 */
export function extractAllTagsText(html: string, tag: string): string[] {
  const $ = cheerio.load(html);
  return $(tag)
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
}

/**
 * Extracts the value of a meta tag by name.
 * @param html - The HTML string.
 * @param name - The meta tag name (e.g. 'description').
 * @returns The meta tag value or an empty string.
 */
export function extractMetaContent(html: string, name: string): string {
  const $ = cheerio.load(html);
  const meta = $(`meta[name="${name}"]`).attr('content');
  return meta ? meta.trim() : '';
}

/**
 * Extracts all relevant content from HTML and groups it into an object.
 * @param html - The HTML string.
 * @param url - The associated URL.
 * @returns Object with title, description, headings, paragraphs, and section.
 */
export function extractHtmlContent(html: string, url: string): ExtractedContent {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const description = extractMetaContent(html, 'description');
  const headings = [
    ...$('h1')
      .map((_, el) => $(el).text().trim())
      .get(),
    ...$('h2')
      .map((_, el) => $(el).text().trim())
      .get(),
    ...$('h3')
      .map((_, el) => $(el).text().trim())
      .get(),
  ];
  const paragraphs = $('p')
    .map((_, el) => $(el).text().trim())
    .get();
  // Section from URL (e.g. /blog/)
  const sectionMatch = /^\/([^/]+)\//.exec(url);
  const section = sectionMatch ? sectionMatch[1] : '';
  return {
    url,
    title,
    description,
    headings,
    paragraphs,
    section,
  };
}

/**
 * Extracts and returns the inner HTML content of the first occurrence of a specified tag from a given HTML string.
 * @param html - The HTML string to search within.
 * @param tag - The tag name to extract content from (e.g., 'div', 'p').
 * @returns The trimmed inner HTML content of the first matching tag, or an empty string if the tag is not found.
 */
export function extractTagContent(html: string, tag: string): string {
  const $ = cheerio.load(html);
  const el = $(tag).first();
  const htmlContent = el.length ? el.html() : '';
  return htmlContent ? htmlContent.trim() : '';
}
