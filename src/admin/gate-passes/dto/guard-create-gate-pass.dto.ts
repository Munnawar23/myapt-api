import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { VisitorType } from 'src/database/entities/gate-pass.entity';

export class GuardCreateGatePassDto {
  @ApiProperty({
    description: "The visitor's full name.",
    example: 'Mike the Plumber',
  })
  @IsString()
  @IsNotEmpty()
  visitor_name: string;

  @ApiProperty({
    description:
      "The visitor's contact number. This will be used to identify the visitor.",
    example: '5559876543',
  })
  @IsString()
  @IsNotEmpty()
  visitor_contact_number: string;

  @ApiProperty({
    description: 'The type of visitor.',
    enum: VisitorType,
    example: VisitorType.WORKER,
  })
  @IsEnum(VisitorType)
  @IsNotEmpty()
  visitor_type: VisitorType;

  @ApiProperty({
    description: 'A brief purpose for the visit.',
    example: 'Fixing a leak',
  })
  @IsString()
  @IsNotEmpty()
  visit_purpose: string;

  @ApiProperty({
    description: 'The start of the validity period for the pass (usually now).',
    example: '2025-12-31T19:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  valid_from: string;

  @ApiProperty({
    description: 'The end of the validity period for the pass.',
    example: '2025-12-31T23:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  valid_until: string;

  @ApiProperty({
    description: 'An array of Flat IDs the visitor intends to visit.',
    type: [String],
    example: ['flat-uuid-1', 'flat-uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  destination_flat_ids: string[];
}
