import { Query, Resolver } from '@nestjs/graphql';
import { Project, Task } from 'src/graphql/entities/models.entities';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/guards/gql-guard';
import { TaskService } from './task.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task], { name: 'tasks' })
  @UseGuards(GqlAuthGuard)
  async tasks(): Promise<Task[]> {
    return await this.taskService.findAll();
  }
}
