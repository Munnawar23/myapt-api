import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponse<T> {
  @ApiProperty({
    isArray: true,
    description: 'The array of data for the current page.',
  })
  data: T[];

  @ApiProperty({
    example: 100,
    description: 'Total number of items available.',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items requested per page.',
  })
  limit: number;

  @ApiProperty({ example: 1, description: 'The current page number.' })
  currentPage: number;

  @ApiProperty({
    example: 10,
    description: 'The total number of pages available.',
  })
  totalPages: number;

  constructor(data: T[], total: number, limit: number, page: number) {
    this.data = data;
    this.total = total;
    this.limit = limit;
    this.currentPage = page;
    this.totalPages = Math.ceil(total / limit);
  }
}
