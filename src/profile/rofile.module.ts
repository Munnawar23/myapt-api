import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module'; // Import UsersModule to use UsersService

@Module({
  imports: [UsersModule], // Make UsersService available here
  controllers: [ProfileController],
})
export class ProfileModule {}
