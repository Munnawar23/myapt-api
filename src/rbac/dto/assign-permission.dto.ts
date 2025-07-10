import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionDto {
  @ApiProperty({
    example: 5,
    description: 'The ID of the permission to assign to the role',
  })
  @IsInt()
  @IsNotEmpty()
  permissionId: number;
}