import { IsString, IsEnum } from 'class-validator';
import { MessageRole } from '../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  sessionId: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsString()
  content: string;
}
