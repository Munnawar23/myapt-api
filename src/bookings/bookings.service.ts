import {
  ConflictException,
  ForbiddenException, // <-- Import ForbiddenException
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AmenityBooking } from 'src/database/entities/amenity-booking.entity';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Amenity } from 'src/database/entities/amenity.entity';
import { BookingQueryDto } from './dto/booking-query.dto';
import { AmenitySlot } from 'src/database/entities/amenity-slot.entity';
import { User, UserSocietyStatus } from 'src/database/entities/user.entity'; // <-- Import User and Status Enum

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(AmenityBooking)
    private bookingsRepository: Repository<AmenityBooking>,
    @InjectRepository(AmenitySlot)
    private slotsRepository: Repository<AmenitySlot>,
    private dataSource: DataSource,
  ) {}

  async create(
    user: User, // <-- Change signature to accept the full User object
    createBookingDto: CreateBookingDto,
  ): Promise<AmenityBooking> {
    const { slot_id } = createBookingDto;

    // --- NEW SECURITY VALIDATIONS (before the transaction) ---
    // 1. Check if user is approved and part of a society
    if (
      !user.society_id ||
      user.society_status !== UserSocietyStatus.APPROVED
    ) {
      throw new ForbiddenException(
        'You must be an approved member of a society to make a booking.',
      );
    }

    // 2. Find the slot and its parent amenity to check the society ID
    const slotForValidation = await this.slotsRepository.findOne({
      where: { id: slot_id },
      relations: ['amenity'], // Eagerly load the amenity relationship
    });

    if (!slotForValidation) {
      throw new NotFoundException(`Amenity Slot with ID ${slot_id} not found.`);
    }

    // 3. The CRITICAL check: Does the amenity's society match the user's society?
    if (slotForValidation.amenity.society_id !== user.society_id) {
      throw new ForbiddenException(
        'You cannot book an amenity that does not belong to your society.',
      );
    }
    // --- END of new validations ---

    // Use a transaction to ensure data integrity
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Find the slot again and lock it for update to prevent race conditions
      const slot = await transactionalEntityManager
        .createQueryBuilder(AmenitySlot, 'slot')
        .innerJoinAndSelect('slot.amenity', 'amenity')
        .where('slot.id = :slot_id', { slot_id })
        .setLock('pessimistic_write')
        .getOne();

      // The slot must exist due to our check above, but as a safeguard:
      if (!slot) {
        throw new NotFoundException(
          `Amenity Slot with ID ${slot_id} not found.`,
        );
      }

      if (!slot.is_active) {
        throw new ConflictException(
          'This time slot is currently unavailable for booking.',
        );
      }

      // Check for available capacity
      if (slot.booked_count >= slot.amenity.slot_capacity) {
        throw new ConflictException('This time slot is already fully booked.');
      }

      // Check if this user has already booked this slot
      const existingBooking = await transactionalEntityManager.findOneBy(
        AmenityBooking,
        {
          slot_id: slot_id,
          user_id: user.id, // <-- Use user.id
        },
      );

      if (existingBooking) {
        throw new ConflictException('You have already booked this time slot.');
      }

      // Increment the booked count on the slot
      slot.booked_count += 1;
      await transactionalEntityManager.save(AmenitySlot, slot);

      // Create the new booking record
      const newBooking = transactionalEntityManager.create(AmenityBooking, {
        user_id: user.id, // <-- Use user.id
        slot_id: slot_id,
      });

      return transactionalEntityManager.save(AmenityBooking, newBooking);
    });
  }

  // The findForUser method remains the same and is already secure by using userId.
  async findForUser(
    userId: string,
    query: BookingQueryDto,
  ): Promise<AmenityBooking[]> {
    const findOptions: FindManyOptions<AmenityBooking> = {
      where: {
        user_id: userId,
        ...(query.status && { status: query.status }),
      },
      relations: ['slot', 'slot.amenity'],
      order: {
        // This will now sort by the booking creation time, not slot time.
        // It's a reasonable default. We can keep the in-memory sort if slot time is preferred.
      },
    };

    const bookings = await this.bookingsRepository.find(findOptions);
    // Sort in memory by the slot's start time
    return bookings.sort(
      (a, b) => b.slot.start_time.getTime() - a.slot.start_time.getTime(),
    );
  }
}
