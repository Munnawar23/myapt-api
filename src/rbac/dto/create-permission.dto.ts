import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'create_post',
    description:
      'The programmatic name of the permission (e.g., resource:action)',
  })
  @IsString()
  @IsNotEmpty()
  permission_name: string;

  @ApiProperty({
    example: 'Allows a user to create a new blog post.',
    description: 'A friendly description of what the permission does.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
