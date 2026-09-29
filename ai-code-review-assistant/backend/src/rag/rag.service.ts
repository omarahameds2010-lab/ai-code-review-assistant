import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import OpenAI from 'openai';
import { CodeChunk } from './entities/code-chunk.entity';
import { chunkCode } from './utils/code-chunker.util';

interface IngestFile {
  id: string;
  path: string;
  content: string;
  language?: string;
}

interface SearchResult {
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  distance: number;
}

const EMBEDDING_MODEL = 'text-embedding-3-small'; // 1536 dimensions
const MAX_CONTEXT_CHARS = 12000; // ~3-4k tokens budget for retrieved context

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @InjectRepository(CodeChunk)
    private chunkRepo: Repository<CodeChunk>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Embeddings always go through a dedicated OpenAI key, independent of
   * whichever aiProvider the user picked for chat/review completions.
   * Local/self-hosted providers (Ollama, LM Studio) generally don't serve
   * text-embedding-3-small, so RAG would silently break if it reused
   * aiProvider.apiKey. Set OPENAI_EMBEDDING_API_KEY in .env (falls back to
   * OPENAI_API_KEY if you only have one OpenAI key).
   */
  private getEmbeddingClient(): OpenAI {
    const apiKey = process.env.OPENAI_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing OPENAI_EMBEDDING_API_KEY (or OPENAI_API_KEY) in .env — required for RAG embeddings.',
      );
    }
    return new OpenAI({ apiKey });
  }

  private async embed(texts: string[]): Promise<number[][]> {
    const openai = this.getEmbeddingClient();
    const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
    return res.data.map((d) => d.embedding);
  }

  private toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  /** Chunks a file, embeds every chunk, stores rows via raw SQL. */
  async indexFile(projectId: string, file: IngestFile): Promise<number> {
    // Wipe old chunks for this file so re-uploads don't duplicate context.
    await this.chunkRepo.delete({ fileId: file.id });

    const pieces = chunkCode(file.content);
    if (pieces.length === 0) return 0;

    const embeddings = await this.embed(pieces.map((p) => p.content));

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    try {
      for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        await runner.query(
          `INSERT INTO code_chunks
             (id, content, "filePath", language, "chunkType", "startLine", "endLine", "chunkSize", "fileId", "projectId", "createdAt", embedding)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10::vector)`,
          [
            piece.content,
            file.path,
            file.language ?? null,
            piece.chunkType,
            piece.startLine,
            piece.endLine,
            piece.content.length,
            file.id,
            projectId,
            this.toVectorLiteral(embeddings[i]),
          ],
        );
      }
    } finally {
      await runner.release();
    }

    this.logger.log(`Indexed ${pieces.length} chunk(s) for ${file.path}`);
    return pieces.length;
  }

  /** Indexes many files at once (call this right after upload / on-demand before a scan). */
  async indexFiles(projectId: string, files: IngestFile[]): Promise<number> {
    let total = 0;
    for (const file of files) {
      total += await this.indexFile(projectId, file);
    }
    return total;
  }

  /**
   * Semantic search: returns the top-K chunks most relevant to `query`,
   * scoped to a project and optionally a subset of fileIds.
   */
  async search(
    projectId: string,
    query: string,
    opts: { fileIds?: string[]; limit?: number } = {},
  ): Promise<SearchResult[]> {
    const [queryEmbedding] = await this.embed([query]);
    const vectorLiteral = this.toVectorLiteral(queryEmbedding);
    const limit = opts.limit ?? 8;

    const params: any[] = [vectorLiteral, projectId];
    let fileFilter = '';
    if (opts.fileIds && opts.fileIds.length > 0) {
      params.push(opts.fileIds);
      fileFilter = `AND "fileId" = ANY($${params.length})`;
    }
    params.push(limit);

    return this.dataSource.query(
      `SELECT content, "filePath", "startLine", "endLine",
              embedding <=> $1::vector AS distance
       FROM code_chunks
       WHERE "projectId" = $2 ${fileFilter}
       ORDER BY embedding <=> $1::vector ASC
       LIMIT $${params.length}`,
      params,
    );
  }

  /** Builds a ready-to-inject prompt context string, capped by size. */
  async buildContext(
    projectId: string,
    query: string,
    opts: { fileIds?: string[]; limit?: number } = {},
  ): Promise<string> {
    const results = await this.search(projectId, query, opts);
    let context = '';
    for (const r of results) {
      const block = `\n\nFile: ${r.filePath} (lines ${r.startLine}-${r.endLine})\n\`\`\`\n${r.content}\n\`\`\`\n`;
      if (context.length + block.length > MAX_CONTEXT_CHARS) break;
      context += block;
    }
    return context;
  }
}
