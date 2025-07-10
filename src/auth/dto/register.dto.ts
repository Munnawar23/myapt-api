import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user.',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: "The user's email address.",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'User password (at least 8 characters).',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '9876543210',
    description: "The user's phone number.",
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    description: 'The ID of the society the user wants to join.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  societyId: string;

  @ApiProperty({
    example: '404',
    description: "The user's flat number.",
  })
  @IsString()
  @IsNotEmpty()
  flat_number: string;

  @ApiProperty({
    example: 'Tower A',
    description: 'The block or tower name where the flat is located.',
  })
  @IsString()
  @IsNotEmpty()
  block: string;
}
