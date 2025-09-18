import {
  ObjectType,
  Field,
  ID,
  registerEnumType,
  Int,
  Float,
} from '@nestjs/graphql';
import {
  NotificationType as PrismaNotificationType,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
  UserRole as PrismaUserRole,
} from '@prisma/client';

registerEnumType(PrismaUserRole, {
  name: 'UserRole',
  description: 'User roles from Prisma',
});

registerEnumType(PrismaTaskStatus, {
  name: 'TaskStatus',
  description: 'Task status from Prisma',
});

registerEnumType(PrismaTaskPriority, {
  name: 'TaskPriority',
  description: 'Task priority from Prisma',
});

registerEnumType(PrismaNotificationType, {
  name: 'NotificationType',
  description: 'Notification type from Prisma',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => PrismaUserRole)
  role: PrismaUserRole;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field()
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => User, { nullable: true })
  createdBy?: User | null;

  @Field(() => [User], { nullable: 'itemsAndList' })
  members?: User[] | null;

  @Field(() => [Task], { nullable: 'itemsAndList' })
  tasks?: Task[] | null;
}

@ObjectType()
export class Task {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => PrismaTaskStatus)
  status: PrismaTaskStatus;

  @Field(() => PrismaTaskPriority)
  priority: PrismaTaskPriority;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Project, { nullable: true })
  project?: Project | null;

  @Field(() => [User], { nullable: 'itemsAndList' })
  assignedTo?: User[] | null;

  @Field(() => [Task], { nullable: 'itemsAndList' })
  dependencies?: Task[] | null;

  @Field(() => [Task], { nullable: 'itemsAndList' })
  dependentOn?: Task[] | null;
}

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field()
  message: string;

  @Field(() => PrismaNotificationType)
  type: PrismaNotificationType;

  @Field()
  isRead: boolean;

  @Field()
  createdAt: Date;

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@ObjectType()
export class ProjectAnalytics {
  @Field()
  name: string;

  @Field(() => Int)
  taskCount: number;
}

@ObjectType()
export class AnalyticsReport {
  @Field(() => Int)
  activeUsers: number;

  @Field(() => Float)
  avgTaskCompletionRate: number;

  @Field(() => Float)
  avgTimeSpentHours: number;

  @Field(() => Int)
  totalProjects: number;

  @Field(() => [ProjectAnalytics], { nullable: 'itemsAndList' })
  projects?: ProjectAnalytics[];
}
