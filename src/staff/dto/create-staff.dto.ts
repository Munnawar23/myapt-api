import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StaffType } from 'src/database/entities/staff.entity';

export class CreateStaffDto {
  @ApiProperty({ example: 'Ram Kumar' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({ example: '5551112222' })
  @IsOptional()
  @IsString()
  contact_number?: string;

  @ApiProperty({ enum: StaffType, example: StaffType.COOK })
  @IsEnum(StaffType)
  @IsNotEmpty()
  staff_type: StaffType;
}
