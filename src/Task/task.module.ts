import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskResolver } from './task.resolver';
import { NotificationsModule } from 'src/Notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [TaskService, TaskResolver],
  controllers: [TaskController],
})
export class TaskModule {}
