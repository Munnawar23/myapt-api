import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAmenityDto {
  @ApiProperty({ example: 'Rooftop Tennis Court' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Regulation size tennis court available from 6 AM to 10 PM.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 15.0, description: 'Price per hour.' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 5, description: 'Tax percent for this amenity' })
  @IsNumber()
  @Min(0)
  tax_percent: number;

  // --- CORRECTED PROPERTY NAME ---
  @ApiProperty({ example: 5, description: 'Service fee for this amenity' })
  @IsNumber()
  @Min(0)
  service_fee_amount: number;

  @ApiProperty({
    example: 'Additional notes for this amenity',
    required: false,
  })
  @IsString()
  @IsOptional()
  additional_notes?: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  @IsNotEmpty()
  opening_time: string;

  @ApiProperty({ example: '21:00:00' })
  @IsString()
  @IsNotEmpty()
  closing_time: string;

  // --- CORRECTED PROPERTY NAME ---
  @ApiProperty({ example: 60, description: 'Duration of each slot in minutes' })
  @IsInt()
  @Min(1)
  slot_duration: number;

  // --- CORRECTED PROPERTY NAME ---
  @ApiProperty({
    example: 10,
    description: 'Maximum number of bookings per slot',
  })
  @IsInt()
  @Min(1)
  slot_capacity: number;
}
