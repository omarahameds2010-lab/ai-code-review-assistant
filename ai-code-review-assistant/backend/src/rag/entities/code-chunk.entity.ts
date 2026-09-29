import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { File } from '../../files/entities/file.entity';

@Entity('code_chunks')
export class CodeChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'text', nullable: true })
  language?: string;

  @Column({ type: 'text', nullable: true })
  chunkType?: string; // 'file' | 'block'

  @Column({ type: 'int', nullable: true })
  startLine?: number;

  @Column({ type: 'int', nullable: true })
  endLine?: number;

  @Column({ type: 'text', nullable: true, select: false })
  embedding?: string;

  @Column({ type: 'int' })
  chunkSize: number;

  @Index()
  @Column()
  fileId: string;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Index()
  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;
}