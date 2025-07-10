import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateSlotDto {
  @ApiProperty({
    description: 'Set the slot to active (true) or inactive (false).',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
