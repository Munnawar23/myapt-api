import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AmenityBooking } from 'src/database/entities/amenity-booking.entity';
import { PaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { Repository } from 'typeorm';
import { BookingAdminQueryDto } from './dto/booking-admin-query.dto';
import { User } from 'src/database/entities/user.entity'; // <-- Import User

@Injectable()
export class BookingsAdminService {
  constructor(
    @InjectRepository(AmenityBooking)
    private bookingsRepository: Repository<AmenityBooking>,
  ) {}

  async findAll(
    query: BookingAdminQueryDto,
    adminUser: User, // <-- Accept the admin user object
  ): Promise<PaginatedResponse<AmenityBooking>> {
    if (!adminUser.society_id) {
      throw new ForbiddenException('You are not associated with any society.');
    }
    const { limit, offset, search, status, sortBy, sortOrder } = query;

    const queryBuilder = this.bookingsRepository.createQueryBuilder('booking');

    // Join with necessary tables
    queryBuilder.innerJoinAndSelect('booking.user', 'user');
    // We need to join through the slot to get to the amenity for filtering
    queryBuilder.innerJoinAndSelect('booking.slot', 'slot');
    queryBuilder.innerJoinAndSelect('slot.amenity', 'amenity');

    // CRITICAL: Filter all bookings by the admin's society
    queryBuilder.where('amenity.society_id = :societyId', {
      societyId: adminUser.society_id,
    });

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR amenity.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Add status filtering
    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Apply sorting
    let sortColumn: string;
    if (sortBy === 'full_name' || sortBy === 'email') {
      sortColumn = `user.${sortBy}`;
    } else if (sortBy === 'name') {
      sortColumn = `amenity.name`;
    } else {
      sortColumn = `booking.${sortBy}`;
    }
    queryBuilder.orderBy(sortColumn, sortOrder);

    // Apply pagination
    queryBuilder.offset(offset).limit(limit);

    const data = await queryBuilder.getMany();

    return new PaginatedResponse(data, total, limit, query.page);
  }
}
