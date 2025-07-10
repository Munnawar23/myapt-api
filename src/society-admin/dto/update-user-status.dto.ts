import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserSocietyStatus } from '../../database/entities/user.entity';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: "The new status for the user's society membership.",
    enum: [UserSocietyStatus.APPROVED, UserSocietyStatus.REJECTED],
    example: UserSocietyStatus.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum([UserSocietyStatus.APPROVED, UserSocietyStatus.REJECTED], {
    message: `Status must be either ${UserSocietyStatus.APPROVED} or ${UserSocietyStatus.REJECTED}`,
  })
  status: UserSocietyStatus;
}
