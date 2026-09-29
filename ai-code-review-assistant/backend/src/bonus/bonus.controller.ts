import { Controller, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { DocumentationGeneratorService, DocumentationType } from './documentation-generator.service';
import { TechnicalDebtScannerService } from './technical-debt-scanner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('bonus')
@Controller('bonus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BonusController {
  constructor(
    private documentationGeneratorService: DocumentationGeneratorService,
    private technicalDebtScannerService: TechnicalDebtScannerService,
  ) {}

  @Post('documentation')
  @ApiOperation({ summary: 'Generate documentation (README, Setup Guide, API Docs)' })
  @ApiResponse({ status: 200, description: 'Documentation generated successfully' })
  async generateDocumentation(
    @Body() body: { projectId: string; type: DocumentationType; fileIds?: string[] },
    @Request() req,
  ) {
    return this.documentationGeneratorService.generateDocumentation(
      body.projectId,
      req.user.id,
      body.type,
      body.fileIds,
    );
  }

  @Post('technical-debt')
  @ApiOperation({ summary: 'Scan codebase for technical debt' })
  @ApiResponse({ status: 200, description: 'Technical debt scan completed' })
  async scanTechnicalDebt(
    @Body() body: { projectId: string; fileIds?: string[] },
    @Request() req,
  ) {
    return this.technicalDebtScannerService.scanTechnicalDebt(
      body.projectId,
      req.user.id,
      body.fileIds,
    );
  }
}
