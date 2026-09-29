import { Injectable } from '@nestjs/common';
import { FilesService } from '../files/files.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import OpenAI from 'openai';

export enum DebtPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface DebtIssue {
  priority: DebtPriority;
  category: string;
  description: string;
  file: string;
  line?: number;
  estimatedEffort: string;
  recommendation: string;
}

@Injectable()
export class TechnicalDebtScannerService {
  constructor(
    private filesService: FilesService,
    private aiProvidersService: AiProvidersService,
  ) {}

  async scanTechnicalDebt(
    projectId: string,
    userId: string,
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

    // Scan for technical debt
    return this.scanDebt(aiProvider, codeContext);
  }

  private async scanDebt(aiProvider: any, codeContext: any[]) {
    const openai = new OpenAI({
      apiKey: aiProvider.apiKey,
      baseURL: aiProvider.baseUrl,
    });

    const systemPrompt = `You are a technical debt analyzer. Analyze the provided codebase for technical debt issues including:
- Code duplication
- Dead or commented-out code
- Poor error handling
- Missing tests
- Outdated dependencies or patterns
- Performance bottlenecks
- Security vulnerabilities
- Poor naming conventions
- Complex functions that need refactoring
- Missing documentation

Categorize each issue by priority:
- HIGH: Critical issues that should be addressed immediately (security, major bugs, blocking issues)
- MEDIUM: Important issues that should be addressed soon (performance, maintainability)
- LOW: Nice-to-have improvements (clean-up, minor optimizations)

Return your analysis in the following JSON format:
{
  "summary": "Overall assessment of technical debt",
  "issues": [
    {
      "priority": "high|medium|low",
      "category": "category name (e.g., 'Security', 'Performance', 'Maintainability')",
      "description": "Detailed description of the issue",
      "file": "file path",
      "line": line_number,
      "estimatedEffort": "time estimate (e.g., '2 hours', '1 day')",
      "recommendation": "How to fix this issue"
    }
  ],
  "totalScore": {
    "high": number,
    "medium": number,
    "low": number
  }
}`;

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
      return this.parseDebtResponse(content);
    } catch (error) {
      console.error('Technical Debt Scan Error:', error);
      throw new Error('Failed to scan technical debt');
    }
  }

  private buildUserPrompt(codeContext: any[]): string {
    let prompt = 'Scan the following codebase for technical debt:\n\n';
    
    codeContext.forEach((file, index) => {
      prompt += `File ${index + 1}: ${file.path}\n`;
      prompt += '```\n';
      prompt += file.content;
      prompt += '\n```\n\n';
    });

    return prompt;
  }

  private parseDebtResponse(content: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback
      return {
        summary: content.substring(0, 500),
        issues: [],
        totalScore: { high: 0, medium: 0, low: 0 },
      };
    } catch (error) {
      console.error('Failed to parse debt scan response:', error);
      return {
        summary: content,
        issues: [],
        totalScore: { high: 0, medium: 0, low: 0 },
      };
    }
  }
}
