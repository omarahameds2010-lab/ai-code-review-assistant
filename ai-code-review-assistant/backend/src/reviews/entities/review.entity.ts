import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { AiProvider } from '../../ai-providers/entities/ai-provider.entity';

export enum ReviewTemplate {
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CODE_QUALITY = 'code_quality',
}

export enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'simple-json' })
  issues: Array<{
    severity: Severity;
    description: string;
    file?: string;
    line?: number;
    recommendation: string;
  }>;

  @Column({ type: 'simple-json' })
  recommendations: string[];

  @Column({
    type: 'simple-enum',
    enum: ReviewTemplate,
    default: ReviewTemplate.CODE_QUALITY,
  })
  template: ReviewTemplate;

  @Column({ type: 'simple-json', nullable: true })
  fileIds?: string[];

  @ManyToOne(() => Project, (project) => project.reviews)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @ManyToOne(() => AiProvider, (provider) => provider.reviews)
  @JoinColumn({ name: 'aiProviderId' })
  aiProvider: AiProvider;

  @Column()
  aiProviderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}