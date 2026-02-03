import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsArray,
  IsInt,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'technician.one@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Tech One' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'P@ssw0rdTech' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '5551112222' })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'Array of role IDs to assign to the new user.',
    example: [3], // e.g., ID for the 'TECHNICIAN' role
  })
  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];

  @ApiProperty({
    description: 'The UUID of the society to assign this user to (Super Admin only).',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  society_id?: string;
}
