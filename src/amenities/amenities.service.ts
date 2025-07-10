import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';
import { Amenity } from 'src/database/entities/amenity.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class AmenitiesService {
  constructor(
    @InjectRepository(Amenity)
    private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(AmenitySlot)
    private slotsRepository: Repository<AmenitySlot>,
  ) {}

  async findAll(user: User): Promise<Amenity[]> {
    if (!user.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
    if (user.society_status !== UserSocietyStatus.APPROVED) {
      throw new ForbiddenException(
        'You must be an approved member to view amenities.',
      );
    }

    return this.amenitiesRepository.find({
      where: { society_id: user.society_id },
    });
  }

  async findAvailableSlots(
    amenityId: string,
    date: string,
    user: User,
  ): Promise<any> {
    const amenity = await this.amenitiesRepository.findOneBy({ id: amenityId });
    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${amenityId} not found.`);
    }

    // Security Check: Ensure user is approved and looking at an amenity in their own society
    if (
      user.society_status !== UserSocietyStatus.APPROVED ||
      amenity.society_id !== user.society_id
    ) {
      throw new ForbiddenException(
        'You do not have permission to view slots for this amenity.',
      );
    }

    const requestedDate = new Date(date);
    const startOfDay = new Date(requestedDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(requestedDate.setUTCHours(23, 59, 59, 999));

    const slots = await this.slotsRepository.find({
      where: {
        amenity_id: amenityId,
        start_time: Between(startOfDay, endOfDay),
        is_active: true,
      },
      order: {
        start_time: 'ASC',
      },
    });

    return {
      slot_capacity: amenity.slot_capacity,
      available_slots: slots,
    };
  }
}
