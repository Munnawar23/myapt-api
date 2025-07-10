import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

// Define an enum for the possible actions a user can take
export enum DeliveryAction {
  APPROVE = 'APPROVE',
  DENY = 'DENY',
}

export class RespondToDeliveryDto {
  @ApiProperty({
    description: 'The action to take on the delivery.',
    enum: DeliveryAction,
    example: DeliveryAction.APPROVE,
  })
  @IsEnum(DeliveryAction)
  @IsNotEmpty()
  action: DeliveryAction;
}
