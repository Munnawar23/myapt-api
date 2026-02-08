import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSocietyStatus } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SocietyAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  /**
   * Adds a user to the Management Committee (MC).
   */
  async addUserToMc(adminUser: User, targetUserId: string): Promise<User> {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
      relations: ['roles'],
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    // Security check: Same society (unless Super Admin)
    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');
    if (!isAdminSuper && targetUser.society_id !== adminUser.society_id) {
      throw new ForbiddenException('You can only manage users within your own society.');
    }

    const mcRole = await this.roleRepository.findOneBy({ role_name: 'MC' });
    if (!mcRole) {
      throw new NotFoundException('MC role not found in database.');
    }

    // Validation: Only standard Users can be promoted to MC
    const isStandardUser = targetUser.roles.some((r) => r.role_name === 'USER');
    if (!isStandardUser) {
      throw new ForbiddenException(
        'Only residents with the USER role can be promoted to the Management Committee.',
      );
    }


    // Check if user already has MC role
    if (!targetUser.roles.some((r) => r.role_id === mcRole.role_id)) {
      targetUser.roles.push(mcRole);
      await this.userRepository.save(targetUser);
    }

    delete targetUser.password_hash;
    return targetUser;
  }

  /**
   * Removes a user from the Management Committee (MC).
   */
  async removeUserFromMc(adminUser: User, targetUserId: string): Promise<User> {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
      relations: ['roles'],
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID ${targetUserId} not found.`);
    }

    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');
    if (!isAdminSuper && targetUser.society_id !== adminUser.society_id) {
      throw new ForbiddenException('You can only manage users within your own society.');
    }

    const mcRole = await this.roleRepository.findOneBy({ role_name: 'MC' });
    if (!mcRole) {
      throw new NotFoundException('MC role not found in database.');
    }

    targetUser.roles = targetUser.roles.filter((r) => r.role_id !== mcRole.role_id);
    await this.userRepository.save(targetUser);

    delete targetUser.password_hash;
    return targetUser;
  }



  /**
   * Gets a list of all Management Committee (MC) members.
   * Super Admins can query any society. Regular admins are restricted to their own.
   */
  async getMcMembers(adminUser: User, societyId?: string): Promise<User[]> {
    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    let targetSocietyId = adminUser.society_id;

    if (isAdminSuper) {
      if (!societyId && !targetSocietyId) {
        throw new ForbiddenException(
          'Super Admins must provide a societyId query parameter.',
        );
      }
      // If provided, use the query param. Otherwise default to their associated society (if any).
      if (societyId) {
        targetSocietyId = societyId;
      }
    } else {
      // Regular admin checks
      if (!targetSocietyId) {
        throw new ForbiddenException('You are not associated with any society.');
      }
      if (societyId && societyId !== targetSocietyId) {
        throw new ForbiddenException(
          'You can only view MC members of your own society.',
        );
      }
    }

    return this.userRepository.find({
      where: {
        society_id: targetSocietyId,
        roles: {
          role_name: 'MC',
        },
      },
      relations: ['roles', 'owned_flat'],
      select: ['id', 'full_name', 'email', 'phone_number'],
    });
  }


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
