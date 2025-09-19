/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto, UpdateTaskStatusDto } from './dto/update-task.dto';
import { Task, User } from '@prisma/client';
import { NotificationsService } from 'src/Notifications/notifications.service';
import { SearchService } from 'src/Search/search.service';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly searchService: SearchService,
  ) {
    this.initIndex();
  }

  private async initIndex() {
    try {
      await this.searchService.createIndex('tasks');
      console.log('Elasticsearch tasks index ready');
    } catch (error) {
      console.error('Error creating Elasticsearch index:', error);
    }
  }

  // create
  async create(createTaskDto: CreateTaskDto) {
    const {
      assignedTo,
      dependencies,
      projectId,
      title,
      description,
      priority,
      status,
    } = createTaskDto;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    // Check dependencies first
    let dependencyConnect;
    if (dependencies?.length) {
      const tasks = await this.prisma.task.findMany({
        where: { id: { in: dependencies } },
      });

      if (tasks.length !== dependencies.length) {
        throw new BadRequestException('One or more dependencies are invalid');
      }

      // Check if any dependency is not DONE
      const incompleteDeps = tasks.filter((t) => t.status !== 'DONE');
      if (incompleteDeps.length > 0 && assignedTo?.length) {
        throw new BadRequestException(
          'Cannot assign task because one or more dependencies are not completed',
        );
      }

      dependencyConnect = dependencies.map((id) => ({ id }));
    }

    // Check assigned users
    let assigneeConnect;
    if (assignedTo?.length) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: assignedTo } },
      });

      if (users.length !== assignedTo.length) {
        throw new NotFoundException('One or more assignees not found');
      }

      assigneeConnect = assignedTo.map((id) => ({ id }));
    }

    // Create task
    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        projectId,
        assignedTo: assigneeConnect ? { connect: assigneeConnect } : undefined,
        dependencies: dependencyConnect
          ? { connect: dependencyConnect }
          : undefined,
      },
      include: {
        assignedTo: true,
        dependencies: true,
      },
    });

    if (assignedTo?.length) {
      for (const userId of assignedTo) {
        await this.notificationsService.createNotification(
          userId,
          `You have been assigned a new task: ${title}`,
          'TASK_ASSIGNED',
        );
      }
    }

    await this.searchService.indexDocument(
      'tasks',
      { title: task.title, description: task.description || '' },
      task.id,
    );

    return task;
  }

  async findAll(query?: string): Promise<Task[]> {
    if (query) {
      const results = await this.searchService.search('tasks', query);
      const taskIds = results
        .map((r) => r.id)
        .filter((id): id is string => !!id);

      return this.prisma.task.findMany({
        where: { id: { in: taskIds } },
        include: {
          project: true,
          assignedTo: true,
          dependencies: true,
          dependentOn: true,
        },
        orderBy: { priority: 'desc' },
      });
    }

    return this.prisma.task.findMany({
      include: {
        project: true,
        assignedTo: true,
        dependencies: true,
        dependentOn: true,
      },
      orderBy: { priority: 'desc' },
    });
  }

  async fetchMyAssignedTasks(user: User, query?: string): Promise<Task[]> {
    if (query) {
      const results = await this.searchService.search('tasks', query);
      const taskIds = results
        .map((r) => r.id)
        .filter((id): id is string => !!id);

      return this.prisma.task.findMany({
        where: {
          id: { in: taskIds },
          assignedTo: {
            some: { id: user.id },
          },
        },
        include: {
          project: true,
          assignedTo: true,
          dependencies: true,
          dependentOn: true,
        },
        orderBy: { priority: 'desc' },
      });
    }

    return this.prisma.task.findMany({
      where: {
        assignedTo: {
          some: { id: user.id },
        },
      },
      include: {
        project: true,
        assignedTo: true,
        dependencies: true,
        dependentOn: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  // update status
  async updateStatus(taskId: string, dto: UpdateTaskStatusDto, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    const isAssigned = task.assignedTo.some((u) => u.id === user?.id);
    const isAdmin = user.role === 'ADMIN';

    if (!isAssigned && !isAdmin) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    const data: any = { status: dto.status };
    if (dto.status === 'DONE') {
      const diffMs = new Date().getTime() - task.createdAt.getTime();
      data.timeSpentHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data,
      include: { assignedTo: true },
    });

    if (updatedTask.assignedTo?.length) {
      for (const assignedUser of updatedTask.assignedTo) {
        let message = `Task "${updatedTask.title}" status updated to ${dto.status}`;
        let type: 'TASK_UPDATED' | 'TASK_COMPLETED' = 'TASK_UPDATED';

        if (dto.status === 'DONE') {
          message = `Task "${updatedTask.title}" has been completed 🎉`;
          type = 'TASK_COMPLETED';
        }

        await this.notificationsService.createNotification(
          assignedUser.id,
          message,
          type,
        );
      }
    }

    await this.searchService.indexDocument(
      'tasks',
      { title: updatedTask.title, description: updatedTask.description || '' },
      updatedTask.id,
    );

    return updatedTask;
  }

  // update task
  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const { assignedTo, dependencies, projectId, ...rest } = updateTaskDto;

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) throw new NotFoundException('Project not found');
    }

    let assigneeConnect;
    if (assignedTo?.length) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: assignedTo } },
      });
      if (users.length !== assignedTo.length) {
        throw new BadRequestException('One or more assignees are invalid');
      }
      assigneeConnect = assignedTo.map((id) => ({ id }));
    }

    let dependencyConnect;
    if (dependencies?.length) {
      const tasks = await this.prisma.task.findMany({
        where: { id: { in: dependencies } },
      });
      if (tasks.length !== dependencies.length) {
        throw new BadRequestException('One or more dependencies are invalid');
      }
      dependencyConnect = dependencies.map((id) => ({ id }));
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        projectId: projectId ?? undefined,
        assignedTo: assigneeConnect ? { set: assigneeConnect } : undefined,
        dependencies: dependencyConnect
          ? { set: dependencyConnect }
          : undefined,
      },
      include: {
        assignedTo: true,
        dependencies: true,
      },
    });

    if (updatedTask.assignedTo?.length) {
      for (const user of updatedTask.assignedTo) {
        await this.notificationsService.createNotification(
          user.id,
          `Task "${updatedTask.title}" has been updated.`,
          'TASK_UPDATED',
        );
      }
    }

    if (rest.status && rest.status === 'DONE') {
      if (updatedTask.assignedTo?.length) {
        for (const user of updatedTask.assignedTo) {
          await this.notificationsService.createNotification(
            user.id,
            `Task "${updatedTask.title}" has been marked as completed.`,
            'TASK_COMPLETED',
          );
        }
      }
    }

    return updatedTask;
  }

  // delete task
  async delete(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignedTo: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (task.assignedTo?.length) {
      for (const user of task.assignedTo) {
        await this.notificationsService.createNotification(
          user.id,
          `Task "${task.title}" has been deleted.`,
          'TASK_UPDATED',
        );
      }
    }

    await this.searchService.deleteDocument('tasks', id);

    return this.prisma.task.delete({ where: { id } });
  }
}
