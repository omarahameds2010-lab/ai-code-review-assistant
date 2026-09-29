import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ReviewTemplate } from '../entities/review.entity';

export class CreateReviewDto {
  @IsString()
  name: string;

  @IsEnum(ReviewTemplate)
  template: ReviewTemplate;

  @IsString()
  projectId: string;

  @IsString()
  aiProviderId: string;

  @IsOptional()
  @IsArray()
  fileIds?: string[];
}
