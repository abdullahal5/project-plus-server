import { Query, Resolver, Info } from '@nestjs/graphql';
import { Project } from 'src/graphql/entities/models.entities';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { PrismaSelect } from '@paljs/plugins';
import type { GraphQLResolveInfo } from 'graphql';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  //   @UseGuards(JwtAuthGuard)
  async projects(): Promise<Project[]> {
    return this.projectService.getAllProjects();
  }
}
