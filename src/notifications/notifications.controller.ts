import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

// In a real app, you would have a RolesGuard to ensure only admins can use this.
// For now, we will just protect it with the standard JWT AuthGuard.

@ApiTags('Notifications (Admin)')
@ApiBearerAuth() // Indicates this endpoint requires a JWT token
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('send-direct')
    @UseGuards(AuthGuard('jwt')) // Protect this endpoint
    // @UseGuards(AuthGuard('jwt'), RolesGuard) // In a real app with roles
    // @Roles(Role.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send a notification to a specific device (Admin Only)' })
    @ApiResponse({ status: 200, description: 'Notification sent successfully or failed with a reason.' })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async sendDirectNotification(
        @Body() sendNotificationDto: SendNotificationDto,
    ) {
        const { token, title, body, data } = sendNotificationDto;
        const result = await this.notificationsService.sendToToken(
            token,
            title,
            body,
            data,
        );
        return result;
    }
}