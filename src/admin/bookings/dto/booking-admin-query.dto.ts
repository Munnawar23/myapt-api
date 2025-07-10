import { IntersectionType } from '@nestjs/swagger';
import { BookingQueryDto } from 'src/bookings/dto/booking-query.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

// This combines the properties of both DTOs into a single new DTO.
// Admins can now use pagination, search, and status filtering.
export class BookingAdminQueryDto extends IntersectionType(
  PaginationQueryDto,
  BookingQueryDto,
) {}
