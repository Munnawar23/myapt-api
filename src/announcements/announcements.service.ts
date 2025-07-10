import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcement } from 'src/database/entities/announcement.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async findAllForUser(user: User): Promise<Announcement[]> {
    if (!user.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    if (user.society_status !== UserSocietyStatus.APPROVED) {
      throw new ForbiddenException(
        'You must be an approved member to view announcements.',
      );
    }

    return this.announcementRepository.find({
      where: {
        society_id: user.society_id,
      },
      order: {
        createdAt: 'DESC',
      },
      select: ['id', 'title', 'content', 'createdAt'], // Select only the necessary fields
    });
  }
}
