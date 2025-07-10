import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GenerateSlotsDto {
  @ApiProperty({
    description: 'The start date for slot generation (YYYY-MM-DD format).',
    example: '2025-08-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'The end date for slot generation (YYYY-MM-DD format).',
    example: '2025-08-31',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}
