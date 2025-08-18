import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'The name of the delivery company.',
    example: 'Amazon',
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiPropertyOptional({
    description: 'The order or tracking ID for the delivery.',
    example: 'AMZN123456789',
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiPropertyOptional({
    description: 'An optional One-Time Password (OTP) for verification.',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  otp?: string;
}
