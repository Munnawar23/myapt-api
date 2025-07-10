import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({ example: 'Tower C - Basement' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  total_capacity: number;
}
