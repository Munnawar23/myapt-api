import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSlotDto {
  @ApiProperty({ example: 'C-101' })
  @IsString()
  @IsNotEmpty()
  slot_number: string;

  @ApiPropertyOptional({ example: 'Basement Level 1, near elevator' })
  @IsOptional()
  @IsString()
  level_description?: string;

  @ApiProperty({ description: 'The ID of the zone this slot belongs to.' })
  @IsUUID()
  @IsNotEmpty()
  zone_id: string;
}
