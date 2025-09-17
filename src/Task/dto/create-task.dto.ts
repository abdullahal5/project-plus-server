import { TaskPriority, TaskStatus } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsOptional()
  @IsUUID('4', { each: true })
  assignedTo?: string[];

  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  dependencies?: string[];
}
