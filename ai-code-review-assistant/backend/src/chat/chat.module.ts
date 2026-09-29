import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatSession } from './entities/chat-session.entity';
import { Message } from './entities/message.entity';
import { AiProvidersModule } from '../ai-providers/ai-providers.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, Message]),
    AiProvidersModule,
    FilesModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
