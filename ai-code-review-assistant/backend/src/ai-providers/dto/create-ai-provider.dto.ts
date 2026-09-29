import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateAiProviderDto {
  @IsString()
  name: string;

  @IsString()
  baseUrl: string;

  @IsString()
  apiKey: string;

  @IsString()
  modelName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
