import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiProvider } from './entities/ai-provider.entity';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';

@Injectable()
export class AiProvidersService {
  constructor(
    @InjectRepository(AiProvider)
    private aiProvidersRepository: Repository<AiProvider>,
  ) {}

  async create(createAiProviderDto: CreateAiProviderDto, userId: string) {
    // If this is set as default, unset other defaults
    if (createAiProviderDto.isDefault) {
      await this.aiProvidersRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const provider = this.aiProvidersRepository.create({
      ...createAiProviderDto,
      userId,
    });
    return this.aiProvidersRepository.save(provider);
  }

  async findAll(userId: string) {
    return this.aiProvidersRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const provider = await this.aiProvidersRepository.findOne({
      where: { id, userId },
    });
    if (!provider) {
      throw new NotFoundException('AI Provider not found');
    }
    return provider;
  }

  async getDefault(userId: string) {
    return this.aiProvidersRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async update(id: string, updateAiProviderDto: Partial<CreateAiProviderDto>, userId: string) {
    const provider = await this.findOne(id, userId);

    // If this is set as default, unset other defaults
    if (updateAiProviderDto.isDefault) {
      await this.aiProvidersRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(provider, updateAiProviderDto);
    return this.aiProvidersRepository.save(provider);
  }

  async remove(id: string, userId: string) {
    const provider = await this.findOne(id, userId);
    return this.aiProvidersRepository.remove(provider);
  }
}
