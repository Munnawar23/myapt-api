import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Society } from '../database/entities/society.entity';
import { CreateSocietyDto } from './dto/create-society.dto';

@Injectable()
export class SocietiesService {
  constructor(
    @InjectRepository(Society)
    private readonly societyRepository: Repository<Society>,
  ) {}

  // For SUPER_ADMIN to create a new society
  async create(createSocietyDto: CreateSocietyDto): Promise<Society> {
    const existingSociety = await this.societyRepository.findOne({
      where: { name: createSocietyDto.name },
    });

    if (existingSociety) {
      throw new ConflictException(
        `A society with the name "${createSocietyDto.name}" already exists.`,
      );
    }

    const newSociety = this.societyRepository.create(createSocietyDto);
    return this.societyRepository.save(newSociety);
  }

  // For public listing (e.g., on registration page)
  async findAllPublic(): Promise<Society[]> {
    return this.societyRepository.find({
      select: ['id', 'name'], // Only return non-sensitive info
    });
  }

  // For SUPER_ADMIN to get a complete list
  async findAllForSuperAdmin(): Promise<Society[]> {
    // In the future, this could include relations like user counts, etc.
    return this.societyRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOneById(id: string): Promise<Society> {
    const society = await this.societyRepository.findOneBy({ id });
    if (!society) {
      throw new NotFoundException(`Society with ID ${id} not found.`);
    }
    return society;
  }

  async remove(id: string): Promise<void> {
    const result = await this.societyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Society with ID ${id} not found.`);
    }
  }
}
