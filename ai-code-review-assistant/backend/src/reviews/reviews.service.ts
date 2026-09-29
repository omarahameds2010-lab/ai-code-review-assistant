import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewTemplate, Severity } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { FilesService } from '../files/files.service';
import OpenAI from 'openai';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private aiProvidersService: AiProvidersService,
    private filesService: FilesService,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const { projectId, aiProviderId, fileIds, template, name } = createReviewDto;

    // Get AI provider
    const aiProvider = await this.aiProvidersService.findOne(aiProviderId, userId);
    
    // Get files to review
    let files;
    if (fileIds && fileIds.length > 0) {
      files = await Promise.all(
        fileIds.map(id => this.filesService.findOne(id, projectId)),
      );
    } else {
      files = await this.filesService.findByProject(projectId);
    }

    // Prepare code context
    const codeContext = files.map(file => ({
      path: file.path,
      content: file.content,
      language: file.language,
    }));

    // Generate review using AI
    const reviewResult = await this.generateReview(aiProvider, codeContext, template);

    // Create review record
    const review = this.reviewsRepository.create({
      name,
      summary: reviewResult.summary,
      issues: reviewResult.issues,
      recommendations: reviewResult.recommendations,
      template,
      fileIds: fileIds || files.map(f => f.id),
      projectId,
      aiProviderId,
    });

    return this.reviewsRepository.save(review);
  }

  private async generateReview(aiProvider: any, codeContext: any[], template: ReviewTemplate) {
    const openai = new OpenAI({
      apiKey: aiProvider.apiKey,
      baseURL: aiProvider.baseUrl,
    });

    const systemPrompt = this.getSystemPrompt(template);
    const userPrompt = this.buildUserPrompt(codeContext);

    try {
      const response = await openai.chat.completions.create({
        model: aiProvider.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content;
      return this.parseReviewResponse(content);
    } catch (error) {
      console.error('AI Review Error:', error);
      return this.getFallbackReview(template);
    }
  }

  private getSystemPrompt(template: ReviewTemplate): string {
    const prompts = {
      [ReviewTemplate.SECURITY]: `You are a security-focused code reviewer. Analyze the provided code for security vulnerabilities including:
- Hardcoded credentials or API keys
- Authentication and authorization issues
- Input validation problems
- SQL injection, XSS, and other injection risks
- Insecure data handling
- Missing security headers or configurations

Return your analysis in the following JSON format:
{
  "summary": "High-level overview of security findings",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "description": "Description of the security issue",
      "file": "file path",
      "line": line_number,
      "recommendation": "How to fix this issue"
    }
  ],
  "recommendations": ["General security recommendations"]
}`,

      [ReviewTemplate.PERFORMANCE]: `You are a performance-focused code reviewer. Analyze the provided code for performance issues including:
- Slow operations or inefficient algorithms
- Unnecessary database queries or N+1 problems
- Inefficient rendering or DOM operations
- Memory leaks or excessive memory usage
- Blocking operations that could be async
- Poor caching strategies

Return your analysis in the following JSON format:
{
  "summary": "High-level overview of performance findings",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "description": "Description of the performance issue",
      "file": "file path",
      "line": line_number,
      "recommendation": "How to optimize this"
    }
  ],
  "recommendations": ["General performance recommendations"]
}`,

      [ReviewTemplate.CODE_QUALITY]: `You are a code quality reviewer. Analyze the provided code for quality issues including:
- Naming conventions and code readability
- Code structure and organization
- Duplicated code that should be refactored
- Complex functions that should be simplified
- Missing error handling
- Inconsistent style or patterns
- Poor documentation

Return your analysis in the following JSON format:
{
  "summary": "High-level overview of code quality findings",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "description": "Description of the quality issue",
      "file": "file path",
      "line": line_number,
      "recommendation": "How to improve this"
    }
  ],
  "recommendations": ["General code quality recommendations"]
}`,
    };

    return prompts[template];
  }

  private buildUserPrompt(codeContext: any[]): string {
    let prompt = 'Review the following code:\n\n';
    
    codeContext.forEach((file, index) => {
      prompt += `File ${index + 1}: ${file.path}\n`;
      prompt += '```\n';
      prompt += file.content;
      prompt += '\n```\n\n';
    });

    return prompt;
  }

  private parseReviewResponse(content: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse structured text
      return {
        summary: content.substring(0, 500),
        issues: [],
        recommendations: [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        summary: content,
        issues: [],
        recommendations: [],
      };
    }
  }

  private getFallbackReview(template: ReviewTemplate): any {
    return {
      summary: `AI review failed for ${template} template. Please check your AI provider configuration.`,
      issues: [],
      recommendations: ['Verify AI provider credentials and connectivity'],
    };
  }

  async findAll(projectId: string, userId: string) {
    return this.reviewsRepository.find({
      where: { projectId },
      relations: ['aiProvider'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, projectId: string) {
    const review = await this.reviewsRepository.findOne({
      where: { id, projectId },
      relations: ['aiProvider'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async search(projectId: string, query: string) {
    const reviews = await this.findAll(projectId, null);
    return reviews.filter(review =>
      review.name.toLowerCase().includes(query.toLowerCase()) ||
      review.summary.toLowerCase().includes(query.toLowerCase()),
    );
  }

  async remove(id: string, projectId: string) {
    const review = await this.findOne(id, projectId);
    return this.reviewsRepository.remove(review);
  }
}
