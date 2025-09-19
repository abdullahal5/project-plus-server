import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsUUID('4')
  projectId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsBoolean()
  autoAssign?: boolean;
}

export class AssignTaskDto {
  @IsUUID('4', { message: 'Task ID must be a valid UUID' })
  taskId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one user must be assigned' })
  @IsUUID('4', { each: true, message: 'Each userId must be a valid UUID' })
  assignedTo: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Each dependencyId must be a valid UUID',
  })
  dependencies?: string[];
}
