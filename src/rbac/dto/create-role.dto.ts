import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// Add IsArray, IsInt, IsOptional
import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Support Agent',
    description: 'The name of the new role',
  })
  @IsString()
  @IsNotEmpty()
  role_name: string;

  @ApiPropertyOptional({
    description: 'An array of permission IDs to initially assign to the role.',
    type: [Number],
    example: [1, 5, 8],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}