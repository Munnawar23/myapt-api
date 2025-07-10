import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

// This is similar to UpdateProfileDto but is for admin use.
// In a real-world scenario, it might contain more fields an admin can change.
export class AdminUpdateUserDto {
  @ApiPropertyOptional({ example: 'Johnathan Doe' })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ example: 'john.doe.new@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '9876543211' })
  @IsOptional()
  @IsString()
  phone_number?: string;
}
