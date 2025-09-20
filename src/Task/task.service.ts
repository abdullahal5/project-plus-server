/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { AssignTaskDto, CreateTaskDto } from './dto/create-task.dto';
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

  // create intial task
  async create(createTaskDto: CreateTaskDto) {
    const { title, projectId, description, requiredSkills, autoAssign } =
      createTaskDto;

    const task = await this.prisma.task.create({
      data: {
        title,
        projectId,
        description: description || null,
        requiredSkills: requiredSkills || [],
      },
    });

    // Index the task in Elasticsearch
    await this.searchService.indexDocument(
      'tasks',
      {
        title: task.title,
        description: task.description || '',
      },
      task.id,
    );

    // Choose best user to assign the task
    if (autoAssign) {
      let user = await this.prisma.user.findFirst({
        where: {
          skills: { hasSome: requiredSkills || [] },
          role: 'MEMBER',
          isActive: true,
        },
        orderBy: { workload: 'asc' },
      });

      // Step 2: Fallback → last created MEMBER
      if (!user) {
        user = await this.prisma.user.findFirst({
          where: { role: 'MEMBER', isActive: true },
          orderBy: { createdAt: 'desc' },
        });
      }

      // Step 3: Assign if we found someone
      if (user) {
        await this.assignATask({
          taskId: task.id,
          assignedTo: [user.id],
          dependencies: [],
        });
      }
    }

    return task;
  }

  // assign a task to a user
  async assignATask(assignTaskDto: AssignTaskDto) {
    const { taskId, assignedTo, dependencies } = assignTaskDto;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        dependencies: {
          include: {
            assignedTo: true,
          },
        },
      },
    });

    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }

    // Check if dependencies are done for each user
    for (const userId of assignedTo) {
      for (const dep of task.dependencies) {
        const userAssignedToDep = dep.assignedTo.some((u) => u.id === userId);
        if (userAssignedToDep && dep.status !== 'DONE') {
          throw new HttpException(
            `User with id ${userId} cannot be assigned because dependency "${dep.title}" is not done`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedTo: {
          connect: assignedTo.map((id) => ({ id })),
        },
        dependencies: dependencies
          ? { connect: dependencies.map((depId) => ({ id: depId })) }
          : undefined,
      },
      include: {
        assignedTo: true,
        dependencies: true,
        project: true,
      },
    });

    // Send notifications to assigned users
    for (const user of updatedTask.assignedTo) {
      await this.notificationsService.createNotification(
        user.id,
        `You have been assigned a new task: ${updatedTask.title}`,
        'TASK_ASSIGNED',
      );
    }

    return updatedTask;
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
    const {
      title,
      description,
      projectId,
      requiredSkills,
      assignedTo,
      dependencies,
      autoAssign,
      status,
      priority,
    } = updateTaskDto;

    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        dependencies: { include: { assignedTo: true } },
        assignedTo: true,
      },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) throw new NotFoundException('Project not found');
    }

    // Check assigned users if provided
    let assigneeConnect;
    if (assignedTo?.length) {
      const users = await this.prisma.user.findMany({
        where: { id: { in: assignedTo } },
      });
      if (users.length !== assignedTo.length) {
        throw new BadRequestException('One or more assignees are invalid');
      }

      // Check dependency completion for each user
      for (const userId of assignedTo) {
        for (const dep of task.dependencies) {
          const userAssignedToDep = dep.assignedTo.some((u) => u.id === userId);
          if (userAssignedToDep && dep.status !== 'DONE') {
            throw new BadRequestException(
              `User with id ${userId} cannot be assigned because dependency "${dep.title}" is not done`,
            );
          }
        }
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

    // Update the task
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        projectId: projectId ?? undefined,
        priority: priority ?? undefined,
        status: status ?? undefined,
        requiredSkills: requiredSkills ?? undefined,
        assignedTo: assigneeConnect ? { set: assigneeConnect } : undefined,
        dependencies: dependencyConnect
          ? { set: dependencyConnect }
          : undefined,
      },
      include: {
        assignedTo: true,
        dependencies: true,
        project: true,
      },
    });

    for (const user of updatedTask.assignedTo) {
      await this.notificationsService.createNotification(
        user.id,
        `Task "${updatedTask.title}" has been updated.`,
        'TASK_UPDATED',
      );
    }

    if (status === 'DONE') {
      for (const user of updatedTask.assignedTo) {
        await this.notificationsService.createNotification(
          user.id,
          `Task "${updatedTask.title}" has been completed 🎉`,
          'TASK_COMPLETED',
        );
      }
    }

    if (autoAssign && requiredSkills?.length) {
      const users = await this.prisma.user.findMany({
        where: { skills: { hasSome: requiredSkills }, isActive: true },
        orderBy: { workload: 'asc' },
      });
      const assignedUserIds = users.map((u) => u.id).slice(0, 1);

      if (assignedUserIds.length > 0) {
        await this.assignATask({
          taskId: updatedTask.id,
          assignedTo: assignedUserIds,
          dependencies: dependencies ?? [],
        });
      }
    }

    // Update Elasticsearch index
    await this.searchService.indexDocument(
      'tasks',
      { title: updatedTask.title, description: updatedTask.description || '' },
      updatedTask.id,
    );

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
