import { Module } from '@nestjs/common';
import { ReportServices } from './reports.service';
import { ReportResolvers } from './reports.resolver';

@Module({
  providers: [ReportServices, ReportResolvers],
})
export class ReportsModule {}
