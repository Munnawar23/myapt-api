import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from 'src/database/entities/user.entity';
// We don't need to import FirebaseModule because it's global
// but it's good practice to be explicit if you prefer:
// import { FirebaseModule } from '../firebase/firebase.module'; 

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService], // Export if other modules need to use it
})
export class NotificationsModule { }