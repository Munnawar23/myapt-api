import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { FIREBASE_MESSAGING } from '../firebase/firebase.module';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @Inject(FIREBASE_MESSAGING) private readonly messaging: admin.messaging.Messaging,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) { }

    async sendToToken(
        token: string,
        title: string,
        body: string,
        data?: { [key: string]: string },
    ): Promise<{ success: boolean; messageId?: string; error?: any }> {
        const message: admin.messaging.Message = {
            token: token,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: {
                notification: {
                    sound: 'default',
                    channelId: 'default_channel_id',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                    },
                },
            },
        };

        try {
            const response = await this.messaging.send(message);
            this.logger.log(`Successfully sent message to token: ${response}`);
            return { success: true, messageId: response };
        } catch (error) {
            this.logger.error(`Error sending message to token:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sends a push notification to a specific user.
     * @param userId The ID of the user to notify.
     * @param title The title of the notification.
     * @param body The body message of the notification.
     * @param data Optional data payload to send with the notification.
     */
    async sendPushNotification(
        userId: string,
        title: string,
        body: string,
        data?: { [key: string]: string },
    ) {
        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) {
            this.logger.warn(`User with ID ${userId} not found.`);
            return;
        }

        if (!user.fcmToken || user.fcmToken === '') {
            this.logger.warn(`User ${user.id} does not have an FCM token.`);
            return;
        }

        const message: admin.messaging.Message = {
            token: user.fcmToken,
            notification: {
                title,
                body,
            },
            data: data || {},
            android: { // Optional: Android specific configurations
                notification: {
                    sound: 'default',
                    channelId: 'default_channel_id', // Make sure this channel exists on the client
                }
            },
            apns: { // Optional: Apple Push Notification Service specific configurations
                payload: {
                    aps: {
                        sound: 'default',
                    }
                }
            }
        };

        try {
            const response = await this.messaging.send(message);
            this.logger.log(`Successfully sent message to user ${userId}: ${response}`);
        } catch (error) {
            this.logger.error(`Error sending message to user ${userId}:`, error);

            // If the token is invalid, it's good practice to remove it
            if (error.code === 'messaging/registration-token-not-registered') {
                this.logger.log(`Invalid FCM token for user ${userId}. Removing it.`);
                user.fcmToken = '';
                await this.userRepository.save(user);
            }
        }
    }
}