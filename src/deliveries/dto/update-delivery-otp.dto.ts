// src/deliveries/dto/update-delivery-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class UpdateDeliveryOtpDto {
    @ApiProperty({
        description: 'The new One-Time Password for the delivery.',
        example: '123456',
        minLength: 4,
        maxLength: 10, // Adjust length as per your OTP requirements
    })
    @IsString()
    @IsNotEmpty()
    @Length(4, 10, { message: 'OTP must be between 4 and 10 characters long.' }) // Example validation
    otp: string;
}