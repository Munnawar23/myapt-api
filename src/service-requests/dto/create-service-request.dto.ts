import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({
    description: 'The ID of the service being requested.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  service_id: string;

  @ApiProperty({
    description:
      'The requested start time for the service window (ISO 8601 format).',
    example: '2025-08-20T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description:
      'The requested end time for the service window (ISO 8601 format).',
    example: '2025-08-20T12:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({
    description: 'Additional notes for booking',
    example: 'I need this service for my birthday party',
  })
  @IsOptional()
  additional_notes: string;
}
