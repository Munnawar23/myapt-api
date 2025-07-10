import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Amenity } from 'src/database/entities/amenity.entity';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';
import { Repository } from 'typeorm';
import { GenerateSlotsDto } from './dto/generate-slots.dto';

@Injectable()
export class SlotsAdminService {
  constructor(
    @InjectRepository(Amenity) private amenitiesRepository: Repository<Amenity>,
    @InjectRepository(AmenitySlot)
    private slotsRepository: Repository<AmenitySlot>,
  ) {}

  async generateSlots(
    amenityId: string,
    generateDto: GenerateSlotsDto,
  ): Promise<{ count: number }> {
    const amenity = await this.amenitiesRepository.findOneBy({ id: amenityId });
    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${amenityId} not found.`);
    }

    const slotsToCreate: Partial<AmenitySlot>[] = [];
    const startDate = new Date(generateDto.start_date);
    const endDate = new Date(generateDto.end_date);

    // Loop through each day in the provided date range
    for (
      let day = new Date(startDate);
      day <= endDate;
      day.setDate(day.getDate() + 1)
    ) {
      const [openHour, openMinute] = amenity.opening_time
        .split(':')
        .map(Number);
      const [closeHour, closeMinute] = amenity.closing_time
        .split(':')
        .map(Number);

      let currentSlotTime = new Date(day);
      currentSlotTime.setUTCHours(openHour, openMinute, 0, 0);

      const closingTime = new Date(day);
      closingTime.setUTCHours(closeHour, closeMinute, 0, 0);

      // Loop through the hours of the day, creating slots
      while (currentSlotTime < closingTime) {
        const slotStartTime = new Date(currentSlotTime);
        const slotEndTime = new Date(
          currentSlotTime.getTime() + amenity.slot_duration_minutes * 60000,
        );

        // Ensure we don't create a slot that extends beyond closing time
        if (slotEndTime > closingTime) {
          break;
        }

        slotsToCreate.push({
          amenity_id: amenityId,
          start_time: slotStartTime,
          end_time: slotEndTime,
          is_active: true,
        });

        currentSlotTime = slotEndTime;
      }
    }

    if (slotsToCreate.length === 0) {
      return { count: 0 };
    }

    // Use insert for performance. Use save with transaction for more complex logic.
    // 'onConflict' prevents creating duplicate slots for the same time.
    await this.slotsRepository
      .createQueryBuilder()
      .insert()
      .into(AmenitySlot)
      .values(slotsToCreate)
      .onConflict(`("amenity_id", "start_time") DO NOTHING`) // Assumes a unique constraint on these columns
      .execute();

    return { count: slotsToCreate.length };
  }

  async updateSlotStatus(
    slotId: string,
    isActive: boolean,
  ): Promise<AmenitySlot> {
    const slot = await this.slotsRepository.findOneBy({ id: slotId });
    if (!slot) {
      throw new NotFoundException(`Slot with ID ${slotId} not found.`);
    }
    slot.is_active = isActive;
    return this.slotsRepository.save(slot);
  }
}
