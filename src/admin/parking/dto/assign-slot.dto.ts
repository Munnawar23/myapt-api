import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignSlotDto {
  @ApiProperty({ description: 'The ID of the user to assign the slot to.' })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}
