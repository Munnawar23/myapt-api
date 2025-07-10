import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGatePassDto {
  @ApiProperty({
    description: "The guest's full name.",
    example: 'Jane Smith',
  })
  @IsString()
  @IsNotEmpty()
  guest_name: string;

  @ApiPropertyOptional({
    description: "The guest's contact number.",
    example: '555-123-4567',
  })
  @IsOptional()
  @IsString()
  guest_contact_number?: string;

  @ApiProperty({
    description: 'The date and time of the planned visit (ISO 8601 format).',
    example: '2025-12-31T19:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  visit_date: string;
}
