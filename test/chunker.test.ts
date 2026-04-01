import { describe, it, expect } from 'vitest';
import { chunkContent, formatChunkWithMetadata, cosineSimilarity } from '../src/chunker';

const TITLE = 'Test Doc';
const FILE = '/docs/test.md';

describe('chunker', () => {
  describe("strategy: 'none' (default)", () => {
    it('returns a single chunk containing the full text', async () => {
      const text = 'Hello world. This is content.';
      const chunks = await chunkContent(text, TITLE, FILE);
      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe(text);
    });

    it('sets correct metadata on the chunk', async () => {
      const text = '# My Heading\nSome text.';
      const [chunk] = await chunkContent(text, TITLE, FILE);
      expect(chunk.metadata.title).toBe(TITLE);
      expect(chunk.metadata.filePath).toBe(FILE);
      expect(chunk.metadata.index).toBe(0);
      expect(chunk.metadata.topic).toBe('My Heading');
    });

    it('uses title as topic when no heading present', async () => {
      const [chunk] = await chunkContent('Just plain prose.', TITLE, FILE);
      expect(chunk.metadata.topic).toBe(TITLE);
    });
  });

  describe("strategy: 'fixed'", () => {
    it('splits text into fixed-size chunks', async () => {
      const text = 'a'.repeat(3000);
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'fixed', chunkSize: 1000, chunkOverlap: 0 });
      expect(chunks).toHaveLength(3);
      expect(chunks[0].text).toHaveLength(1000);
      expect(chunks[1].text).toHaveLength(1000);
      expect(chunks[2].text).toHaveLength(1000);
    });

    it('gives each chunk a sequential index', async () => {
      const text = 'b'.repeat(2000);
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'fixed', chunkSize: 500, chunkOverlap: 0 });
      chunks.forEach((c, i) => expect(c.metadata.index).toBe(i));
    });

    it('applies overlap between chunks', async () => {
      const text = 'abcde'.repeat(400); // 2000 chars
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'fixed', chunkSize: 1000, chunkOverlap: 200 });
      // With 200-char overlap the second chunk starts 800 chars into the first
      expect(chunks[0].text.slice(-200)).toBe(chunks[1].text.slice(0, 200));
    });

    it('produces a single chunk when text is shorter than chunkSize', async () => {
      const chunks = await chunkContent('Short.', TITLE, FILE, { strategy: 'fixed', chunkSize: 1000 });
      expect(chunks).toHaveLength(1);
    });
  });

  describe("strategy: 'recursive'", () => {
    it('prefers splitting on double newlines', async () => {
      const part1 = 'First paragraph of content here. '.repeat(20); // ~660 chars
      const part2 = 'Second paragraph goes here. '.repeat(20);      // ~560 chars
      const text = part1 + '\n\n' + part2;
      const chunks = await chunkContent(text, TITLE, FILE, {
        strategy: 'recursive',
        chunkSize: 700,
        chunkOverlap: 0,
      });
      expect(chunks.length).toBeGreaterThanOrEqual(2);
    });

    it('returns a single chunk for short text', async () => {
      const chunks = await chunkContent('Short.', TITLE, FILE, { strategy: 'recursive', chunkSize: 1000 });
      expect(chunks).toHaveLength(1);
      expect(chunks[0].text).toBe('Short.');
    });

    it('assigns sequential indices', async () => {
      const longText = 'word '.repeat(600);
      const chunks = await chunkContent(longText, TITLE, FILE, { strategy: 'recursive', chunkSize: 200 });
      chunks.forEach((c, i) => expect(c.metadata.index).toBe(i));
    });
  });

  describe("strategy: 'structure'", () => {
    it('splits on Markdown headings', async () => {
      const text = `# Heading One\nContent A.\n\n## Heading Two\nContent B.\n\n### Heading Three\nContent C.`;
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'structure' });
      expect(chunks).toHaveLength(3);
      expect(chunks[0].text).toContain('Heading One');
      expect(chunks[1].text).toContain('Heading Two');
      expect(chunks[2].text).toContain('Heading Three');
    });

    it('keeps code fences intact and does not split inside them', async () => {
      const text = `# Setup\n\`\`\`bash\n## fake heading inside fence\necho done\n\`\`\`\n\n## Next Section\nContent`;
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'structure' });
      // The fake heading inside the fence must not cause a split
      const setupChunk = chunks.find((c) => c.text.includes('fake heading'));
      expect(setupChunk).toBeDefined();
      expect(setupChunk!.text).toContain('```bash');
      expect(setupChunk!.text).toContain('echo done');
    });

    it('uses the heading text as the chunk topic', async () => {
      const text = `## API Reference\nEndpoints here.`;
      const [chunk] = await chunkContent(text, TITLE, FILE, { strategy: 'structure' });
      expect(chunk.metadata.topic).toBe('API Reference');
    });

    it('returns a single chunk when there are no headings', async () => {
      const chunks = await chunkContent('No headings here.', TITLE, FILE, { strategy: 'structure' });
      expect(chunks).toHaveLength(1);
    });
  });

  describe("strategy: 'semantic'", () => {
    it('returns chunks (falls back to structure when transformers not available)', async () => {
      const text = `# Intro\nHello world.\n\n## Details\nMore info.`;
      const chunks = await chunkContent(text, TITLE, FILE, { strategy: 'semantic' });
      expect(chunks.length).toBeGreaterThanOrEqual(1);
      for (const c of chunks) {
        expect(c.text.length).toBeGreaterThan(0);
        expect(c.metadata.title).toBe(TITLE);
      }
    });
  });

  describe('formatChunkWithMetadata', () => {
    it('prepends metadata header lines to the chunk text', () => {
      const chunk = {
        text: 'Some content here.',
        metadata: { title: 'My Doc', filePath: '/docs/my.md', topic: 'Overview', index: 0 },
      };
      const result = formatChunkWithMetadata(chunk);
      expect(result).toContain('Document_Title: My Doc');
      expect(result).toContain('Topic: Overview');
      expect(result).toContain('File_Path: /docs/my.md');
      expect(result).toContain('Some content here.');
    });
  });

  describe('cosineSimilarity', () => {
    it('returns 1.0 for identical unit vectors', () => {
      const a = [1, 0, 0];
      expect(cosineSimilarity(a, a)).toBeCloseTo(1.0);
    });

    it('returns 0.0 for orthogonal vectors', () => {
      expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0);
    });

    it('returns 0.0 when either vector is a zero vector', () => {
      expect(cosineSimilarity([0, 0, 0], [1, 2, 3])).toBe(0);
      expect(cosineSimilarity([1, 2, 3], [0, 0, 0])).toBe(0);
    });

    it('returns the correct similarity for known vectors', () => {
      // [1,1,0] and [1,0,1]: dot=1, norms=sqrt(2)*sqrt(2)=2, sim=0.5
      expect(cosineSimilarity([1, 1, 0], [1, 0, 1])).toBeCloseTo(0.5);
    });

    it('returns 1.0 for scaled identical vectors', () => {
      expect(cosineSimilarity([2, 4, 6], [1, 2, 3])).toBeCloseTo(1.0);
    });

    it('returns -1.0 for perfectly opposing vectors', () => {
      expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
    });
  });
});
