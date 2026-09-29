import { Controller, Get, Post, Param, Delete, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new code review' })
  @ApiResponse({ status: 201, description: 'Review successfully created' })
  async create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all reviews for a project' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async findAll(@Param('projectId') projectId: string, @Request() req) {
    return this.reviewsService.findAll(projectId, req.user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search reviews' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query('projectId') projectId: string, @Query('q') query: string) {
    return this.reviewsService.search(projectId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review' })
  @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
  async findOne(@Param('id') id: string, @Query('projectId') projectId: string) {
    return this.reviewsService.findOne(id, projectId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review successfully deleted' })
  async remove(@Param('id') id: string, @Query('projectId') projectId: string) {
    return this.reviewsService.remove(id, projectId);
  }
}
