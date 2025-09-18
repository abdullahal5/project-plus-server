import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/guards/gql-guard';
import { AnalyticsReport } from 'src/graphql/entities/models.entities';
import { ReportServices } from './reports.service';

@Resolver(() => AnalyticsReport)
export class ReportResolvers {
  constructor(private readonly reportService: ReportServices) {}

  @Query(() => AnalyticsReport, { name: 'analyticsReport' })
  @UseGuards(GqlAuthGuard)
  async analyticsReport(): Promise<AnalyticsReport> {
    return this.reportService.getReport();
  }
}
