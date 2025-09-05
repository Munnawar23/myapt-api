import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
    @ApiProperty({
        description: 'The FCM device token to which the notification will be sent.',
        example: 'cM............GZc',
    })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        description: 'The title of the push notification.',
        example: 'Special Announcement',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'The main content (body) of the push notification.',
        example: 'Check out our new feature available now!',
    })
    @IsString()
    @IsNotEmpty()
    body: string;

    @ApiProperty({
        description: 'Optional key-value data payload to send with the notification.',
        example: { screen: 'promo', id: '123' },
        required: false,
    })
    @IsOptional()
    @IsObject()
    data?: { [key: string]: string };
}