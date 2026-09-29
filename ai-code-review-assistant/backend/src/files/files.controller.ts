import { Controller, Get, Post, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, UploadedFiles, Body } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto, UploadType } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Upload files to a project' })
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Request() req,
  ) {
    const uploadFileDto: UploadFileDto = {
      type: body.type,
      projectId: body.projectId,
      githubUrl: body.githubUrl,
      files,
    };
    return this.filesService.uploadFiles(uploadFileDto, req.user.id);
  }

  @Post('upload-zip')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload ZIP file to a project' })
  @ApiResponse({ status: 201, description: 'ZIP uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  async uploadZip(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Request() req,
  ) {
    const uploadFileDto: UploadFileDto = {
      type: UploadType.ZIP,
      projectId: body.projectId,
      files: [file],
    };
    return this.filesService.uploadFiles(uploadFileDto, req.user.id);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all files for a project' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.filesService.findByProject(projectId);
  }

  @Get('tree/:projectId')
  @ApiOperation({ summary: 'Get file tree structure for a project' })
  @ApiResponse({ status: 200, description: 'Tree structure retrieved successfully' })
  async getTreeStructure(@Param('projectId') projectId: string) {
    return this.filesService.getTreeStructure(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific file' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.filesService.findOne(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File successfully deleted' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.filesService.remove(id, req.user.id);
  }
}
