import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class ReportServices {
  constructor(private readonly prisma: PrismaService) {}

  async getReport() {
    // users
    const activeUsers = await this.prisma.user.count({
      where: { isActive: true },
    });

    // Tasks
    const tasks = await this.prisma.task.findMany();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length;
    const avgTaskCompletionRate = totalTasks
      ? (completedTasks / totalTasks) * 100
      : 0;

    // Average time spent on tasks
    const totalTimeSpent = tasks.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (acc, t) => acc + (t.timeSpentHours || 0),
      0,
    );
    const avgTimeSpentHours = totalTasks ? totalTimeSpent / totalTasks : 0;

    // Projects and task counts
    const projects = await this.prisma.project.findMany({
      include: { tasks: true },
    });
    const totalProjects = projects.length;
    const projectTaskCounts = projects.map((p) => ({
      projectId: p.id,
      projectName: p.name,
      taskCount: p.tasks.length,
    }));

    return {
      activeUsers,
      avgTaskCompletionRate: parseFloat(avgTaskCompletionRate.toFixed(2)),
      avgTimeSpentHours: parseFloat(avgTimeSpentHours.toFixed(2)),
      totalProjects,
      projectTaskCounts,
      totalTasks,
      completedTasks,
    };
  }
}
