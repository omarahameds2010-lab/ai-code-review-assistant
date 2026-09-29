import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateChatSessionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  contextFileIds?: string[];
}
