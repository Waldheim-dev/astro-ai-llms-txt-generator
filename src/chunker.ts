export interface Chunk {
  text: string;
  metadata: {
    title: string;
    filePath: string;
    topic: string;
    index: number;
  };
}

export interface ChunkingOptions {
  strategy?: 'none' | 'fixed' | 'recursive' | 'structure' | 'semantic';
  /** Target chunk size in characters (default: 1500). */
  chunkSize?: number;
  /** Character overlap between adjacent chunks (default: 200). */
  chunkOverlap?: number;
  /** Cosine similarity threshold for semantic chunking (default: 0.5). */
  similarityThreshold?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeChunk(text: string, title: string, filePath: string, index: number): Chunk {
  const headingMatch = /^#{1,6}\s+(.+)$/m.exec(text);
  const topic = headingMatch ? headingMatch[1].trim() : title;
  return { text, metadata: { title, filePath, topic, index } };
}

function fixedChunk(
  text: string,
  title: string,
  filePath: string,
  chunkSize: number,
  chunkOverlap: number
): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(makeChunk(text.slice(start, end), title, filePath, index));
    index += 1;
    if (end === text.length) break;
    start += chunkSize - chunkOverlap;
  }
  return chunks;
}

function recursiveChunk(
  text: string,
  title: string,
  filePath: string,
  chunkSize: number,
  chunkOverlap: number
): Chunk[] {
  const separators = ['\n\n', '\n', ' '];
  // Ensure overlap never equals or exceeds chunk size to prevent infinite recursion
  const effectiveOverlap = Math.min(chunkOverlap, Math.floor(chunkSize / 2));

  function split(str: string): string[] {
    if (str.length <= chunkSize) return [str];
    for (let si = 0; si < separators.length; si += 1) {
      const sep = separators[si];
      const idx = str.lastIndexOf(sep, chunkSize);
      if (idx > 0) {
        const left = str.slice(0, idx);
        const right = str.slice(idx + sep.length);
        const overlap = left.length > effectiveOverlap ? left.slice(-effectiveOverlap) : left;
        return [left, ...split(overlap + right)];
      }
    }
    // Hard split when no separator found within chunkSize
    const left = str.slice(0, chunkSize);
    const right = str.slice(chunkSize - effectiveOverlap);
    return [left, ...split(right)];
  }

  return split(text).map((chunk, index) => makeChunk(chunk, title, filePath, index));
}

function structureChunk(text: string, title: string, filePath: string): Chunk[] {
  const lines = text.split('\n');
  const chunks: Chunk[] = [];
  let current = '';
  let inCodeFence = false;
  let index = 0;

  lines.forEach((line) => {
    // Track code fence boundaries to avoid splitting inside them
    if (/^```/.test(line)) {
      inCodeFence = !inCodeFence;
      current += `${line}\n`;
    } else {
      // Split on heading lines only when not inside a code fence
      if (!inCodeFence && /^#{1,3}\s/.test(line) && current.trim()) {
        chunks.push(makeChunk(current.trim(), title, filePath, index));
        index += 1;
        current = '';
      }
      current += `${line}\n`;
    }
  });

  if (current.trim()) {
    chunks.push(makeChunk(current.trim(), title, filePath, index));
  }

  return chunks.length > 0 ? chunks : [makeChunk(text, title, filePath, 0)];
}

/**
 * Computes the cosine similarity between two equal-length numeric vectors.
 * Returns 0 when either vector has zero magnitude.
 *
 * Exported for direct testing.
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Cosine similarity in range [0, 1].
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Semantic chunking using cosine similarity of sentence embeddings.
 * Cosine similarity: sim(a, b) = (a · b) / (‖a‖ · ‖b‖)
 * A new chunk boundary is set when sim < threshold.
 *
 * Requires optional peer `@xenova/transformers`. Falls back to structure chunking.
 * @param text - Full page text.
 * @param title - Page title metadata.
 * @param filePath - Source file path metadata.
 * @param threshold - Similarity threshold below which a new chunk starts.
 * @returns Array of Chunk objects.
 */
async function semanticChunk(
  text: string,
  title: string,
  filePath: string,
  threshold: number
): Promise<Chunk[]> {
  try {
    // Use Function constructor to avoid TypeScript static resolution of optional peer dep
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const importFn = new Function('n', 'return import(n)') as (n: string) => Promise<unknown>;
    /* v8 ignore start */
    const { pipeline } = (await importFn('@xenova/transformers')) as {
      pipeline: (
        task: string,
        model: string
      ) => Promise<
        (
          input: string[],
          options: { pooling: string; normalize: boolean }
        ) => Promise<{ data: Float32Array }[]>
      >;
    };
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    // Sentence-level splitting
    const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) ?? [text];
    if (sentences.length <= 1) return [makeChunk(text, title, filePath, 0)];

    const embeddings = await Promise.all(
      sentences.map(async (s) => {
        const output = await extractor([s], { pooling: 'mean', normalize: true });
        return Array.from(output[0].data) as number[];
      })
    );

    const chunks: Chunk[] = [];
    let current = sentences[0];
    let index = 0;

    for (let i = 1; i < sentences.length; i += 1) {
      const sim = cosineSimilarity(embeddings[i - 1], embeddings[i]);
      if (sim < threshold) {
        chunks.push(makeChunk(current.trim(), title, filePath, index));
        index += 1;
        current = sentences[i];
      } else {
        current += sentences[i];
      }
    }
    if (current.trim()) chunks.push(makeChunk(current.trim(), title, filePath, index));
    return chunks;
    /* v8 ignore stop */
  } catch {
    // @xenova/transformers not installed — fall back to structure chunking
    return structureChunk(text, title, filePath);
  }
}

/**
 * Formats a chunk into a human/LLM-readable string with context headers prefixed.
 * Suitable for inclusion in llms-full.txt or JSONL export.
 * @param chunk - The chunk to format.
 * @returns Formatted string with metadata header.
 */
export function formatChunkWithMetadata(chunk: Chunk): string {
  return `Document_Title: ${chunk.metadata.title}\nTopic: ${chunk.metadata.topic}\nFile_Path: ${chunk.metadata.filePath}\n\n${chunk.text}`;
}

/**
 * Splits text content into semantic chunks according to the chosen strategy.
 *
 * Strategies:
 *  - 'none'      : Returns a single chunk containing the full text (default).
 *  - 'fixed'     : Splits at fixed character intervals with configurable overlap.
 *  - 'recursive' : Splits at natural separators (\n\n → \n → space) with overlap.
 *  - 'structure' : Splits on Markdown headings (#, ##, ###); keeps code fences intact.
 *  - 'semantic'  : Groups sentences by cosine similarity of vector embeddings.
 *                  Requires the optional peer `@xenova/transformers`. Falls back to
 *                  structure chunking when the package is not installed.
 *
 * Each chunk is prefixed with a metadata header so that RAG systems retain context.
 * @param text - The full page text to split.
 * @param title - Page title used as metadata.
 * @param filePath - Source file path used as metadata.
 * @param options - Chunking configuration.
 * @returns Array of Chunk objects.
 */
export async function chunkContent(
  text: string,
  title: string,
  filePath: string,
  options: ChunkingOptions = {}
): Promise<Chunk[]> {
  const {
    strategy = 'none',
    chunkSize = 1500,
    chunkOverlap = 200,
    similarityThreshold = 0.5,
  } = options;

  switch (strategy) {
    case 'fixed':
      return fixedChunk(text, title, filePath, chunkSize, chunkOverlap);
    case 'recursive':
      return recursiveChunk(text, title, filePath, chunkSize, chunkOverlap);
    case 'structure':
      return structureChunk(text, title, filePath);
    case 'semantic':
      return semanticChunk(text, title, filePath, similarityThreshold);
    default:
      return [makeChunk(text, title, filePath, 0)];
  }
}
