import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSocietyStatus } from '../database/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SocietyAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Gets a list of users with PENDING status for the admin's society.
   * @param adminUser The authenticated admin user making the request.
   */
  async getPendingUsers(adminUser: User): Promise<User[]> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    return this.userRepository.find({
      where: {
        society_id: adminUser.society_id,
        society_status: UserSocietyStatus.PENDING,
      },
      select: ['id', 'full_name', 'email', 'phone_number'], // Only return necessary fields
    });
  }

  /**
   * Updates the society status of a target user.
   * @param adminUser The authenticated admin user making the request.
   * @param targetUserId The ID of the user to be updated.
   * @param newStatus The new status to set.
   */
  async updateUserStatus(
    adminUser: User,
    targetUserId: string,
    newStatus: UserSocietyStatus,
  ): Promise<User> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const targetUser = await this.userRepository.findOneBy({
      id: targetUserId,
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    // CRITICAL SECURITY CHECK: Ensure the admin is managing a user within their own society.
    if (targetUser.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You can only manage users within your own society.',
      );
    }

    targetUser.society_status = newStatus;
    await this.userRepository.save(targetUser);

    // Exclude password hash from the returned object
    delete targetUser.password_hash;
    return targetUser;
  }
}
