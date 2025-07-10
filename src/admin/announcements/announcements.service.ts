import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcement } from 'src/database/entities/announcement.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsAdminService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
  ) {}

  private checkAdminSociety(adminUser: User) {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(
    createDto: CreateAnnouncementDto,
    adminUser: User,
  ): Promise<Announcement> {
    this.checkAdminSociety(adminUser);

    const announcement = this.announcementsRepository.create({
      ...createDto,
      society_id: adminUser.society_id,
    });
    return this.announcementsRepository.save(announcement);
  }

  async findAll(adminUser: User): Promise<Announcement[]> {
    this.checkAdminSociety(adminUser);
    return this.announcementsRepository.find({
      where: { society_id: adminUser.society_id },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, adminUser: User): Promise<void> {
    this.checkAdminSociety(adminUser);
    const announcement = await this.announcementsRepository.findOneBy({ id });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found.`);
    }

    if (announcement.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You do not have permission to delete this announcement.',
      );
    }

    await this.announcementsRepository.remove(announcement);
  }
}
