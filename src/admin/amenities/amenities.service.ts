import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { GenerateSlotsDto } from './dto/generate-slots.dto';

@Injectable()
export class AmenitiesAdminService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
    @InjectRepository(AmenitySlot)
    private readonly slotRepository: Repository<AmenitySlot>,
  ) { }

  async create(createDto: CreateAmenityDto, adminUser: User): Promise<Amenity> {
    console.log('create dto', createDto);

    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');
    let targetSocietyId = adminUser.society_id;

    if (isAdminSuper) {
      if (createDto.society_id) {
        targetSocietyId = createDto.society_id;
      }
      if (!targetSocietyId) {
        throw new ForbiddenException(
          'Super Admins must provide a society_id in the body.',
        );
      }
    } else {
      if (!targetSocietyId) {
        throw new ForbiddenException('You are not associated with any society.');
      }
    }

    const existing = await this.amenityRepository.findOne({
      where: { name: createDto.name, society_id: targetSocietyId },
    });

    if (existing) {
      throw new ConflictException(
        `An amenity with the name "${createDto.name}" already exists in the target society.`,
      );
    }

    const newAmenity = this.amenityRepository.create({
      ...createDto,
      society_id: targetSocietyId,
    });

    return this.amenityRepository.save(newAmenity);
  }


  async findAll(adminUser: User): Promise<Amenity[]> {
    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    if (!isAdminSuper && !adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }

    const where: any = {};
    if (!isAdminSuper) {
      where.society_id = adminUser.society_id;
    }

    return this.amenityRepository.find({
      where,
    });
  }

  async findOne(id: string, adminUser: User): Promise<Amenity> {
    const amenity = await this.amenityRepository.findOneBy({ id });
    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found.`);
    }

    const isAdminSuper = adminUser.roles.some((r) => r.role_name === 'SUPERADMIN');

    if (!isAdminSuper && amenity.society_id !== adminUser.society_id) {
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

  async generateSlots(
    amenityId: string,
    generateDto: GenerateSlotsDto,
    adminUser: User,
  ) {
    console.log('generateSlots payload:', generateDto);
    const amenity = await this.findOne(amenityId, adminUser);

    const start = new Date(generateDto.startDate);
    const end = new Date(generateDto.endDate);

    if (end < start) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

    if (diffDays > 31) {
      throw new BadRequestException(
        'You can only generate slots for a maximum of 31 days at a time.',
      );
    }

    const slots: any[] = [];

    // Helper to parse time string "HH:mm:ss"
    const parseTime = (timeStr: string) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      return { h, m, s };
    };

    const opening = parseTime(amenity.opening_time);
    const closing = parseTime(amenity.closing_time);

    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      let currentSlotStart = new Date(d);
      currentSlotStart.setHours(opening.h, opening.m, opening.s, 0);

      const closingTime = new Date(d);
      closingTime.setHours(closing.h, closing.m, closing.s, 0);

      while (currentSlotStart < closingTime) {
        const currentSlotEnd = new Date(currentSlotStart);
        currentSlotEnd.setMinutes(
          currentSlotStart.getMinutes() + amenity.slot_duration_minutes,
        );

        if (currentSlotEnd > closingTime) break;

        slots.push({
          amenity_id: amenity.id,
          start_time: new Date(currentSlotStart),
          end_time: new Date(currentSlotEnd),
          is_active: true,
        });

        currentSlotStart = new Date(currentSlotEnd);
      }
    }

    // Use upsert or handle duplicates to avoid error on rerun
    // For simplicity, we'll use a loop or save all (Unique constraint will prevent duplicates if we handle it)
    // To be safe and efficient, we can use an 'upsert' or 'save' with unique constraint handling
    try {
      await this.slotRepository
        .createQueryBuilder()
        .insert()
        .into(AmenitySlot)
        .values(slots)
        .orIgnore() // Ignore if slot already exists for that time
        .execute();
    } catch (error) {
      console.error('Error generating slots:', error);
      throw new ConflictException('Failed to generate some slots.');
    }

    return { message: `${slots.length} slots generation attempted.` };
  }

  async toggleSlotAvailability(
    amenityId: string,
    slotId: string,
    isActive: boolean,
    adminUser: User,
  ) {
    const amenity = await this.findOne(amenityId, adminUser);
    const slot = await this.slotRepository.findOne({
      where: { id: slotId, amenity_id: amenity.id },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found for this amenity.');
    }

    slot.is_active = isActive;
    return this.slotRepository.save(slot);
  }

  async findAllSlots(amenityId: string, adminUser: User) {
    const amenity = await this.findOne(amenityId, adminUser);
    return this.slotRepository.find({
      where: { amenity_id: amenity.id },
      order: { start_time: 'ASC' },
    });
  }
}
