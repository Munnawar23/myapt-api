import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

// A custom provider token to inject the Firebase Messaging instance
export const FIREBASE_MESSAGING = 'FIREBASE_MESSAGING';

@Global() // Makes the module's providers available globally
@Module({})
export class FirebaseModule {
    static forRoot(): DynamicModule {
        const firebaseMessagingProvider = {
            provide: FIREBASE_MESSAGING,
            useFactory: (configService: ConfigService) => {
                const firebaseConfig = {
                    // We will get these from environment variables
                    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
                    privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
                    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
                };

                if (admin.apps.length === 0) {
                    admin.initializeApp({
                        credential: admin.credential.cert(firebaseConfig),
                    });
                    console.log('Firebase Admin initialized successfully.');
                }

                return admin.messaging();
            },
            inject: [ConfigService],
        };

        return {
            module: FirebaseModule,
            imports: [ConfigModule], // Import ConfigModule to use ConfigService
            providers: [firebaseMessagingProvider],
            exports: [firebaseMessagingProvider],
        };
    }
}