import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lintGEO } from '../src/geo-linter';
import type { PageInfo } from '../src/formatter';

describe('geo-linter', () => {
  const logger = {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const page = (relUrl: string, fullContent: string): PageInfo => ({
    url: `https://example.com${relUrl}`,
    title: 'Test Page',
    summary: 'Summary',
    relUrl,
    fullContent,
  });

  it('does not warn for short, well-formed content', () => {
    lintGEO([page('/docs/intro', 'This is a short introduction.')], logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('warns when fullContent exceeds 400 words', () => {
    const longContent = 'word '.repeat(401).trim();
    lintGEO([page('/docs/long', longContent)], logger);

    expect(logger.warn).toHaveBeenCalledOnce();
    const msg = (logger.warn.mock.calls[0] as string[])[0];
    expect(msg).toContain('/docs/long');
    expect(msg).toContain('400 words');
  });

  it('includes the actual word count in the warning', () => {
    const content = 'word '.repeat(450).trim();
    lintGEO([page('/docs/page', content)], logger);

    const msg = (logger.warn.mock.calls[0] as string[])[0];
    expect(msg).toContain('450 words');
  });

  it('warns for a code fence without a language tag', () => {
    const content = 'Some text\n```\nconst x = 1;\n```\nMore text';
    lintGEO([page('/docs/code', content)], logger);

    expect(logger.warn).toHaveBeenCalledOnce();
    const msg = (logger.warn.mock.calls[0] as string[])[0];
    expect(msg).toContain('code fence');
    expect(msg).toContain('/docs/code');
  });

  it('does not warn for code fences that have a language tag', () => {
    const content = 'Some text\n```typescript\nconst x: number = 1;\n```\nMore text';
    lintGEO([page('/docs/code', content)], logger);

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('can accumulate multiple warnings for the same page', () => {
    const longContent = ('word '.repeat(401) + '\n```\ncode\n```').trim();
    lintGEO([page('/docs/bad', longContent)], logger);

    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('skips pages with no fullContent', () => {
    const noContent: PageInfo = {
      url: 'https://example.com/',
      title: 'Home',
      summary: 'Home page',
      relUrl: '/',
    };
    lintGEO([noContent], logger);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('processes multiple pages independently', () => {
    lintGEO(
      [
        page('/docs/good', 'Short content.'),
        page('/docs/bad', 'word '.repeat(410).trim()),
      ],
      logger
    );
    expect(logger.warn).toHaveBeenCalledOnce();
    const msg = (logger.warn.mock.calls[0] as string[])[0];
    expect(msg).toContain('/docs/bad');
  });
});
