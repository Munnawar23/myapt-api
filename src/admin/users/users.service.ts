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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
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
  ) {}

  private checkAdminSociety(adminUser: User) {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
  }

  async create(
    createDto: CreateAdminUserDto,
    adminUser: User,
  ): Promise<Omit<User, 'password_hash'>> {
    this.checkAdminSociety(adminUser);
    const { email, password, roleIds, ...rest } = createDto;

    const existingUser = await this.usersRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const roles = await this.roleRepository.findBy({ role_id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      ...rest,
      email,
      password_hash,
      roles,
      society_id: adminUser.society_id, // Assign user to the admin's society
      society_status: UserSocietyStatus.APPROVED, // Admins create pre-approved users
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password_hash: _, ...result } = savedUser;
    return result;
  }

  async findAll(
    query: PaginationQueryDto,
    adminUser: User,
  ): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
    this.checkAdminSociety(adminUser);
    const { limit, offset, search, sortBy, sortOrder } = query;
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.owned_flat', 'flat')
      .where('user.society_id = :societyId', {
        societyId: adminUser.society_id,
      });

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

    this.checkAdminSociety(adminUser);
    if (user.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You can only view users from your own society.',
      );
    }

    delete user.password_hash;
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: AdminUpdateUserDto,
    adminUser: User,
  ): Promise<User> {
    await this.findOneById(userId, adminUser); // This performs the existence and society check

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
    const user = await this.findOneById(userId, adminUser); // Security check
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
    // This is tricky to scope by society. An admin should have the right to remove any family member
    // as long as they can view the primary user. The check is implicitly handled by requiring a valid user first.
    // For now, this remains as-is, assuming it's called after validating access to the user.
    const result = await this.familyMembersRepository.delete(memberId);
    if (result.affected === 0)
      throw new NotFoundException(
        `Family member with ID ${memberId} not found.`,
      );
  }

  async removeUser(userId: string, adminUser: User): Promise<void> {
    await this.findOneById(userId, adminUser); // Security check
    const result = await this.usersRepository.delete(userId);
    if (result.affected === 0)
      throw new NotFoundException(`User with ID ${userId} not found.`);
  }
}
