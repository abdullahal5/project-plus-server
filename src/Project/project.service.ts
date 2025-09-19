/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from '@prisma/client';
import { SearchService } from 'src/Search/search.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {
    this.initIndex();
  }

  private async initIndex() {
    try {
      await this.searchService.createIndex('projects');
      console.log('Elasticsearch projects index ready');
    } catch (error) {
      console.error('Error creating Elasticsearch project index:', error);
    }
  }

  async createProject(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        createdById: userId,
      },
    });

    // index in Elasticsearch
    await this.searchService.indexDocument(
      'projects',
      {
        name: project.name,
        description: project.description || '',
      },
      project.id,
    );

    return project;
  }

  async getAllProjects(query?: string): Promise<Project[]> {
    if (query) {
      const results = await this.searchService.search('projects', query);
      const projectIds = results
        .map((r) => r.id)
        .filter((id): id is string => !!id);

      if (projectIds.length === 0) return [];

      return await this.prisma.project.findMany({
        where: { id: { in: projectIds } },
        include: {
          createdBy: true,
          members: true,
          tasks: { include: { assignedTo: true } },
        },
      });
    }

    return await this.prisma.project.findMany({
      include: {
        createdBy: true,
        members: true,
        tasks: { include: { assignedTo: true } },
      },
    });
  }

  async getProjectById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: true,
        members: true,
        tasks: { include: { assignedTo: true } },
      },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }
    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.update({
      where: { id },
      data: { ...dto },
    });

    // re-index in Elasticsearch
    await this.searchService.indexDocument(
      'projects',
      {
        name: project.name,
        description: project.description || '',
      },
      project.id,
    );

    return project;
  }

  async deleteProject(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    await this.searchService.deleteDocument('projects', id);
    await this.prisma.project.delete({ where: { id } });

    return project;
  }
}
