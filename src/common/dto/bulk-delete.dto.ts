import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

// A generic DTO for any type of ID (number or string/uuid)
export class BulkDeleteDto<T> {
  @ApiProperty({
    description: 'An array of IDs to delete.',
    type: 'array',
    items: {
      oneOf: [{ type: 'string', format: 'uuid' }, { type: 'number' }],
    },
    example: ['uuid1', 'uuid2'],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  ids: T[];
}
