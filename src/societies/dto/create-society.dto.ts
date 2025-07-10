import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocietyDto {
  @ApiProperty({
    description: 'The name of the society',
    example: 'Sunrise Apartments',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The full address of the society',
    example: '123 Tech Park, Innovation Drive, Smart City',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
