import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from 'src/database/entities/announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
