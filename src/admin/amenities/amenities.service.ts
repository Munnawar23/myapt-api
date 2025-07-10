import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';

@Injectable()
export class AmenitiesAdminService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async create(createDto: CreateAmenityDto, adminUser: User): Promise<Amenity> {
    console.log('create dto', createDto);
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const existing = await this.amenityRepository.findOne({
      where: { name: createDto.name, society_id: adminUser.society_id },
    });

    if (existing) {
      throw new ConflictException(
        `An amenity with the name "${createDto.name}" already exists in your society.`,
      );
    }

    const newAmenity = this.amenityRepository.create({
      ...createDto,
      // Map DTO properties to Entity properties
      service_fee: createDto.service_fee_amount,
      slot_duration_minutes: createDto.slot_duration,
      slot_capacity: createDto.slot_capacity,
      society_id: adminUser.society_id,
    });

    return this.amenityRepository.save(newAmenity);
  }

  async findAll(adminUser: User): Promise<Amenity[]> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
    return this.amenityRepository.find({
      where: { society_id: adminUser.society_id },
    });
  }

  async findOne(id: string, adminUser: User): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found.`);
    }
    if (amenity.society_id !== adminUser.society_id) {
      throw new ForbiddenException(
        'You do not have permission to view this amenity.',
      );
    }
    return amenity;
  }

  async update(
    id: string,
    updateDto: UpdateAmenityDto,
    adminUser: User,
  ): Promise<Amenity> {
    const amenity = await this.findOne(id, adminUser); // Security check is inside findOne
    Object.assign(amenity, updateDto);
    return this.amenityRepository.save(amenity);
  }

  async remove(id: string, adminUser: User): Promise<void> {
    const amenity = await this.findOne(id, adminUser); // Security check is inside findOne
    await this.amenityRepository.remove(amenity);
  }
}
