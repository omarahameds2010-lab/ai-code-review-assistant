export interface CodeChunkResult {
  content: string;
  chunkType: 'file' | 'block';
  startLine: number;
  endLine: number;
}

// Heuristic boundary matcher — good enough across JS/TS/Python/Java/PHP
// without needing a real per-language AST parser. It flags lines that
// commonly start a new top-level unit so chunks tend to break between
// functions/classes rather than mid-function.
const BOUNDARY_REGEX =
  /^(export\s+)?(default\s+)?(async\s+)?(function\s|class\s|interface\s|def\s|public\s|private\s|protected\s)/;

const MAX_CHUNK_LINES = 60;
const OVERLAP_LINES = 5;

/**
 * Splits a file's content into overlapping chunks for embedding.
 * Small files are returned as a single chunk (no point fragmenting them).
 */
export function chunkCode(content: string): CodeChunkResult[] {
  const lines = content.split('\n');

  if (lines.length <= MAX_CHUNK_LINES) {
    return [{ content, chunkType: 'file', startLine: 1, endLine: lines.length }];
  }

  const chunks: CodeChunkResult[] = [];
  let current: string[] = [];
  let start = 1;

  const flush = (endLine: number) => {
    if (current.length === 0) return;
    chunks.push({ content: current.join('\n'), chunkType: 'block', startLine: start, endLine });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBoundary = BOUNDARY_REGEX.test(line.trim());

    if (isBoundary && current.length > OVERLAP_LINES) {
      flush(i);
      current = current.slice(-OVERLAP_LINES);
      start = i - OVERLAP_LINES + 1;
    }

    current.push(line);

    if (current.length >= MAX_CHUNK_LINES) {
      flush(i + 1);
      current = current.slice(-OVERLAP_LINES);
      start = i - OVERLAP_LINES + 2;
    }
  }
  flush(lines.length);

  return chunks;
}
