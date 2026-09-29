import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum UploadType {
  ZIP = 'zip',
  FILES = 'files',
  GITHUB = 'github',
}

export class UploadFileDto {
  @IsEnum(UploadType)
  type: UploadType;

  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  files?: any[];
}
