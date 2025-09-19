import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { ProjectResolver } from './project.resolver';
import { SearchModule } from 'src/Search/search.module';

@Module({
  imports: [SearchModule],
  providers: [ProjectService, ProjectResolver],
  controllers: [ProjectController],
})
export class ProjectModule {}
