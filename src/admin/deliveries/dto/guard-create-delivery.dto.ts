import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class GuardCreateDeliveryDto {
  @ApiProperty({
    description: 'The ID of the Flat the delivery is for.',
    example: 'flat-uuid-goes-here',
  })
  @IsUUID()
  @IsNotEmpty()
  flat_id: string;

  @ApiProperty({
    description: 'The name of the delivery company.',
    example: 'Blue Dart',
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiPropertyOptional({
    description: 'The order or tracking ID for the delivery, if available.',
    example: 'BD123456789',
  })
  @IsOptional()
  @IsString()
  order_id?: string;
}
