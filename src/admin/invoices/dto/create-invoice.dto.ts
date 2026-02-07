import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'The ID of the user to be invoiced.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'A description for the invoice line item.',
    example: 'Monthly Maintenance Fee - August 2025',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The amount to be invoiced.',
    example: 50.0,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'The date the invoice is due (ISO 8601 format).',
    example: '2025-08-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  due_date: string;
}
