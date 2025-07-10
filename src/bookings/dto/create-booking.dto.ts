import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'The ID of the specific amenity slot to book.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  slot_id: string; // Changed from amenity_id and booking_date
}
