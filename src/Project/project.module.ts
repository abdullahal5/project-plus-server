import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectResolver } from './project.resolver';

@Module({
  providers: [ProjectService, ProjectResolver],
  controllers: [ProjectController],
})
export class ProjectModule {}
