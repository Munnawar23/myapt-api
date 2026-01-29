import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AddFamilyMemberDto } from 'src/admin/users/dto/add-family-member.dto';
import { FamilyMember } from 'src/database/entities/family-member.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(FamilyMember)
    private familyMembersRepository: Repository<FamilyMember>,
  ) { }

  async getFullProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      // Use 'relations' to eager-load the flat and the family members within that flat
      relations: {
        owned_flat: {
          family_members: true,
        },
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // We can remove the password hash before returning for security
    delete user.password_hash;
    return user;
  }

  // This method updates the user's personal details
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    if (updateProfileDto.email) {
      const existingUser = await this.usersRepository.findOneBy({
        email: updateProfileDto.email,
      });
      // Ensure the email isn't already used by *another* user.
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use.');
      }
    }

    if (Object.keys(updateProfileDto).length === 0) {
      // Nothing to update, just return the profile
      return this.getFullProfile(userId);
    }

    const updateResult = await this.usersRepository.update(
      userId,
      updateProfileDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    // 'preload' finds the user by ID and merges the new data onto it.
    // This is safer than a raw update as it checks if the entity exists first.

    return this.getFullProfile(userId);
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<User> {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.fcmToken = fcmToken;
    return this.usersRepository.save(user);
  }

  async addFamilyMember(
    userId: string,
    addMemberDto: AddFamilyMemberDto,
  ): Promise<FamilyMember> {
    const user = await this.findOneById(userId);
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

  async findOneById(userId: string): Promise<User> {
    // This is identical to the getFullProfile logic
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { owned_flat: { family_members: true }, roles: true },
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    delete user.password_hash;
    return user;
  }

  async removeFamilyMember(memberId: string): Promise<void> {
    const result = await this.familyMembersRepository.delete(memberId);
    if (result.affected === 0)
      throw new NotFoundException(
        `Family member with ID ${memberId} not found.`,
      );
  }

  async updateFamilyMember(
    memberId: string,
    addMemberDto: AddFamilyMemberDto,
  ): Promise<FamilyMember> {
    const member = await this.familyMembersRepository.findOneBy({
      id: memberId,
    });
    if (!member)
      throw new NotFoundException(
        `Family member with ID ${memberId} not found`,
      );
    const updatedMember = this.familyMembersRepository.merge(
      member,
      addMemberDto,
    );
    return this.familyMembersRepository.save(updatedMember);
  }

  async findByEmail(email: string): Promise<User | undefined | null> {
    return this.usersRepository.findOneBy({ email });
  }

  // async findAll(
  //   paginationQuery: PaginationQueryDto,
  // ): Promise<PaginatedResponse<Omit<User, 'password_hash'>>> {
  //   const { limit, offset, search, sortBy, sortOrder } = paginationQuery;

  //   const queryBuilder = this.usersRepository.createQueryBuilder('user');

  //   // Add search functionality
  //   if (search) {
  //     // ILike is a case-insensitive "LIKE" query, perfect for searching
  //     queryBuilder.where('user.full_name ILIKE :search', {
  //       search: `%${search}%`,
  //     });
  //   }

  //   // Get the total count of items that match the search criteria
  //   const total = await queryBuilder.getCount();

  //   queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

  //   // Apply pagination and fetch the data for the current page
  //   queryBuilder.offset(offset).limit(limit);

  //   const users = await queryBuilder.getMany();

  //   // Remove password hashes before returning the data
  //   const sanitizedUsers = users.map(({ password_hash, ...result }) => result);

  //   // Create and return the structured paginated response
  //   return new PaginatedResponse(
  //     sanitizedUsers,
  //     total,
  //     limit,
  //     paginationQuery.page,
  //   );
  // }

  // async bulkRemove(userIds: string[]): Promise<void> {
  //   // Using 'In' operator is the most efficient way to delete multiple items
  //   const result = await this.usersRepository.delete({
  //     id: In(userIds),
  //   });

  //   // Check if any users were actually deleted
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`No users found with the provided IDs.`);
  //   }
  // }

  // async remove(userId: string): Promise<void> {
  //   const result = await this.usersRepository.delete(userId);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`User with ID ${userId} not found`);
  //   }
  // }
}
