import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from 'src/database/entities/announcement.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { AnnouncementsAdminController } from './announcements.controller';
import { AnnouncementsAdminService } from './announcements.service';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement]), RbacModule],
  controllers: [AnnouncementsAdminController],
  providers: [AnnouncementsAdminService],
})
export class AnnouncementsAdminModule {}
