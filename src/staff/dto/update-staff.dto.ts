import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StaffType } from 'src/database/entities/staff.entity';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'Ram Kumar Singh' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: '5551113333' })
  @IsOptional()
  @IsString()
  contact_number?: string;

  @ApiPropertyOptional({ enum: StaffType, example: StaffType.MAID })
  @IsOptional()
  @IsEnum(StaffType)
  staff_type?: StaffType;
}
