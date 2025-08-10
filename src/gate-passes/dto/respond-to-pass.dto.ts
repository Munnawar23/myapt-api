import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PassAction {
  APPROVE = 'APPROVE',
  DENY = 'DENY',
}

export class RespondToPassDto {
  @ApiProperty({
    description: 'The action to take on the pass.',
    enum: PassAction,
    example: PassAction.APPROVE,
  })
  @IsEnum(PassAction)
  @IsNotEmpty()
  action: PassAction;
}
