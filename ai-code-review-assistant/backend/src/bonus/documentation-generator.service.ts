import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import OpenAI from 'openai';

export enum DocumentationType {
  README = 'readme',
  SETUP_GUIDE = 'setup_guide',
  API_DOCS = 'api_docs',
}

@Injectable()
export class DocumentationGeneratorService {
  constructor(
    private filesService: FilesService,
    private aiProvidersService: AiProvidersService,
  ) {}

  async generateDocumentation(
    projectId: string,
    userId: string,
    type: DocumentationType,
    fileIds?: string[],
  ) {
    // Get files
    let files;
    if (fileIds && fileIds.length > 0) {
      files = await Promise.all(
        fileIds.map(id => this.filesService.findOne(id, projectId)),
      );
    } else {
      files = await this.filesService.findByProject(projectId);
    }

    // Get default AI provider
    const aiProvider = await this.aiProvidersService.getDefault(userId);
    if (!aiProvider) {
      throw new Error('No default AI provider configured');
    }

    // Build code context
    const codeContext = files.map(file => ({
      path: file.path,
      content: file.content,
      language: file.language,
    }));

    // Generate documentation
    return this.generateDocs(aiProvider, codeContext, type);
  }

  private async generateDocs(aiProvider: any, codeContext: any[], type: DocumentationType) {
    const openai = new OpenAI({
      apiKey: aiProvider.apiKey,
      baseURL: aiProvider.baseUrl,
    });

    const systemPrompt = this.getSystemPrompt(type);
    const userPrompt = this.buildUserPrompt(codeContext);

    try {
      const response = await openai.chat.completions.create({
        model: aiProvider.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 4000,
      });

      return {
        type,
        content: response.choices[0].message.content,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Documentation Generation Error:', error);
      throw new Error('Failed to generate documentation');
    }
  }

  private getSystemPrompt(type: DocumentationType): string {
    const prompts = {
      [DocumentationType.README]: `You are a technical documentation writer. Generate a comprehensive README.md file for the provided codebase. Include:
- Project title and brief description
- Features
- Installation/setup instructions
- Usage examples
- Project structure
- Dependencies
- Contributing guidelines
- License

Use Markdown formatting. Be concise but informative.`,

      [DocumentationType.SETUP_GUIDE]: `You are a technical documentation writer. Generate a detailed setup guide for the provided codebase. Include:
- Prerequisites (software, tools, dependencies)
- Step-by-step installation instructions
- Configuration steps (environment variables, config files)
- Database setup if applicable
- Running the application (development and production)
- Common issues and troubleshooting

Use Markdown formatting with code blocks for commands.`,

      [DocumentationType.API_DOCS]: `You are a technical documentation writer. Generate API documentation for the provided codebase. Include:
- Overview of the API
- Authentication methods
- Endpoints with:
  - HTTP method and path
  - Description
  - Request parameters (query, path, body)
  - Request examples
  - Response format
  - Response examples
- Error codes and handling
- Rate limiting if applicable

Use Markdown formatting with code blocks for examples.`,
    };

    return prompts[type];
  }

  private buildUserPrompt(codeContext: any[]): string {
    let prompt = 'Generate documentation for the following codebase:\n\n';
    
    codeContext.forEach((file, index) => {
      prompt += `File ${index + 1}: ${file.path}\n`;
      prompt += '```\n';
      prompt += file.content;
      prompt += '\n```\n\n';
    });

    return prompt;
  }
}
