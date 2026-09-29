import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      userId,
    });
    return this.projectsRepository.save(project);
  }

  async findAll(userId: string) {
    return this.projectsRepository.find({
      where: { userId },
      relations: ['files', 'reviews'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id, userId },
      relations: ['files', 'reviews'],
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);
    return this.projectsRepository.remove(project);
  }
}
