import { Controller, Get, Post, Put, Param, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { CreateAiProviderDto } from './dto/create-ai-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai-providers')
@Controller('ai-providers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiProvidersController {
  constructor(private aiProvidersService: AiProvidersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new AI provider' })
  @ApiResponse({ status: 201, description: 'AI provider successfully created' })
  async create(@Body() createAiProviderDto: CreateAiProviderDto, @Request() req) {
    return this.aiProvidersService.create(createAiProviderDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all AI providers for current user' })
  @ApiResponse({ status: 200, description: 'AI providers retrieved successfully' })
  async findAll(@Request() req) {
    return this.aiProvidersService.findAll(req.user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default AI provider' })
  @ApiResponse({ status: 200, description: 'Default AI provider retrieved successfully' })
  async getDefault(@Request() req) {
    return this.aiProvidersService.getDefault(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific AI provider' })
  @ApiResponse({ status: 200, description: 'AI provider retrieved successfully' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.aiProvidersService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an AI provider' })
  @ApiResponse({ status: 200, description: 'AI provider successfully updated' })
  async update(
    @Param('id') id: string,
    @Body() updateAiProviderDto: Partial<CreateAiProviderDto>,
    @Request() req,
  ) {
    return this.aiProvidersService.update(id, updateAiProviderDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an AI provider' })
  @ApiResponse({ status: 200, description: 'AI provider successfully deleted' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.aiProvidersService.remove(id, req.user.id);
  }
}
