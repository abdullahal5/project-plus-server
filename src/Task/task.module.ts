import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskResolver } from './task.resolver';
import { NotificationsModule } from 'src/Notifications/notifications.module';
import { SearchModule } from 'src/Search/search.module';

@Module({
  imports: [NotificationsModule, SearchModule],
  providers: [TaskService, TaskResolver],
  controllers: [TaskController],
})
export class TaskModule {}
