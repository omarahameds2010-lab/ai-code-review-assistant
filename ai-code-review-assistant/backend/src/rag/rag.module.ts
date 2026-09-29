import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodeChunk } from './entities/code-chunk.entity';
import { RagService } from './rag.service';

@Module({
  imports: [TypeOrmModule.forFeature([CodeChunk])],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
