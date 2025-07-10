import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class SlotQueryDto {
  @ApiProperty({
    description:
      'The date for which to retrieve available slots (YYYY-MM-DD format).',
    example: '2025-08-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
