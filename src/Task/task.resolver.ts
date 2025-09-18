import { Query, Resolver, Args } from '@nestjs/graphql';
import { Task } from 'src/graphql/entities/models.entities';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/guards/gql-guard';
import { TaskService } from './task.service';
import { GetUser } from 'src/Auth/decorators/get-user.decorators';
import type { User } from '@prisma/client';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Query(() => [Task], { name: 'tasks' })
  @UseGuards(GqlAuthGuard)
  async tasks(@Args('q', { nullable: true }) query?: string): Promise<Task[]> {
    return await this.taskService.findAll(query);
  }

  @Query(() => [Task], { name: 'myAssignedTasks' })
  @UseGuards(GqlAuthGuard)
  async getMyAssignedTasks(
    @GetUser() user: User,
    @Args('q', { nullable: true }) query?: string,
  ): Promise<Task[]> {
    return await this.taskService.fetchMyAssignedTasks(user, query);
  }
}
