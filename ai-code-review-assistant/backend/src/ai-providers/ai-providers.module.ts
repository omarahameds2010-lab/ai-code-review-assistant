import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiProvidersService } from './ai-providers.service';
import { AiProvider } from './entities/ai-provider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiProvider]),
  ],
  providers: [AiProvidersService],
  exports: [AiProvidersService],
})
export class AiProvidersModule {}