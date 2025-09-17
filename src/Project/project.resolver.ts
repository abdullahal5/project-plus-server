import { Query, Resolver } from '@nestjs/graphql';
import { Project } from 'src/graphql/entities/models.entities';
import { ProjectService } from './project.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/guards/gql-guard';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => [Project])
  @UseGuards(GqlAuthGuard)
  async projects(): Promise<Project[]> {
    return this.projectService.getAllProjects();
  }
}
