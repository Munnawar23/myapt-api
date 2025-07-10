import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: "The user's full name.",
    example: 'Johnathan Doe',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({
    description: "The user's email address.",
    example: 'john.doe.new@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: "The user's phone number.",
    example: '9876543211',
  })
  @IsOptional()
  @IsString()
  phone_number?: string;
}
