import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.task.create({
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
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({
      include: {
        project: true,
        assignedTo: true,
        dependencies: true,
        dependentOn: true,
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

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

    return this.prisma.task.update({
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
  }

  async delete(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    return this.prisma.task.delete({ where: { id } });
  }
}
