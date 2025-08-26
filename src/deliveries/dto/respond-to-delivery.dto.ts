// src/deliveries/dto/respond-to-delivery.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

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

  @ApiProperty({
    description: 'Optional: The One-Time Password for the delivery, if being updated during response.',
    example: '123456',
    minLength: 4,
    maxLength: 10,
    required: false, // Mark as optional
  })
  @IsOptional() // Make the field optional
  @IsString()
  @Length(4, 10, { message: 'OTP must be between 4 and 10 characters long.' }) // Example validation
  otp?: string; // Make the property optional with '?'
}