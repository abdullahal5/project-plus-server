import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(index: string) {
    const exists = await this.elasticsearchService.indices.exists({ index });
    if (!exists) {
      return this.elasticsearchService.indices.create({
        index,
        mappings: {
          properties: {
            title: { type: 'text' },
            description: { type: 'text' },
          },
        },
      });
    }
    return { message: 'Index already exists' };
  }

  async indexDocument(index: string, doc: any, id: string) {
    await this.elasticsearchService.index({
      index,
      id,
      document: doc,
    });
  }

  async deleteDocument(index: string, id: string) {
    await this.elasticsearchService.delete({ index, id });
  }

  async search(index: string, query: string) {
    const result = await this.elasticsearchService.search({
      index,
      query: {
        multi_match: {
          query,
          fields: ['title', 'description'],
        },
      },
    });

    return result.hits.hits.map((hit) => ({
      ...(hit._source as Record<string, any>),
      id: hit._id,
    }));
  }

  async ping() {
    return await this.elasticsearchService.ping();
  }
}
