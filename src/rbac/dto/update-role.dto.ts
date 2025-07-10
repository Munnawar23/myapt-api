import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsInt, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'The new name for the role.',
    example: 'Content Editor',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role_name?: string;

  @ApiPropertyOptional({
    description: 'An array of permission IDs to assign to the role. This will overwrite all existing permissions.',
    type: [Number],
    example: [1, 5, 8],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}