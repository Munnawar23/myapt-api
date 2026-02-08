import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';


export class CreateServiceDto {
  @ApiProperty({ example: 'Gardener' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Provides lawn mowing and garden maintenance services.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 30.0,
    description: 'Base price for a visit or hourly rate.',
  })
  @IsNumber()
  @Min(0)
  base_price: number;
  @ApiPropertyOptional({
    description: 'The ID of the society this service belongs to (required for Super Admins).',
    example: '6cf32624-342b-4cbd-ba02-24e37e89829b',
  })
  @IsOptional()
  @IsUUID()
  society_id?: string;
}

