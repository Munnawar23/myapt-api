import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the role to assign to the user',
  })
  @IsInt()
  @IsNotEmpty()
  roleId: number;
}
