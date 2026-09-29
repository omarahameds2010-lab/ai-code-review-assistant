import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { AiProvider } from '../../ai-providers/entities/ai-provider.entity';
import { ChatSession } from '../../chat/entities/chat-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];

  @OneToMany(() => AiProvider, (provider) => provider.user)
  aiProviders: AiProvider[];

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions: ChatSession[];
}
