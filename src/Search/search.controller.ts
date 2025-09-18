import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('ping')
  async pingElasticsearch() {
    const isAlive = await this.searchService.ping();
    return {
      status: isAlive ? 'Elasticsearch is up!' : 'Elasticsearch is down!',
    };
  }

  @Post('create/:index')
  async createIndex(@Param('index') index: string) {
    return this.searchService.createIndex(index);
  }

  @Get()
  async search(@Query('index') index: string, @Query('q') q: string) {
    return this.searchService.search(index, q);
  }
}
