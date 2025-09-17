import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskResolver } from './task.resolver';

@Module({
  providers: [TaskService, TaskResolver],
  controllers: [TaskController],
})
export class TaskModule {}
