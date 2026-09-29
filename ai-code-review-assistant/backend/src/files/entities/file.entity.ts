import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  size?: number;

  @Column({ nullable: true })
  language?: string;

  @Column({ default: false })
  isDirectory: boolean;

  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Project, (project) => project.files)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
