import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { Flat } from 'src/database/entities/flat.entity';
import { FamilyMember } from 'src/database/entities/family-member.entity';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { Role } from 'src/database/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Flat) private flatsRepository: Repository<Flat>,
    @InjectRepository(FamilyMember)
    private familyMembersRepository: Repository<FamilyMember>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) { }

  private checkAdminSociety(adminUser: User) {
    const isSuperAdmin = adminUser.roles.some(role => role.role_name === 'SUPERADMIN');
    if (!isSuperAdmin && !adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(
    createDto: CreateAdminUserDto,
    adminUser: User,
  ): Promise<Omit<User, 'password_hash'>> {
    const { email, password, roleIds, ...rest } = createDto;

    // 1. Identify the roles of the creator
    const isAdminSuper = adminUser.roles.some(
      (role) => role.role_name === 'SUPERADMIN',
    );
    const isAdminManager = adminUser.roles.some(
      (role) => role.role_name === 'MANAGER',
    );
    const isAdminReceptionist = adminUser.roles.some(
      (role) => role.role_name === 'RECEPTIONIST',
    );

    // 2. Fetch the target roles to validate them
    const targetRoles = await this.roleRepository.findBy({
      role_id: In(roleIds),
    });
    if (targetRoles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    // 3. Absolute Rule: No one can create a SUPERADMIN
    if (targetRoles.some((role) => role.role_name === 'SUPERADMIN')) {
      throw new ForbiddenException(
        'Creation of Super Admin users is not allowed.',
      );
    }

    // 4. Role Hierarchy Check
    if (isAdminSuper) {
      // Super Admin can create MANAGER, RECEPTIONIST, USER (any role except SUPERADMIN)
    } else if (isAdminManager) {
      // Manager can create RECEPTIONIST, USER
      const invalidRoles = targetRoles.filter(
        (role) => !['RECEPTIONIST', 'USER'].includes(role.role_name),
      );
      if (invalidRoles.length > 0) {
        throw new ForbiddenException(
          'Managers can only create Receptionists or General Users.',
        );
      }
    } else if (isAdminReceptionist) {
      // Receptionist can create only USER
      const invalidRoles = targetRoles.filter(
        (role) => role.role_name !== 'USER',
      );
      if (invalidRoles.length > 0) {
        throw new ForbiddenException(
          'Receptionists can only create General Users.',
        );
      }
    } else {
      throw new ForbiddenException(
        'You do not have permission to create users.',
      );
    }

    // 5. Society Restriction Check
    let targetSocietyId = adminUser.society_id;

    if (createDto.society_id) {
      // If NOT Super Admin, they can ONLY use their own society_id
      if (
        !isAdminSuper &&
        adminUser.society_id &&
        createDto.society_id !== adminUser.society_id
      ) {
        throw new ForbiddenException(
          'You can only create users for your own society.',
        );
      }
      targetSocietyId = createDto.society_id;
    }

    if (!targetSocietyId && !isAdminSuper) {
      throw new ForbiddenException('Society ID is required to create a user.');
    }

    // 6. Role Limit Check (Max 5 Managers, 1 Receptionist per society)
    if (targetSocietyId) {
      if (targetRoles.some((role) => role.role_name === 'MANAGER')) {
        const managerCount = await this.usersRepository
          .createQueryBuilder('user')
          .innerJoin('user.roles', 'role')
          .where('user.society_id = :societyId', {
            societyId: targetSocietyId,
          })
          .andWhere('role.role_name = :roleName', { roleName: 'MANAGER' })
          .getCount();

        if (managerCount >= 5) {
          throw new ForbiddenException(
            'Maximum limit of 5 Managers for this society reached.',
          );
        }
      }

      if (targetRoles.some((role) => role.role_name === 'RECEPTIONIST')) {
        const receptionistCount = await this.usersRepository
          .createQueryBuilder('user')
          .innerJoin('user.roles', 'role')
          .where('user.society_id = :societyId', {
            societyId: targetSocietyId,
          })
          .andWhere('role.role_name = :roleName', { roleName: 'RECEPTIONIST' })
          .getCount();

        if (receptionistCount >= 1) {
          throw new ForbiddenException(
            'This society already has a Receptionist. Only one is allowed.',
          );
        }
      }
    }


    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      ...rest,
      email,
      password_hash,
      roles: targetRoles,
      society_id: targetSocietyId,
      society_status: UserSocietyStatus.APPROVED,
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password_hash: _, ...result } = savedUser;
    return result;
  }


  async findAll(
    query: UserQueryDto,
    adminUser: User,
  ): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    this.checkAdminSociety(adminUser);
    const { limit, offset, search, sortBy, sortOrder, societyId } = query;
    const isSuperAdmin = adminUser.roles.some(role => role.role_name === 'SUPERADMIN');

    const effectiveSocietyId = societyId || adminUser.society_id;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.owned_flat', 'flat')
      .leftJoinAndSelect('user.roles', 'role');

    // If NOT Super Admin, always filter by society.
    if (!isSuperAdmin || effectiveSocietyId) {
      qb.where('user.society_id = :societyId', {
        societyId: effectiveSocietyId,
      });
    }

    if (search) {
      qb.andWhere(
        '(user.full_name ILIKE :search OR user.email ILIKE :search OR flat.flat_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const total = await qb.getCount();
    qb.orderBy(`user.${sortBy}`, sortOrder).offset(offset).limit(limit);
    const users = await qb.getMany();
    const sanitized = users.map(({ password_hash, ...result }) => result);
    return new PaginatedResponse(sanitized, total, limit, query.page);
  }

  async findOneById(userId: string, adminUser: User): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { owned_flat: { family_members: true }, roles: true },
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const isSuperAdmin = adminUser.roles.some(role => role.role_name === 'SUPERADMIN');

    if (!isSuperAdmin) {
      this.checkAdminSociety(adminUser);
      if (user.society_id !== adminUser.society_id) {
        throw new ForbiddenException(
          'You can only view users from your own society.',
        );
      }
    }

    delete user.password_hash;
    return user;
  }

  async updateFcmToken(userId: string, fcmToken: string, adminUser: User): Promise<User> {
    const user = await this.findOneById(userId, adminUser);
    user.fcmToken = fcmToken;
    return this.usersRepository.save(user);
  }

  async updateUser(
    userId: string,
    updateUserDto: AdminUpdateUserDto,
    adminUser: User,
  ): Promise<User> {
    await this.findOneById(userId, adminUser);

    const user = await this.usersRepository.preload({
      id: userId,
      ...updateUserDto,
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    if (updateUserDto.email) {
      const existing = await this.usersRepository.findOneBy({
        email: updateUserDto.email,
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email is already in use.');
      }
    }

    await this.usersRepository.save(user);
    return this.findOneById(userId, adminUser);
  }

  async addFamilyMember(
    userId: string,
    addMemberDto: AddFamilyMemberDto,
    adminUser: User,
  ): Promise<FamilyMember> {
    const user = await this.findOneById(userId, adminUser);
    if (!user.owned_flat)
      throw new NotFoundException(
        `User with ID ${userId} does not have a linked flat.`,
      );

    const newMember = this.familyMembersRepository.create({
      ...addMemberDto,
      flat_id: user.owned_flat.id,
    });
    return this.familyMembersRepository.save(newMember);
  }

  async removeFamilyMember(memberId: string): Promise<void> {
    const result = await this.familyMembersRepository.delete(memberId);
    if (result.affected === 0)
      throw new NotFoundException(
        `Family member with ID ${memberId} not found.`,
      );
  }

  async removeUser(userId: string, adminUser: User): Promise<void> {
    await this.findOneById(userId, adminUser);
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${userId} not found.`);
  }
}
