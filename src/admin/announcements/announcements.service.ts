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
import { RbacService } from 'src/rbac/rbac.service';

@Injectable()
export class AnnouncementsAdminService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    private readonly rbacService: RbacService,
  ) { }

  private async checkAdminSociety(adminUser: User) {
    if (adminUser.roles.some((role) => role.role_name === 'SUPERADMIN')) {
      return; // Super Admin can access all
    }
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(
    createDto: CreateAnnouncementDto,
    adminUser: User,
  ): Promise<Announcement> {
    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    // Allow everyone (Receptionist included) to set is_published directly
    const isPublished = createDto.is_published ?? false;

    let societyId = adminUser.society_id;
    if (isSuperAdmin && createDto.society_id) {
      societyId = createDto.society_id;
    }


    if (isSuperAdmin && !societyId) {
      throw new ForbiddenException('Society ID is required for Super Admin creation.');
    }

    if (!isSuperAdmin && !societyId) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const announcement = this.announcementsRepository.create({
      ...createDto,
      is_published: isPublished,
      society_id: societyId,
    });
    return this.announcementsRepository.save(announcement);
  }


  async findAll(
    adminUser: User,
    societyId?: string,
  ): Promise<Announcement[]> {
    await this.checkAdminSociety(adminUser);
    const isSuperAdmin = adminUser.roles.some(
      (r) => r.role_name === 'SUPERADMIN',
    );

    if (isSuperAdmin) {
      const where: any = {};
      if (societyId) {
        where.society_id = societyId;
      }
      return this.announcementsRepository.find({
        where,
        order: { createdAt: 'DESC' },
      });
    }

    return this.announcementsRepository.find({
      where: { society_id: adminUser.society_id },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, adminUser: User): Promise<void> {
    await this.checkAdminSociety(adminUser);
    const announcement = await this.announcementsRepository.findOneBy({ id });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found.`);
    }

    const isSuperAdmin = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');
    // If not super admin, must match society
    if (!isSuperAdmin && announcement.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You do not have permission to delete this announcement.',
      );
    }

    // Check permissions strictly? Controller handles `manage_announcements` for delete.
    // So we are good.

    await this.announcementsRepository.remove(announcement);
  }

  async publish(id: string, adminUser: User): Promise<Announcement> {
    await this.checkAdminSociety(adminUser);
    const announcement = await this.announcementsRepository.findOneBy({ id });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found.`);
    }

    const isSuperAdmin = adminUser.roles.some(
      (role) => role.role_name === 'SUPERADMIN',
    );

    // If not super admin, must match society
    if (!isSuperAdmin && announcement.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You do not have permission to publish this announcement.',
      );
    }

    announcement.is_published = true;
    return this.announcementsRepository.save(announcement);
  }
}
