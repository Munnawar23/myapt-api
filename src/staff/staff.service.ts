import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from 'src/database/entities/staff.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async getUserFlatId(userId: string): Promise<string> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['owned_flat'],
    });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);
    if (!user.owned_flat)
      throw new ForbiddenException('User is not associated with a flat.');
    return user.owned_flat.id;
  }

  async create(userId: string, createDto: CreateStaffDto): Promise<Staff> {
    const flatId = await this.getUserFlatId(userId);
    const newStaff = this.staffRepository.create({
      ...createDto,
      flat_id: flatId,
    });
    return this.staffRepository.save(newStaff);
  }

  async findAllForUser(userId: string): Promise<Staff[]> {
    const flatId = await this.getUserFlatId(userId);
    return this.staffRepository.find({
      where: { flat_id: flatId },
    });
  }

  async update(
    staffId: string,
    userId: string,
    updateDto: UpdateStaffDto,
  ): Promise<Staff> {
    const flatId = await this.getUserFlatId(userId);
    const staff = await this.staffRepository.findOneBy({
      id: staffId,
      flat_id: flatId,
    });

    if (!staff) {
      throw new NotFoundException(
        `Staff with ID ${staffId} not found for your flat.`,
      );
    }

    Object.assign(staff, updateDto);
    return this.staffRepository.save(staff);
  }

  async remove(staffId: string, userId: string): Promise<void> {
    const flatId = await this.getUserFlatId(userId);
    const result = await this.staffRepository.delete({
      id: staffId,
      flat_id: flatId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Staff with ID ${staffId} not found for your flat.`,
      );
    }
  }
}
