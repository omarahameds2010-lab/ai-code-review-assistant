import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { UploadFileDto, UploadType } from './dto/upload-file.dto';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import { Octokit } from 'octokit';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async uploadFiles(uploadFileDto: UploadFileDto, userId: string) {
    const { type, projectId, githubUrl, files } = uploadFileDto;

    if (type === UploadType.GITHUB && githubUrl) {
      return this.uploadFromGitHub(githubUrl, projectId, userId);
    }

    if (type === UploadType.ZIP && files && files.length > 0) {
      return this.uploadFromZip(files[0], projectId, userId);
    }

    if (type === UploadType.FILES && files) {
      return this.uploadIndividualFiles(files, projectId, userId);
    }

    throw new NotFoundException('Invalid upload type');
  }

  private async uploadFromGitHub(githubUrl: string, projectId: string, userId: string) {
    // Extract owner and repo from URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new NotFoundException('Invalid GitHub URL');
    }

    const [, owner, repo] = match;
    const octokit = new Octokit();

    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: '',
      });

      const files: File[] = [];
      await this.processGitHubContents(response.data, projectId, '', files);

      return this.filesRepository.save(files);
    } catch (error) {
      throw new NotFoundException('Failed to fetch repository');
    }
  }

  private async processGitHubContents(contents: any, projectId: string, currentPath: string, files: File[]) {
    const octokit = new Octokit();
    
    for (const item of Array.isArray(contents) ? contents : [contents]) {
      const itemPath = path.join(currentPath, item.name);
      
      if (item.type === 'dir') {
        const owner = item.git_url?.split('/')[4];
        const repo = item.git_url?.split('/')[5];
        const dirPath = item.path;
        
        const dirResponse = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
          owner,
          repo,
          path: dirPath,
        });
        
        await this.processGitHubContents(dirResponse.data, projectId, itemPath, files);
      } else if (item.type === 'file') {
        const file = this.filesRepository.create({
          name: item.name,
          path: itemPath,
          content: Buffer.from(item.content, 'base64').toString('utf8'),
          size: item.size,
          language: this.detectLanguage(item.name),
          isDirectory: false,
          projectId,
        });
        files.push(file);
      }
    }
  }

  private async uploadFromZip(zipFile: any, projectId: string, userId: string) {
    const zip = new AdmZip(zipFile.buffer);
    const entries = zip.getEntries();
    const files: File[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory) {
        const file = this.filesRepository.create({
          name: entry.entryName.split('/').pop() || entry.entryName,
          path: entry.entryName,
          content: entry.getData().toString('utf8'),
          size: entry.header.size,
          language: this.detectLanguage(entry.entryName),
          isDirectory: false,
          projectId,
        });
        files.push(file);
      }
    }

    return this.filesRepository.save(files);
  }

  private async uploadIndividualFiles(files: any[], projectId: string, userId: string) {
    const fileEntities: File[] = [];

    for (const file of files) {
      const fileEntity = this.filesRepository.create({
        name: file.originalname,
        path: file.originalname,
        content: file.buffer.toString('utf8'),
        size: file.size,
        language: this.detectLanguage(file.originalname),
        isDirectory: false,
        projectId,
      });
      fileEntities.push(fileEntity);
    }

    return this.filesRepository.save(fileEntities);
  }

  private detectLanguage(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.sql': 'sql',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.txt': 'text',
    };
    return languageMap[ext] || 'text';
  }

  async findByProject(projectId: string) {
    return this.filesRepository.find({
      where: { projectId },
      order: { path: 'ASC' },
    });
  }

  async findOne(id: string, projectId: string) {
    const file = await this.filesRepository.findOne({
      where: { id, projectId },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async getTreeStructure(projectId: string) {
    const files = await this.findByProject(projectId);
    const tree: any = {};

    for (const file of files) {
      const parts = file.path.split('/');
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = {
            id: file.id,
            name: file.name,
            path: file.path,
            language: file.language,
            size: file.size,
          };
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }

    return tree;
  }

  async remove(id: string, projectId: string) {
    const file = await this.findOne(id, projectId);
    return this.filesRepository.remove(file);
  }
}
