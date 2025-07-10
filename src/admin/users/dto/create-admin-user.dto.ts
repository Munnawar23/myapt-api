import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsArray,
  IsInt,
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
}
