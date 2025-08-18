import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchDeliveryDto {
  @ApiProperty({
    description: 'The Order ID or Tracking ID to search for.',
    example: 'AMZN123456789',
  })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
